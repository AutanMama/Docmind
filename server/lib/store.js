// In-memory document store. Resets on server restart — fine for a demo;
// swap for SQLite/Postgres if this ever needs to persist across restarts.
const documents = new Map();

// Larger chunks mean fewer embedding API calls per document — important
// since Gemini's free embedding tier caps out at 100 requests/minute, and a
// 90+ page PDF at the old 900-char chunk size could need 150+ calls on its
// own, blowing through that quota before the upload even finishes.
export function chunkText(text, chunkSize = 3000, overlap = 300) {
  const clean = text.replace(/\s+/g, " ").trim();
  const chunks = [];
  let start = 0;
  while (start < clean.length) {
    const end = Math.min(start + chunkSize, clean.length);
    chunks.push(clean.slice(start, end));
    start += chunkSize - overlap;
  }
  return chunks;
}

export function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function saveDocument(id, fileName, chunks, fullText) {
  documents.set(id, { fileName, chunks, fullText });
}

// Small documents (roughly under ~12 pages of text) are cheap enough to send
// to the model in full — retrieval only picks the "closest" few chunks by
// embedding similarity, which can miss an answer that's stated plainly
// elsewhere in a short document (e.g. a one-line summary vs. detailed body
// text scoring higher on a keyword-heavy question). RAG earns its keep on
// documents too large to fit in context at all.
export const FULL_TEXT_THRESHOLD = 30000;

export function getDocument(id) {
  return documents.get(id);
}

export function topMatches(id, queryEmbedding, k = 4) {
  const doc = documents.get(id);
  if (!doc) return [];
  return doc.chunks
    .map((c) => ({ ...c, score: cosineSimilarity(c.embedding, queryEmbedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
