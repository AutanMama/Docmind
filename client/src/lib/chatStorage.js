// Past conversations live in localStorage. Components read them through
// useSyncExternalStore (see hooks/useShelf), so every save re-renders the shelf
// without effects copying storage into state.
const STORAGE_KEY = 'docmind_chats'
const listeners = new Set()
let cache = null

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeAll(chats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats))
  } catch {
    // Storage can fail (quota, private mode). Losing history silently beats crashing the chat.
  }
  cache = null
  listeners.forEach((fn) => fn())
}

export function getAllChats() {
  if (!cache) cache = readAll().sort((a, b) => b.updatedAt - a.updatedAt)
  return cache
}

export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function titleFrom(messages) {
  const firstUser = messages.find((m) => m.role === 'user')
  if (!firstUser) return 'New conversation'
  const text = firstUser.text.trim()
  return text.length > 48 ? `${text.slice(0, 48)}…` : text
}

// Only finished text (and any source passages) is stored, never the typing
// animation state, and only once there's at least one message.
export function saveChat(chatId, messages, docFileName) {
  if (messages.length === 0) return
  const chats = readAll()
  const existing = chats.find((c) => c.id === chatId)
  const record = {
    id: chatId,
    title: titleFrom(messages),
    messages: messages.map(({ role, text, isError, sources }) => ({ role, text, isError, sources })),
    docFileName: docFileName || existing?.docFileName || null,
    updatedAt: Date.now(),
    createdAt: existing?.createdAt || Date.now(),
  }
  writeAll(existing ? chats.map((c) => (c.id === chatId ? record : c)) : [...chats, record])
}

export function deleteChat(chatId) {
  writeAll(readAll().filter((c) => c.id !== chatId))
}
