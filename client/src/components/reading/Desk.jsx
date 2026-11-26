import { useRef, useState } from 'react'
import { FileUp } from 'lucide-react'
import PromptCards from './PromptCards'


// The empty state: a desk with a sheet to drop a PDF on, and a few ways to start.
export default function Desk({ onAttach, onPrompt, uploading }) {
  const fileRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  function drop(e) {
    e.preventDefault()
    setDragging(false)
    onAttach(e.dataTransfer.files?.[0])
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-4 pt-8 pb-10 md:px-8 md:pt-16">
      <p className="font-sans text-xs font-semibold tracking-[0.18em] text-pencil uppercase">The reading room</p>
      <h1 className="mt-3 font-serif text-4xl leading-tight font-semibold tracking-tight md:text-5xl">
        Bring a document. <span className="marker">Ask it anything.</span>
      </h1>
      <p className="mt-4 max-w-xl font-serif text-lg leading-relaxed text-muted">
        DocMind reads your PDF and answers from what it actually says, then shows you the passages it used. No guessing, no made-up facts.
      </p>

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={drop}
        disabled={uploading}
        className={`ruled group mt-10 flex flex-col items-center rounded-2xl border-2 border-dashed bg-page px-6 py-12 text-center shadow-page transition-colors ${
          dragging ? 'border-blue bg-blue-soft' : 'border-line hover:border-blue/50'
        }`}
      >
        <span className="grid size-14 place-items-center rounded-2xl bg-blue text-page transition-transform group-hover:-translate-y-0.5">
          <FileUp className="size-6" aria-hidden />
        </span>
        <span className="mt-4 font-serif text-xl font-semibold">{uploading ? 'Reading your document…' : 'Drop a PDF on the desk'}</span>
        <span className="mt-1 text-sm text-muted">or click to choose one · up to 15 MB</span>
      </button>
      <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => onAttach(e.target.files[0])} />

      <div className="mt-10">
        <PromptCards label="Once it’s on the desk, try" onPick={onPrompt} />
      </div>
    </div>
  )
}
