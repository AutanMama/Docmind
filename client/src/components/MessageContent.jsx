import { parseContent } from "../utils/parseContent";

export default function MessageContent({ text }) {
  return parseContent(text).map((seg, i) =>
    seg.type === "code" ? (
      <pre key={i} className="my-2 p-3 rounded-lg bg-[#0f172a] text-[#e2e8f0] text-xs whitespace-pre-wrap break-words">
        <code>{seg.content}</code>
      </pre>
    ) : (
      <span key={i}>{seg.content}</span>
    )
  );
}
