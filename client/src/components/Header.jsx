import { FileText, X } from "lucide-react";

export default function Header({ chatActive, hasDoc, onReset }) {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)] px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
          <FileText size={17} className="text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight">DocMind</span>
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
