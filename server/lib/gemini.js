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

export async function embedText(text) {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}

export async function embedBatch(texts) {
  const vectors = [];
  for (const text of texts) {
    vectors.push(await embedText(text));
  }
  return vectors;
}

async function generateWithFallback(prompt) {
  let lastErr;
  for (const modelName of CHAT_MODELS) {
    // Not every model accepts thinkingConfig (some reject it with a 400) —
    // try the fast path first, then retry the same model plainly before
    // giving up on it entirely.
    for (const generationConfig of [GENERATION_CONFIG, undefined]) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName, generationConfig });
        const result = await model.generateContent(prompt);
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

export async function askGemini(question, { fullText, chunks } = {}) {
  const context = fullText
    ? fullText
    : chunks.map((c, i) => `[Excerpt ${i + 1}]\n${c.text}`).join("\n\n");

  const prompt = `You're an assistant answering questions about a document on someone's behalf. You are NOT the person or subject described in the document — never say "I" as if you were them (e.g. never say "I have 5 years of experience" or "I know how to code"). Refer to whoever the document is about in the third person, by name if it's known, or "the document's subject" if not. If the person asks something about themselves ("do I have...", "what's my..."), still describe it in third person about the document's content, not as your own claim.

There are two different kinds of questions, and they need different treatment:
1. Facts specifically about the document or its subject (dates, names, figures, what it says or doesn't say) — stay strictly grounded in the text below. If it's not there, say so plainly instead of guessing.
2. Requests to explain, teach, or elaborate on a concept, technology, or topic the document mentions (e.g. "explain how this works", "what is Comparator", "teach me this") — for these, use your full general knowledge to actually explain properly, using the document as context for what specifically to explain. Don't refuse these just because the deep explanation itself isn't written out in the document — that's the whole point of asking.

Answer directly like a knowledgeable person would in a text message — no "Based on the document" preamble, no markdown formatting in your prose (no **, no bullet points, no headers), just plain, natural sentences. The one exception is actual code: when explaining or teaching code, or when asked for an example, write real code in a fenced code block (triple backticks with the language name) so it's clearly distinguishable from prose — don't just describe code in words when showing it would teach better.

DOCUMENT:
${context}

Question: ${question}

Answer:`;

  return generateWithFallback(prompt);
}
