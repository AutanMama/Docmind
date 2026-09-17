import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyButton({ text, align = "left" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can fail (permissions, insecure context) — not worth
      // surfacing an error for a copy button, just silently no-op.
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1 mt-1 text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors ${
        align === "right" ? "self-end" : "self-start"
      }`}
      aria-label="Copy message"
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
