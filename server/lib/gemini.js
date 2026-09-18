import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

// Use Google's rolling alias names instead of a pinned version — Google
// retires/renames dated model names (gemini-3.6-flash, etc.) frequently
// enough that hardcoding one breaks without warning. These aliases always
// point at whatever the current stable model is.
// If the primary fails for ANY reason (overloaded, retired, network blip),
// fall through to the next one rather than failing the whole request.
const CHAT_MODELS = ["gemini-flash-latest", "gemini-flash-lite-latest"];

// This is a lookup task, not a reasoning task — the answer is already
// sitting in the document. Disabling "thinking" tokens cuts response time
// noticeably without hurting accuracy here.
const GENERATION_CONFIG = { thinkingConfig: { thinkingBudget: 0 } };

// Only the last N turns are sent back to the model each time — enough for
// real conversational continuity without the request growing unbounded as
// a chat gets long.
const MAX_HISTORY_TURNS = 12;

// Google's free embedding tier caps at 100 requests/minute. On a 429, it
// tells us how long to wait before retrying — honor that instead of just
// failing, so a large document succeeds (a bit slower) rather than erroring
// out the moment it brushes the quota.
function retryDelayMs(err, attempt) {
  const match = String(err.message || "").match(/retry in ([\d.]+)s/i);
  if (match) return Math.ceil(parseFloat(match[1]) * 1000) + 250;
  return 1000 * 2 ** attempt; // fallback exponential backoff
}

export async function embedText(text, attempt = 0) {
  try {
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
  } catch (err) {
    if (err.status === 429 && attempt < 5) {
      await new Promise((r) => setTimeout(r, retryDelayMs(err, attempt)));
      return embedText(text, attempt + 1);
    }
    throw err;
  }
}

// Keep concurrency modest — bursting many requests at once is what tips a
// large document over the per-minute quota in the first place.
const EMBED_CONCURRENCY = 4;

export async function embedBatch(texts) {
  const vectors = new Array(texts.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < texts.length) {
      const i = nextIndex++;
      vectors[i] = await embedText(texts[i]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(EMBED_CONCURRENCY, texts.length) }, worker));
  return vectors;
}

async function generateWithFallback(systemInstruction, contents) {
  let lastErr;
  for (const modelName of CHAT_MODELS) {
    // Not every model accepts thinkingConfig (some reject it with a 400) —
    // try the fast path first, then retry the same model plainly before
    // giving up on it entirely.
    for (const generationConfig of [GENERATION_CONFIG, undefined]) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName, systemInstruction, generationConfig });
        const result = await model.generateContent({ contents });
        return cleanAnswer(result.response.text());
      } catch (err) {
        console.error(`[gemini] ${modelName}${generationConfig ? "" : " (no thinkingConfig)"} failed (${err.status ?? "network"})`);
        lastErr = err;
        if (err.status !== 400) break; // only worth retrying same model on a 400
      }
    }
  }
  throw lastErr;
}

// Strip markdown the model adds despite being told not to (** bold, # headers,
// bullet markers) so the reply reads like a person typed it, not a bot —
// but leave fenced code blocks completely alone, since Java doc-comments
// and bullet-like syntax inside code would otherwise get mangled by the
// same regexes that clean up prose.
function cleanAnswer(text) {
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts
    .map((part, i) => {
      if (i % 2 === 1) return part; // odd indices are the code-fence chunks
      return part
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/^#{1,6}\s*/gm, "")
        .replace(/^[-*]\s+/gm, "");
    })
    .join("")
    .trim();
}

const STYLE_RULES = `Answer directly like a knowledgeable person would in a text message — no "Based on the document" preamble, no markdown formatting in your prose (no **, no bullet points, no headers), just plain, natural sentences. The one exception is actual code: when explaining or teaching code, or when asked for an example, write real code in a fenced code block (triple backticks with the language name) so it's clearly distinguishable from prose — don't just describe code in words when showing it would teach better.`;

// Gemini's chat turns use role "user" or "model" (not "assistant").
function toContents(history, question) {
  const trimmed = (history || []).slice(-MAX_HISTORY_TURNS);
  const turns = trimmed.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.text }],
  }));
  turns.push({ role: "user", parts: [{ text: question }] });
  return turns;
}

export async function askGemini(question, { fullText, chunks, history } = {}) {
  const hasDocument = Boolean(fullText || (chunks && chunks.length));
  const contents = toContents(history, question);

  if (!hasDocument) {
    // No document uploaded yet — general chat so people aren't stuck at a
    // blank screen, but it should nudge toward the actual point of the app.
    const systemInstruction = `You're DocMind, a helpful assistant having an ongoing conversation. No document has been uploaded yet, so just chat normally and answer whatever's asked using your own knowledge, remembering what's already been said earlier in this conversation. If it feels natural, you can mention that uploading a PDF lets you answer questions grounded in that specific document, but don't force that into every reply — only when it's actually relevant (e.g. they ask about a document, or ask what you can do).

${STYLE_RULES}`;
    return generateWithFallback(systemInstruction, contents);
  }

  const context = fullText
    ? fullText
    : chunks.map((c, i) => `[Excerpt ${i + 1}]\n${c.text}`).join("\n\n");

  const systemInstruction = `You're an assistant having an ongoing conversation about a document on someone's behalf. You are NOT the person or subject described in the document — never say "I" as if you were them (e.g. never say "I have 5 years of experience" or "I know how to code"). Refer to whoever the document is about in the third person, by name if it's known, or "the document's subject" if not. If the person asks something about themselves ("do I have...", "what's my..."), still describe it in third person about the document's content, not as your own claim.

Remember what's already been discussed earlier in this conversation — if someone says "are you sure?" or "why?" or refers back to something without repeating it, they mean the thing you just said, not a fresh unrelated question.

There are three different kinds of messages, and they need different treatment:
1. Facts specifically about the document or its subject (dates, names, figures, what it says or doesn't say) — stay strictly grounded in the text below. If it's not there, say so plainly instead of guessing.
2. Requests to explain, teach, or elaborate on a concept, technology, or topic the document mentions (e.g. "explain how this works", "what is Comparator", "teach me this") — for these, use your full general knowledge to actually explain properly, using the document as context for what specifically to explain. Don't refuse these just because the deep explanation itself isn't written out in the document — that's the whole point of asking.
3. Casual remarks, greetings, or reactions that aren't really questions at all (e.g. "wow that was fast", "hi", "thanks", typos/small talk with no real query in them) — just respond briefly and naturally like a person would react to that comment. Don't force these into a document summary or a generic "ask me anything" filler line — actually react to what they said.

${STYLE_RULES}

DOCUMENT:
${context}`;

  return generateWithFallback(systemInstruction, contents);
}
