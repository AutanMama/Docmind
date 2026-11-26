// A highlighter sweeping across a line while DocMind reads for the answer.
export default function ReadingIndicator({ label = 'Reading for the answer…' }) {
  return (
    <div className="animate-rise flex items-center gap-3 py-2" role="status" aria-live="polite">
      <span className="relative block h-3 w-16 overflow-hidden rounded-sm bg-desk" aria-hidden>
        <span className="animate-sweep absolute inset-0 bg-highlight" />
      </span>
      <span className="font-serif text-sm text-muted italic">{label}</span>
    </div>
  )
}
