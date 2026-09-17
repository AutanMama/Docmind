import { useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import ChatPanel from "./components/ChatPanel";

// In local dev this is empty and requests go through Vite's proxy (see
// vite.config.js) to localhost:5051. In production, set VITE_API_URL to
// the deployed backend's URL — client and server are separate deployments
// with no proxy between them.
const API_URL = import.meta.env.VITE_API_URL || "";

export default function App() {
  const [doc, setDoc] = useState(null); // { docId, fileName, chunkCount }
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [messages, setMessages] = useState([]); // { role, text, displayText?, typing? }
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const fileInputRef = useRef(null);

  // Reveals the most recent assistant message a few characters at a time so
  // it reads like it's being typed, instead of the full answer appearing
  // all at once after the request resolves.
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant" || !last.typing) return;

    const interval = setInterval(() => {
      setMessages((prev) => {
        const msgs = [...prev];
        const target = msgs[msgs.length - 1];
        if (!target || !target.typing) return prev;

        const nextLength = Math.min(target.displayText.length + 3, target.text.length);
        const done = nextLength >= target.text.length;
        msgs[msgs.length - 1] = {
          ...target,
          displayText: target.text.slice(0, nextLength),
          typing: !done,
        };
        return msgs;
      });
    }, 12);

    return () => clearInterval(interval);
  }, [messages]);

  const addTypedMessage = (text) => {
    setMessages((m) => [...m, { role: "assistant", text, displayText: "", typing: true }]);
  };

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
      addTypedMessage(`I've read "${data.fileName}" (${data.chunkCount} sections). Ask me anything about it.`);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim() || asking) return;

    const q = question.trim();
    setMessages((m) => [...m, { role: "user", text: q, displayText: q }]);
    setQuestion("");
    setAsking(true);

    try {
      const res = await fetch(`${API_URL}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docId: doc?.docId, question: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      addTypedMessage(data.answer);
    } catch (err) {
      addTypedMessage(`Error: ${err.message}`);
    } finally {
      setAsking(false);
    }
  };

  const reset = () => {
    setDoc(null);
    setMessages([]);
    setUploadError("");
  };

  const chatActive = messages.length > 0;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[var(--bg)]">
      <Header chatActive={chatActive} hasDoc={Boolean(doc)} onReset={reset} />

      <main className="flex-1 min-h-0">
        <ChatPanel
          doc={doc}
          messages={messages}
          asking={asking}
          uploading={uploading}
          uploadError={uploadError}
          question={question}
          setQuestion={setQuestion}
          onAsk={handleAsk}
          onFileSelect={handleFile}
          fileInputRef={fileInputRef}
        />
      </main>
    </div>
  );
}
