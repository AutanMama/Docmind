import { parseContent } from "../utils/parseContent";
import CodeBlock from "./CodeBlock";

export default function MessageContent({ text }) {
  return parseContent(text).map((seg, i) =>
    seg.type === "code" ? (
      <CodeBlock key={i} lang={seg.lang} content={seg.content} />
    ) : (
      <span key={i}>{seg.content}</span>
    )
  );
}
