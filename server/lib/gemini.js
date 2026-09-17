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
// bullet markers) so the reply reads like a person typed it, not a bot.
function cleanAnswer(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .trim();
}

export async function askGemini(question, { fullText, chunks } = {}) {
  const context = fullText
    ? fullText
    : chunks.map((c, i) => `[Excerpt ${i + 1}]\n${c.text}`).join("\n\n");

  const prompt = `You're an assistant answering questions about a document on someone's behalf. You are NOT the person or subject described in the document — never say "I" as if you were them (e.g. never say "I have 5 years of experience" or "I know how to code"). Refer to whoever the document is about in the third person, by name if it's known, or "the document's subject" if not. If the person asks something about themselves ("do I have...", "what's my..."), still describe it in third person about the document's content, not as your own claim.

Answer directly like a knowledgeable person would in a text message — no "Based on the document" preamble, no markdown formatting (no **, no bullet points, no headers), just plain, natural sentences. If the document doesn't cover the question, say so plainly instead of guessing.

DOCUMENT:
${context}

Question: ${question}

Answer:`;

  return generateWithFallback(prompt);
}
