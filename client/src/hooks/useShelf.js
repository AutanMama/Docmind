import { useSyncExternalStore } from 'react'
import { getAllChats, subscribe } from '../lib/chatStorage'

// Past conversations, kept in sync with localStorage.
export default function useShelf() {
  return useSyncExternalStore(subscribe, getAllChats)
}
