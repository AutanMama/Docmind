const PROMPTS = [
  { title: 'Summarise it', text: 'Summarise this document in five key points.' },
  { title: 'Find the deadlines', text: 'What dates, deadlines or time limits does this document mention?' },
  { title: 'Teach me', text: 'Explain the hardest idea in this document as if I were new to the subject.' },
]

export default function PromptCards({ onPick, label }) {
  return (
    <div>
      <p className="mb-3 font-sans text-xs font-semibold tracking-wide text-muted uppercase">{label}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {PROMPTS.map((p) => (
          <button key={p.title} type="button" onClick={() => onPick(p.text)} className="rounded-xl border border-line bg-page p-4 text-left transition-colors hover:border-blue/50">
            <span className="block font-sans text-sm font-semibold">{p.title}</span>
            <span className="mt-1 block font-serif text-sm leading-snug text-muted">“{p.text}”</span>
          </button>
        ))}
      </div>
    </div>
  )
}
