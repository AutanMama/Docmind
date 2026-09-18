import { SquarePen, Trash2, MessageSquare, ChevronLeft, ChevronRight, X } from "lucide-react";

export default function HistorySidebar({ open, onClose, onOpen, chats, activeChatId, onSelectChat, onNewChat, onDeleteChat }) {
  return (
    <>
      {/* Dimmed backdrop only makes sense when the sidebar floats over content — on desktop it sits inline instead. */}
      {open && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={onClose} />}

      <aside
        className={`group/sidebar fixed md:relative inset-y-0 left-0 z-50 md:z-auto h-full bg-[#f1f2f6] border-r border-[var(--border)] overflow-hidden shrink-0 transition-[width,transform] duration-200 ${
          open ? "w-72 max-w-[80%] translate-x-0" : "w-72 max-w-[80%] -translate-x-full md:w-0 md:translate-x-0"
        }`}
      >
        {/* Fixed-width inner wrapper so content doesn't reflow while the outer width animates on desktop collapse. */}
        <div className="w-72 h-full flex flex-col">
          <div className="flex items-center justify-between p-3">
            <button
              onClick={onNewChat}
              className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-[var(--text-primary)] hover:bg-black/5 transition-colors"
            >
              <SquarePen size={16} />
              New chat
            </button>
            {/* Always-visible close button — the hover-reveal collapse arrow
                doesn't work on touch devices, and even on desktop it's easy
                to miss if you don't already know it's there. */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-black/5 transition-colors"
              aria-label="Close history"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {chats.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] text-center mt-6 px-4">
                Your past conversations will show up here.
              </p>
            ) : (
              <div className="space-y-0.5">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer text-sm transition-colors ${
                      chat.id === activeChatId
                        ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "text-[var(--text-primary)] hover:bg-black/5"
                    }`}
                    onClick={() => onSelectChat(chat.id)}
                  >
                    <MessageSquare size={14} className="shrink-0 opacity-60" />
                    <span className="flex-1 truncate">{chat.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(chat.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-[var(--text-muted)] hover:text-red-500 transition-opacity"
                      aria-label="Delete chat"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Desktop-only collapse handle: sits on the sidebar's edge, only
            visible when hovering the sidebar itself. */}
        <button
          onClick={onClose}
          className="hidden md:flex absolute top-1/2 -translate-y-1/2 -right-3 w-6 h-6 items-center justify-center rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-sm text-[var(--text-secondary)] opacity-0 group-hover/sidebar:opacity-100 hover:text-[var(--accent)] transition-opacity z-10"
          aria-label="Collapse sidebar"
        >
          <ChevronLeft size={14} />
        </button>
      </aside>

      {/* Desktop-only reopen hotzone: a thin strip at the screen edge that
          reveals an expand arrow on hover, when the sidebar is collapsed. */}
      {!open && (
        <div
          className="hidden md:flex group/reopen fixed inset-y-0 left-0 w-4 z-40 items-center"
          onClick={onOpen}
        >
          <button
            className="w-6 h-6 flex items-center justify-center rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-sm text-[var(--text-secondary)] opacity-0 group-hover/reopen:opacity-100 hover:text-[var(--accent)] transition-opacity"
            aria-label="Expand sidebar"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </>
  );
}
