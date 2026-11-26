import CodeBlock from '../ui/CodeBlock'
import { parseBlocks, splitInline } from '../../lib/parseContent'

function Inline({ text }) {
  return splitInline(text).map((run, i) => {
    if (run.type === 'bold') return <strong key={i} className="font-semibold">{run.content}</strong>
    if (run.type === 'code') return <code key={i} className="rounded bg-desk px-1.5 py-0.5 font-mono text-[0.85em]">{run.content}</code>
    return <span key={i}>{run.content}</span>
  })
}

// Typesets an answer for reading: serif body, real lists and headings, code on dark paper.
export default function Prose({ text }) {
  return (
    <div className="font-serif text-[17px] leading-[1.75] text-ink">
      {parseBlocks(text).map((block, i) => {
        if (block.type === 'code') return <CodeBlock key={i} lang={block.lang} content={block.content} />
        if (block.type === 'heading')
          return (
            <h3 key={i} className="mt-6 mb-2 font-sans text-base font-semibold first:mt-0">
              <Inline text={block.content} />
            </h3>
          )
        if (block.type === 'list') {
          const List = block.ordered ? 'ol' : 'ul'
          return (
            <List key={i} className={`my-3 space-y-1.5 pl-6 ${block.ordered ? 'list-decimal' : 'list-disc'} marker:text-blue`}>
              {block.items.map((item, j) => (
                <li key={j} className="pl-1">
                  <Inline text={item} />
                </li>
              ))}
            </List>
          )
        }
        return (
          <p key={i} className="my-3 whitespace-pre-line first:mt-0 last:mb-0">
            <Inline text={block.content} />
          </p>
        )
      })}
    </div>
  )
}
