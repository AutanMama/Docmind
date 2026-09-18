import { X, Menu } from "lucide-react";
import BrandMark from "./BrandMark";

export default function Header({ chatActive, hasDoc, onReset, onToggleHistory }) {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)] px-4 md:px-6 py-2.5 md:py-4 flex items-center justify-between">
      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={onToggleHistory}
          className="p-1.5 -ml-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg)] transition-colors"
          aria-label="Chat history"
        >
          <Menu size={19} />
        </button>
        <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
          <BrandMark size={15} className="text-[var(--accent)]" />
        </div>
        <span className="font-bold text-base md:text-lg tracking-tight">DocMind</span>
      </div>
      {chatActive && (
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X size={15} /> {hasDoc ? "New document" : "Start over"}
        </button>
      )}
    </header>
  );
}
