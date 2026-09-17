import { useEffect, useRef } from "react";
import { Send, FileCheck2, Paperclip, Loader2, ShieldCheck, GraduationCap, FileText, Sparkles } from "lucide-react";
import MessageContent from "./MessageContent";
import CopyButton from "./CopyButton";
import TypingDots from "./TypingDots";

const FEATURES = [
  { icon: ShieldCheck, title: "Grounded", desc: "Facts come straight from your document, never guessed." },
  { icon: GraduationCap, title: "Explains", desc: "Ask it to teach a concept and it will, with real examples." },
  { icon: FileText, title: "Any PDF", desc: "Attach one anytime with the clip icon below." },
];

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-semibold mb-4">
        <Sparkles size={13} />
        AI Document Assistant
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-2">Ask me anything</h1>
      <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-8">
        Chat freely, or attach a PDF with the clip icon below to get answers grounded in that specific document.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-md text-left">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
            <Icon size={16} className="text-[var(--accent)] mb-1.5" />
            <p className="text-xs font-semibold mb-0.5">{title}</p>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ChatPanel({
  doc,
  messages,
  asking,
  uploading,
  uploadError,
  question,
  setQuestion,
  onAsk,
  onFileSelect,
  fileInputRef,
  bottomRef,
}) {
  const textareaRef = useRef(null);

  // Auto-grow the textarea as text wraps to multiple lines, capped so it
  // doesn't take over the whole panel.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [question]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onAsk(e);
    }
    // Shift+Enter falls through to the textarea's default behavior (newline).
  };

  return (
    <div className="w-full max-w-2xl h-[80vh] flex flex-col bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
      {doc && (
        <div className="flex items-center gap-2 px-5 py-3 border-b border-[var(--border)] bg-[var(--accent-soft)]">
          <FileCheck2 size={16} className="text-[var(--accent)]" />
          <span className="text-sm font-medium truncate">{doc.fileName}</span>
        </div>
      )}

      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-[var(--accent)] text-white rounded-br-sm"
                    : "bg-[var(--bg)] text-[var(--text-primary)] rounded-bl-sm"
                }`}
              >
                <MessageContent text={m.displayText} />
              </div>
              <CopyButton text={m.text} align={m.role === "user" ? "right" : "left"} />
            </div>
          ))}
          {asking && (
            <div className="flex justify-start">
              <div className="bg-[var(--bg)] rounded-2xl rounded-bl-sm">
                <TypingDots />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      <div className="border-t border-[var(--border)] p-3">
        {uploading && (
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] px-1 pb-2">
            <Loader2 size={13} className="animate-spin" /> Reading your document…
          </div>
        )}
        {uploadError && <p className="text-xs text-red-500 px-1 pb-2">{uploadError}</p>}

        <form onSubmit={onAsk} className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => onFileSelect(e.target.files[0])}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach a PDF"
            className="p-2.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
          >
            <Paperclip size={18} />
          </button>
          <textarea
            ref={textareaRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={doc ? "Ask a question about this document…" : "Ask me anything, or attach a PDF…"}
            rows={1}
            className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] focus:outline-none focus:border-[var(--accent)] text-sm resize-none leading-relaxed"
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
    </div>
  );
}
