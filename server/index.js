import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import { randomUUID } from "crypto";
import { PDFParse } from "pdf-parse";
import { embedText, embedBatch, askGemini } from "./lib/gemini.js";
import { chunkText, saveDocument, getDocument, topMatches, FULL_TEXT_THRESHOLD } from "./lib/store.js";

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

// Provider errors (Gemini, etc.) come back as long raw JSON blobs meant for
// developers, not end users. Log the real thing server-side, but only ever
// show people a short, human sentence.
function friendlyError(err) {
  const msg = String(err.message || "");
  if (err.status === 429 || /quota|rate limit/i.test(msg)) {
    return "This document is large and hit a temporary rate limit. Please try uploading it again in a minute.";
  }
  if (err.status === 400) return "That file couldn't be read as a PDF — please check it's not corrupted.";
  return "Something went wrong processing that document. Please try again.";
}

app.use(cors());
app.use(express.json());

app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const parser = new PDFParse({ data: req.file.buffer });
    const { text } = await parser.getText();

    if (!text || !text.trim()) {
      return res.status(422).json({ error: "Couldn't extract any text from this PDF" });
    }

    const cleanText = text.replace(/\s+/g, " ").trim();
    const isSmallDoc = cleanText.length <= FULL_TEXT_THRESHOLD;

    const chunkTexts = chunkText(text);
    // Small documents get answered from the full text directly (more
    // accurate, see store.js) so there's no need to spend embedding calls
    // on them — only embed when we'll actually use retrieval.
    let chunks = chunkTexts.map((t) => ({ text: t, embedding: null }));
    if (!isSmallDoc) {
      const embeddings = await embedBatch(chunkTexts);
      chunks = chunkTexts.map((t, i) => ({ text: t, embedding: embeddings[i] }));
    }

    const docId = randomUUID();
    saveDocument(docId, req.file.originalname, chunks, isSmallDoc ? cleanText : null);

    res.json({ docId, fileName: req.file.originalname, chunkCount: chunks.length });
  } catch (err) {
    console.error("[upload] failed:", err);
    res.status(500).json({ error: friendlyError(err) });
  }
});

app.post("/api/ask", async (req, res) => {
  try {
    const { docId, question, history } = req.body;
    if (!question) return res.status(400).json({ error: "question is required" });

    // No document yet — general chat mode, so people aren't stuck at a
    // blank screen before they've uploaded anything.
    if (!docId) {
      const answer = await askGemini(question, { history });
      return res.json({ answer, sources: [] });
    }

    const doc = getDocument(docId);
    if (!doc) return res.status(404).json({ error: "Document not found — upload it again" });

    if (doc.fullText) {
      const answer = await askGemini(question, { fullText: doc.fullText, history });
      return res.json({ answer, sources: [] });
    }

    const queryEmbedding = await embedText(question);
    const matches = topMatches(docId, queryEmbedding);
    const answer = await askGemini(question, { chunks: matches, history });

    res.json({ answer, sources: matches.map((m) => ({ text: m.text, score: m.score })) });
  } catch (err) {
    console.error("[ask] failed:", err);
    res.status(500).json({ error: friendlyError(err) });
  }
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5051;
app.listen(PORT, () => console.log(`DocMind API running on http://localhost:${PORT}`));

// Render's free tier sleeps this service after ~15 minutes with no incoming
// traffic. Pinging our own public URL every 10 minutes counts as real
// traffic (it's a genuine round trip out to the internet and back), so this
// keeps the service awake without needing an external uptime monitor.
// RENDER_EXTERNAL_URL is set automatically by Render — nothing to configure.
// This is a no-op locally and on any host that doesn't set that variable.
if (process.env.RENDER_EXTERNAL_URL) {
  setInterval(() => {
    fetch(`${process.env.RENDER_EXTERNAL_URL}/api/health`).catch(() => {});
  }, 10 * 60 * 1000);
}
