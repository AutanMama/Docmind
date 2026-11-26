import { BookOpenText, FileText, PanelLeft } from 'lucide-react'
import BrandMark from '../ui/BrandMark'

export default function Header({ doc, onToggleShelf }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-paper px-3 md:h-16 md:px-5">
      <button type="button" onClick={onToggleShelf} className="grid size-9 place-items-center rounded-lg text-muted hover:bg-desk hover:text-ink" aria-label="Show or hide your shelf">
        <PanelLeft className="size-5" />
      </button>
      <div className="flex items-center gap-2.5">
        <BrandMark className="size-8" />
        <span className="font-serif text-xl font-semibold tracking-tight">DocMind</span>
      </div>

      <div className="ml-auto min-w-0">
        {doc ? (
          <p className="flex min-w-0 items-center gap-2 rounded-full border border-line bg-page py-1.5 pr-3 pl-2 text-sm">
            <FileText className="size-4 shrink-0 text-blue" aria-hidden />
            <span className="truncate font-medium">{doc.fileName}</span>
            <span className="hidden shrink-0 text-muted sm:inline">
              · {doc.chunkCount} {doc.chunkCount === 1 ? 'section' : 'sections'}
            </span>
          </p>
        ) : (
          <p className="hidden items-center gap-1.5 text-sm text-muted sm:flex">
            <BookOpenText className="size-4" aria-hidden /> No document on the desk
          </p>
        )}
      </div>
    </header>
  )
}
