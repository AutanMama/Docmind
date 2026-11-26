import { useState } from 'react'
import { BookmarkCheck, ChevronDown } from 'lucide-react'

function excerpt(text, max = 260) {
  const clean = text.replace(/\s+/g, ' ').trim()
  return clean.length > max ? `${clean.slice(0, max).trimEnd()}…` : clean
}

function Note({ source, index }) {
  return (
    <li className="border-l-2 border-pencil/40 pl-3">
      <p className="mb-1 font-sans text-xs font-semibold tracking-wide text-pencil uppercase">
        Passage {index + 1}
        {typeof source.score === 'number' && <span className="ml-2 font-normal tracking-normal text-muted normal-case">{Math.round(source.score * 100)}% match</span>}
      </p>
      <blockquote className="font-serif text-sm leading-relaxed text-ink">
        “<span className="marker">{excerpt(source.text)}</span>”
      </blockquote>
    </li>
  )
}

// Margin notes beside the answer on wide screens.
export function SourceMargin({ sources }) {
  if (!sources?.length) return null
  return (
    <aside className="hidden pt-6 xl:block" aria-label="Passages this answer is based on">
      <p className="mb-3 flex items-center gap-1.5 font-sans text-xs font-semibold tracking-wide text-muted uppercase">
        <BookmarkCheck className="size-4 text-blue" aria-hidden /> From your document
      </p>
      <ol className="space-y-4">
        {sources.map((s, i) => (
          <Note key={i} source={s} index={i} />
        ))}
      </ol>
    </aside>
  )
}

// The same passages as a fold-out list under the answer on smaller screens.
export function SourceFold({ sources }) {
  const [open, setOpen] = useState(false)
  if (!sources?.length) return null
  return (
    <div className="mt-5 border-t border-dashed border-line pt-4 xl:hidden">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex items-center gap-1.5 text-left font-sans text-sm font-semibold text-blue">
        <BookmarkCheck className="size-4 shrink-0" aria-hidden />
        Based on {sources.length} passage{sources.length === 1 ? '' : 's'} from your document
        <ChevronDown className={`size-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open && (
        <ol className="animate-rise mt-4 space-y-4">
          {sources.map((s, i) => (
            <Note key={i} source={s} index={i} />
          ))}
        </ol>
      )}
    </div>
  )
}
