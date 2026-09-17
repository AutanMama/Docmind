# DocMind

Upload a PDF, ask questions about it, get answers grounded in the document — a minimal RAG (retrieval-augmented generation) pipeline built on Google's free Gemini API.

## How it works

1. Upload a PDF → server extracts text and splits it into overlapping chunks.
2. Each chunk is embedded with Gemini's `text-embedding-004` model and kept in memory.
3. A question is embedded the same way; the chunks with the closest cosine similarity are pulled as context.
4. `gemini-1.5-flash` answers using only those chunks — it's told to say "I don't know" if the document doesn't cover it.

## Stack

- **Client**: React + Vite, Tailwind CSS v4
- **Server**: Express, `pdf-parse`, `@google/generative-ai`
- **Storage**: in-memory (resets on restart — this is a demo, not a production document store)

## Running locally

Get a free Gemini API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) — no credit card required.

```bash
# Server
cd server
cp .env.example .env   # paste your GEMINI_API_KEY in here
npm install
npm run dev             # http://localhost:5051

# Client (separate terminal)
cd client
npm install
npm run dev              # http://localhost:5173
```

## Deploying

**Server (Render)**
1. New Web Service → point at this repo, root directory `server`
2. Build command: `npm install` · Start command: `npm start`
3. Add environment variable `GEMINI_API_KEY`

**Client (Vercel)**
1. Import this repo, root directory `client`
2. Add environment variable `VITE_API_URL` = your Render service's URL
3. Deploy — framework preset auto-detects Vite
