import { useRef, useState } from "react";
import { FileText, Upload, Send, Loader2, X, FileCheck2 } from "lucide-react";

// In local dev this is empty and requests go through Vite's proxy (see
// vite.config.js) to localhost:5051. In production, set VITE_API_URL to
// the deployed backend's URL — client and server are separate deployments
// with no proxy between them.
const API_URL = import.meta.env.VITE_API_URL || "";

export default function App() {
  const [doc, setDoc] = useState(null); // { docId, fileName, chunkCount }
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [messages, setMessages] = useState([]); // { role: 'user'|'assistant', text }
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setUploadError("Please upload a PDF file.");
      return;
    }
    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_URL}/api/upload`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setDoc(data);
      setMessages([
        { role: "assistant", text: `I've read "${data.fileName}" (${data.chunkCount} sections). Ask me anything about it.` },
      ]);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim() || !doc || asking) return;

    const q = question.trim();
    setMessages((m) => [...m, { role: "user", text: q }]);
    setQuestion("");
    setAsking(true);

    try {
      const res = await fetch(`${API_URL}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docId: doc.docId, question: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setMessages((m) => [...m, { role: "assistant", text: data.answer }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", text: `Error: ${err.message}` }]);
    } finally {
      setAsking(false);
    }
  };

  const reset = () => {
    setDoc(null);
    setMessages([]);
    setUploadError("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--border)] bg-[var(--surface)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <FileText size={17} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">DocMind</span>
        </div>
        {doc && (
          <button
            onClick={reset}
            className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X size={15} /> New document
          </button>
        )}
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        {!doc ? (
          <div
            className="w-full max-w-lg border-2 border-dashed border-[var(--border)] rounded-2xl bg-[var(--surface)] p-12 flex flex-col items-center text-center cursor-pointer hover:border-[var(--accent)] transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFile(e.dataTransfer.files[0]);
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
            {uploading ? (
              <>
                <Loader2 size={32} className="text-[var(--accent)] animate-spin mb-4" />
                <p className="font-medium">Reading your document…</p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center mb-4">
                  <Upload size={24} className="text-[var(--accent)]" />
                </div>
                <p className="font-semibold mb-1">Drop a PDF here, or click to upload</p>
                <p className="text-sm text-[var(--text-muted)]">Ask questions and get answers grounded in the document</p>
              </>
            )}
            {uploadError && <p className="text-sm text-red-500 mt-4">{uploadError}</p>}
          </div>
        ) : (
          <div className="w-full max-w-2xl h-[70vh] flex flex-col bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-[var(--border)] bg-[var(--accent-soft)]">
              <FileCheck2 size={16} className="text-[var(--accent)]" />
              <span className="text-sm font-medium truncate">{doc.fileName}</span>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-[var(--accent)] text-white rounded-br-sm"
                        : "bg-[var(--bg)] text-[var(--text-primary)] rounded-bl-sm"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {asking && (
                <div className="flex justify-start">
                  <div className="bg-[var(--bg)] px-4 py-2.5 rounded-2xl rounded-bl-sm">
                    <Loader2 size={16} className="animate-spin text-[var(--text-muted)]" />
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleAsk} className="flex items-center gap-2 p-3 border-t border-[var(--border)]">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question about this document…"
                className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] focus:outline-none focus:border-[var(--accent)] text-sm"
              />
              <button
                type="submit"
                disabled={asking || !question.trim()}
                className="p-2.5 rounded-xl bg-[var(--accent)] text-white disabled:opacity-40 transition-opacity"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
