// An open book with a ribbon bookmark: DocMind reads your document and marks the place the answer came from.
export default function BrandMark({ className = 'size-8' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="8" className="fill-blue" />
      <path d="M6.5 10.5c3.2-1.4 6.3-1.2 9.5.8v12c-3.2-2-6.3-2.2-9.5-.8v-12Z" className="fill-page" />
      <path d="M25.5 10.5c-3.2-1.4-6.3-1.2-9.5.8v12c3.2-2 6.3-2.2 9.5-.8v-12Z" className="fill-page" opacity="0.85" />
      <path d="M19.5 9.6v8.2l1.7-1.3 1.7 1.3V9.2" className="fill-highlight" />
    </svg>
  )
}
