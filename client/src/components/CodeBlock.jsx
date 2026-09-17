import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CodeBlock({ lang, content }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can fail (permissions, insecure context) — not worth
      // surfacing an error for a copy button, just silently no-op.
    }
  };

  return (
    <div className="my-2 rounded-lg overflow-hidden bg-[#0f172a]">
      <div className="flex items-center justify-between px-3 py-1.5 bg-white/5 border-b border-white/10">
        <span className="text-[10px] uppercase tracking-wide text-white/40">{lang || "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-white/50 hover:text-white transition-colors"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-3 text-[#e2e8f0] text-xs whitespace-pre-wrap break-words overflow-x-hidden">
        <code>{content}</code>
      </pre>
    </div>
  );
}
