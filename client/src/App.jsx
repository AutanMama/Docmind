import { useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import ChatPanel from "./components/ChatPanel";
import HistorySidebar from "./components/HistorySidebar";
import { getAllChats, saveChat, deleteChat } from "./utils/chatStorage";

// In local dev this is empty and requests go through Vite's proxy (see
// vite.config.js) to localhost:5051. In production, set VITE_API_URL to
// the deployed backend's URL — client and server are separate deployments
// with no proxy between them.
const API_URL = import.meta.env.VITE_API_URL || "";

function newChatId() {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
}

export default function App() {
  const [chatId, setChatId] = useState(newChatId);
  const [chats, setChats] = useState(getAllChats);
  const [historyOpen, setHistoryOpen] = useState(false);

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

  // Persist this conversation to localStorage any time it changes, so it
  // shows up in the history sidebar and survives a page refresh.
  useEffect(() => {
    if (messages.length === 0) return;
    saveChat(chatId, messages, doc?.fileName);
    setChats(getAllChats());
  }, [messages, chatId, doc?.fileName]);

  const addTypedMessage = (text, isError = false) => {
    setMessages((m) => [...m, { role: "assistant", text, displayText: "", typing: true, isError }]);
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
      // Send prior turns along so the model has conversational memory
      // (e.g. "are you sure?" needs to know what it's referring back to).
      // Failed exchanges are excluded — otherwise a network hiccup shows up
      // in the model's memory as a real reply, and it starts reacting to
      // "Error: Failed to fetch" as if it were something you actually said.
      const history = messages.filter((m) => !m.isError).map((m) => ({ role: m.role, text: m.text }));
      const res = await fetch(`${API_URL}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docId: doc?.docId, question: q, history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      addTypedMessage(data.answer);
    } catch (err) {
      addTypedMessage(`Sorry, that didn't go through: ${err.message}. Try sending it again.`, true);
    } finally {
      setAsking(false);
    }
  };

  const reset = () => {
    setChatId(newChatId());
    setDoc(null);
    setMessages([]);
    setUploadError("");
    setHistoryOpen(false);
  };

  const handleSelectChat = (id) => {
    const chat = chats.find((c) => c.id === id);
    if (!chat) return;
    setChatId(id);
    setMessages(chat.messages.map((m) => ({ ...m, displayText: m.text, typing: false })));
    // The original document isn't recoverable after a server restart (it's
    // only kept in memory) — resuming here continues the conversation in
    // general-chat mode. Reattach the PDF to make it grounded again.
    setDoc(null);
    setUploadError("");
    setHistoryOpen(false);
  };

  const handleDeleteChat = (id) => {
    deleteChat(id);
    setChats(getAllChats());
    if (id === chatId) reset();
  };

  const chatActive = messages.length > 0;

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-[var(--bg)]">
      <Header
        chatActive={chatActive}
        hasDoc={Boolean(doc)}
        onReset={reset}
        onToggleHistory={() => setHistoryOpen((v) => !v)}
      />

      <HistorySidebar
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        chats={chats}
        activeChatId={chatId}
        onSelectChat={handleSelectChat}
        onNewChat={reset}
        onDeleteChat={handleDeleteChat}
      />

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
