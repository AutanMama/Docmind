const STORAGE_KEY = "docmind_chats";

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(chats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  } catch {
    // Storage can fail (quota, private mode) — losing history silently
    // beats crashing the chat itself.
  }
}

export function getAllChats() {
  return readAll().sort((a, b) => b.updatedAt - a.updatedAt);
}

function titleFrom(messages) {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "New chat";
  const text = firstUser.text.trim();
  return text.length > 40 ? text.slice(0, 40) + "…" : text;
}

// Saves or updates a chat. Only the finished text is persisted (not the
// per-character typing animation state), and only once there's at least
// one real exchange — an empty chat never gets a history entry.
export function saveChat(chatId, messages, docFileName) {
  if (messages.length === 0) return;
  const chats = readAll();
  const existing = chats.find((c) => c.id === chatId);
  const record = {
    id: chatId,
    title: titleFrom(messages),
    messages: messages.map((m) => ({ role: m.role, text: m.text })),
    docFileName: docFileName || null,
    updatedAt: Date.now(),
    createdAt: existing?.createdAt || Date.now(),
  };

  const next = existing ? chats.map((c) => (c.id === chatId ? record : c)) : [...chats, record];
  writeAll(next);
}

export function deleteChat(chatId) {
  writeAll(readAll().filter((c) => c.id !== chatId));
}
