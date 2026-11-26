import { FileText, Plus, Trash2, X } from 'lucide-react'
import useShelf from '../../hooks/useShelf'

const day = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })

// Past conversations, filed like cards in a library catalogue.
export default function Shelf({ open, onClose, activeId, onOpen, onNew, onDelete }) {
  const chats = useShelf()

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-ink/40 md:hidden" onClick={onClose} aria-hidden />}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[82%] flex-col border-r border-line bg-desk transition-transform duration-200 md:static md:z-auto md:max-w-none md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full md:hidden'
        }`}
        aria-label="Your shelf"
      >
        <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3">
          <p className="font-sans text-xs font-semibold tracking-[0.18em] text-muted uppercase">Your shelf</p>
          <button type="button" onClick={onClose} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-paper hover:text-ink md:hidden" aria-label="Close shelf">
            <X className="size-4" />
          </button>
        </div>

        <div className="px-3">
          <button
            type="button"
            onClick={onNew}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue px-3 py-2.5 text-sm font-semibold text-page transition-colors hover:bg-blue-hover"
          >
            <Plus className="size-4" aria-hidden /> New reading
          </button>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto px-3 pb-4">
          {chats.length === 0 ? (
            <p className="px-2 pt-6 text-center font-serif text-sm text-muted italic">Your past readings will be filed here.</p>
          ) : (
            <ul className="space-y-2">
              {chats.map((chat) => {
                const active = chat.id === activeId
                return (
                  <li key={chat.id}>
                    <div
                      className={`group relative rounded-lg border bg-page px-3 py-2.5 transition-colors ${
                        active ? 'border-blue shadow-page' : 'border-line hover:border-blue/40'
                      }`}
                    >
                      <button type="button" onClick={() => onOpen(chat.id)} className="block w-full pr-6 text-left">
                        <span className="block truncate font-serif text-[15px] leading-snug font-medium">{chat.title}</span>
                        <span className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                          {chat.docFileName && (
                            <>
                              <FileText className="size-3.5 shrink-0" aria-hidden />
                              <span className="truncate">{chat.docFileName}</span>
                              <span aria-hidden>·</span>
                            </>
                          )}
                          <span className="shrink-0">{day.format(chat.updatedAt)}</span>
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(chat.id)}
                        className="absolute top-2 right-2 grid size-7 place-items-center rounded-md text-muted opacity-100 transition-opacity hover:bg-pencil/10 hover:text-pencil md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100"
                        aria-label={`Delete “${chat.title}”`}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </aside>
    </>
  )
}
