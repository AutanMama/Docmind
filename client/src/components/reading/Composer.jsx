import { useEffect, useRef } from 'react'
import { ArrowUp, Paperclip } from 'lucide-react'
import ReadingIndicator from './ReadingIndicator'

export default function Composer({ value, onChange, onSubmit, onAttach, asking, uploading, uploadError, hasDoc, inputRef }) {
  const fileRef = useRef(null)

  // Grow with the text, up to a limit.
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`
  }, [value, inputRef])

  function submit(e) {
    e.preventDefault()
    onSubmit()
  }

  return (
    <div className="border-t border-line bg-paper/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:px-8">
      <div className="mx-auto max-w-3xl">
        {uploading && <ReadingIndicator label="Reading your document…" />}
        {uploadError && (
          <p className="pb-2 text-sm text-pencil" role="alert">
            {uploadError}
          </p>
        )}

        <form onSubmit={submit} className="flex items-end gap-2 rounded-2xl border border-line bg-page p-2 shadow-page transition-colors focus-within:border-blue">
          <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => onAttach(e.target.files[0])} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="grid size-10 shrink-0 place-items-center rounded-xl text-muted transition-colors hover:bg-desk hover:text-ink"
            aria-label="Attach a PDF"
            title="Attach a PDF"
          >
            <Paperclip className="size-5" />
          </button>
          <label htmlFor="question" className="sr-only">
            Your question
          </label>
          <textarea
            id="question"
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) submit(e)
            }}
            rows={1}
            placeholder={hasDoc ? 'Ask about this document…' : 'Ask anything, or attach a PDF to read together…'}
            className="flex-1 resize-none bg-transparent px-1 py-2 text-[15px] leading-relaxed placeholder:text-muted/80 focus:outline-none focus-visible:outline-none"
          />
          <button
            type="submit"
            disabled={asking || !value.trim()}
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue text-page transition-colors hover:bg-blue-hover disabled:opacity-35"
            aria-label="Send question"
          >
            <ArrowUp className="size-5" strokeWidth={2.4} />
          </button>
        </form>
        <p className="mt-2 text-center text-xs text-muted">Answers come from your document when one is attached. Check anything important against the source.</p>
      </div>
    </div>
  )
}
