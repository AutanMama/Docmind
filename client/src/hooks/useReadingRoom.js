import { useCallback, useEffect, useState } from 'react'
import { askQuestion, uploadDocument } from '../lib/api'
import { deleteChat, getAllChats, saveChat } from '../lib/chatStorage'

const newChatId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()))

// Messages look like { role, text, displayText, typing, isError?, sources? }.
// Everything the reading room does lives here; components only render.
export default function useReadingRoom() {
  const [chatId, setChatId] = useState(newChatId)
  const [doc, setDoc] = useState(null) // { docId, fileName, chunkCount }
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [messages, setMessages] = useState([])
  const [asking, setAsking] = useState(false)

  // Reveal the latest answer a few characters at a time, like it's being written.
  useEffect(() => {
    const last = messages[messages.length - 1]
    if (!last || last.role !== 'assistant' || !last.typing) return
    const interval = setInterval(() => {
      setMessages((prev) => {
        const msgs = [...prev]
        const target = msgs[msgs.length - 1]
        if (!target?.typing) return prev
        const nextLength = Math.min(target.displayText.length + 3, target.text.length)
        msgs[msgs.length - 1] = { ...target, displayText: target.text.slice(0, nextLength), typing: nextLength < target.text.length }
        return msgs
      })
    }, 12)
    return () => clearInterval(interval)
  }, [messages])

  // Persist the conversation so it appears on the shelf and survives a refresh.
  useEffect(() => {
    saveChat(chatId, messages, doc?.fileName)
  }, [messages, chatId, doc?.fileName])

  const addAnswer = useCallback((text, { isError = false, sources = [] } = {}) => {
    setMessages((m) => [...m, { role: 'assistant', text, displayText: '', typing: true, isError, sources }])
  }, [])

  const attach = useCallback(
    async (file) => {
      if (!file) return
      if (file.type !== 'application/pdf') {
        setUploadError('Please choose a PDF file.')
        return
      }
      setUploading(true)
      setUploadError('')
      try {
        const data = await uploadDocument(file)
        setDoc(data)
        addAnswer(`I've read "${data.fileName}" (${data.chunkCount} ${data.chunkCount === 1 ? 'section' : 'sections'}). Ask me anything about it.`)
      } catch (err) {
        setUploadError(err.message)
      } finally {
        setUploading(false)
      }
    },
    [addAnswer],
  )

  const ask = useCallback(
    async (question) => {
      const q = question.trim()
      if (!q || asking) return
      setMessages((m) => [...m, { role: 'user', text: q, displayText: q }])
      setAsking(true)
      try {
        // Earlier turns give the model memory ("are you sure?"). Failed
        // exchanges are left out so an error never reads as a real reply.
        const history = messages.filter((m) => !m.isError).map((m) => ({ role: m.role, text: m.text }))
        const data = await askQuestion({ docId: doc?.docId, question: q, history })
        addAnswer(data.answer, { sources: data.sources || [] })
      } catch (err) {
        addAnswer(`Sorry, that didn't go through: ${err.message.replace(/\.$/, '')}. Try sending it again.`, { isError: true })
      } finally {
        setAsking(false)
      }
    },
    [asking, messages, doc, addAnswer],
  )

  const startNew = useCallback(() => {
    setChatId(newChatId())
    setDoc(null)
    setMessages([])
    setUploadError('')
  }, [])

  // The document itself lives only in server memory, so a resumed conversation
  // continues as general chat until the PDF is attached again.
  const open = useCallback((id) => {
    const chat = getAllChats().find((c) => c.id === id)
    if (!chat) return
    setChatId(id)
    setMessages(chat.messages.map((m) => ({ ...m, displayText: m.text, typing: false })))
    setDoc(null)
    setUploadError('')
  }, [])

  const remove = useCallback(
    (id) => {
      deleteChat(id)
      if (id === chatId) startNew()
    },
    [chatId, startNew],
  )

  return { chatId, doc, uploading, uploadError, messages, asking, attach, ask, startNew, open, remove }
}
