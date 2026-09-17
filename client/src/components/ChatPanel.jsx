import { useEffect, useRef } from "react";
import { Send, FileCheck2, Paperclip, Loader2, ShieldCheck, GraduationCap, FileText, User } from "lucide-react";
import BrandMark from "./BrandMark";
import MessageContent from "./MessageContent";
import CopyButton from "./CopyButton";
import TypingDots from "./TypingDots";

const FEATURES = [
  { icon: ShieldCheck, title: "Grounded", desc: "Facts come straight from your document." },
  { icon: GraduationCap, title: "Explains", desc: "Teaches concepts with real examples." },
  { icon: FileText, title: "Any PDF", desc: "Attach one with the clip icon." },
];

function Avatar({ role }) {
  return role === "user" ? (
    <div className="w-8 h-8 shrink-0 rounded-full bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center">
      <User size={15} className="text-[var(--text-secondary)]" />
    </div>
  ) : (
    <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-[var(--accent)] to-indigo-500 flex items-center justify-center shadow-sm">
      <BrandMark size={15} className="text-[var(--accent)]" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center justify-center text-center px-5 py-4">
      <div className="w-11 h-11 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/20 mb-3 md:mb-5">
        <BrandMark size={20} className="text-[var(--accent)]" />
      </div>
      <h1 className="text-lg md:text-3xl font-bold tracking-tight mb-1.5 md:mb-2">Ask me anything</h1>
      <p className="text-xs md:text-sm text-[var(--text-secondary)] max-w-sm mb-4 md:mb-8">
        Chat freely, or attach a PDF to get answers grounded in that document.
      </p>
      <div className="grid grid-cols-3 gap-2 md:gap-3 w-full max-w-md text-left">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="p-2 md:p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors"
          >
            <Icon size={14} className="text-[var(--accent)] mb-1 md:mb-1.5" />
            <p className="text-[11px] md:text-xs font-semibold mb-0.5">{title}</p>
            <p className="hidden md:block text-[11px] text-[var(--text-muted)] leading-relaxed">{desc}</p>
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
}) {
  const textareaRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const isAtBottomRef = useRef(true);

  // Auto-grow the textarea as text wraps to multiple lines, capped so it
  // doesn't take over the whole panel.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [question]);

  // Only auto-follow new content (including the typewriter reveal ticking
  // in character by character) when the user hasn't scrolled away from the
  // bottom — otherwise every tick of the typing animation would yank them
  // back down while they're trying to read something above. The one
  // exception: sending your own message always jumps to the bottom, same
  // as any normal chat app, regardless of where you'd scrolled to.
  const prevCountRef = useRef(0);
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const justSentOwnMessage =
      messages.length > prevCountRef.current && messages[messages.length - 1]?.role === "user";
    prevCountRef.current = messages.length;

    if (justSentOwnMessage) isAtBottomRef.current = true;
    if (!isAtBottomRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, asking]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onAsk(e);
    }
    // Shift+Enter falls through to the textarea's default behavior (newline).
  };

  return (
    <div className="relative h-full flex flex-col overflow-hidden">
      {/* Subtle decorative glow so the full-bleed layout doesn't feel bare */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-400/5 rounded-full blur-[100px] pointer-events-none" />

      {doc && (
        <div className="relative flex items-center gap-2 px-4 md:px-8 py-3 border-b border-[var(--border)] bg-[var(--accent-soft)]">
          <FileCheck2 size={16} className="text-[var(--accent)]" />
          <span className="text-sm font-medium truncate">{doc.fileName}</span>
        </div>
      )}

      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="relative flex-1 min-h-0 overflow-y-auto px-4 md:px-8 py-6"
        >
          <div className="max-w-3xl mx-auto space-y-5">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <Avatar role={m.role} />
                <div className={`flex flex-col max-w-[75%] ${m.role === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                      m.role === "user"
                        ? "bg-[var(--accent)] text-white rounded-br-sm"
                        : "bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] rounded-bl-sm"
                    }`}
                  >
                    <MessageContent text={m.displayText} />
                  </div>
                  <CopyButton text={m.text} align={m.role === "user" ? "right" : "left"} />
                </div>
              </div>
            ))}
            {asking && (
              <div className="flex gap-3">
                <Avatar role="assistant" />
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl rounded-bl-sm shadow-sm">
                  <TypingDots />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="relative border-t border-[var(--border)] bg-[var(--bg)] p-3 md:p-4">
        <div className="max-w-3xl mx-auto">
          {uploading && (
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] px-1 pb-2">
              <Loader2 size={13} className="animate-spin" /> Reading your document…
            </div>
          )}
          {uploadError && <p className="text-xs text-red-500 px-1 pb-2">{uploadError}</p>}

          <form
            onSubmit={onAsk}
            className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm p-1.5 focus-within:border-[var(--accent)] transition-colors"
          >
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
              className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
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
              className="flex-1 px-2 py-2 bg-transparent focus:outline-none text-sm resize-none leading-relaxed"
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
    </div>
  );
}
