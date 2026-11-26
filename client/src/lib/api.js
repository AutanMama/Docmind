// In local dev this is empty and requests go through Vite's proxy (see
// vite.config.js) to localhost:5051. In production, set VITE_API_URL to the
// deployed backend's URL: client and server are separate deployments.
const API_URL = import.meta.env.VITE_API_URL || ''

async function readJson(res, fallback) {
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || fallback)
  return data
}

// Returns { docId, fileName, chunkCount }.
export async function uploadDocument(file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${API_URL}/api/upload`, { method: 'POST', body: formData })
  return readJson(res, 'Upload failed')
}

// Returns { answer, sources: [{ text, score }] }. Sources are only present
// when the server answered from retrieved passages of a large document.
export async function askQuestion({ docId, question, history }) {
  const res = await fetch(`${API_URL}/api/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ docId, question, history }),
  })
  return readJson(res, 'Something went wrong')
}
