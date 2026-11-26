import { CircleAlert } from 'lucide-react'
import Prose from './Prose'
import { SourceFold, SourceMargin } from './SourceNotes'
import CopyButton from '../ui/CopyButton'

export function Question({ text }) {
  return (
    <div className="animate-rise flex justify-end">
      <div className="max-w-[85%] text-right">
        <p className="mb-1 font-sans text-xs font-semibold tracking-wide text-muted uppercase">You asked</p>
        <p className="inline-block rounded-2xl rounded-tr-md bg-blue px-4 py-2.5 text-left text-[15px] leading-relaxed whitespace-pre-wrap text-page">{text}</p>
      </div>
    </div>
  )
}

// An answer is set on its own ruled page, with any source passages in the margin.
export function Answer({ message }) {
  const hasSources = message.sources?.length > 0

  if (message.isError) {
    return (
      <div className="animate-rise flex items-start gap-3 rounded-xl border border-pencil/30 bg-page px-4 py-3 text-sm text-pencil">
        <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
        <p>{message.displayText}</p>
      </div>
    )
  }

  return (
    <article className={`animate-rise grid items-start gap-8 ${hasSources ? 'xl:grid-cols-[minmax(0,1fr)_260px]' : ''}`}>
      <div className="margin-rule relative rounded-xl bg-page py-6 pr-5 pl-14 shadow-page md:py-8 md:pr-10">
        <Prose text={message.displayText} />
        {!message.typing && (
          <div className="mt-4 flex justify-end">
            <CopyButton text={message.text} label="Copy answer" />
          </div>
        )}
        {!message.typing && <SourceFold sources={message.sources} />}
      </div>
      {!message.typing && <SourceMargin sources={message.sources} />}
    </article>
  )
}
