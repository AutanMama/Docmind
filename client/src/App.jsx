import { useRef, useState } from 'react'
import Header from './components/layout/Header'
import Shelf from './components/layout/Shelf'
import Desk from './components/reading/Desk'
import Conversation from './components/reading/Conversation'
import Composer from './components/reading/Composer'
import useReadingRoom from './hooks/useReadingRoom'

const isPhone = () => window.innerWidth < 768

export default function App() {
  const room = useReadingRoom()
  const [question, setQuestion] = useState('')
  // The shelf is open by default on desktop, and a slide-over drawer on phones.
  const [shelfOpen, setShelfOpen] = useState(() => !isPhone())
  const inputRef = useRef(null)

  const closeShelfOnPhone = () => {
    if (isPhone()) setShelfOpen(false)
  }

  function send() {
    if (!question.trim() || room.asking) return
    room.ask(question)
    setQuestion('')
  }

  function applyPrompt(text) {
    setQuestion(text)
    inputRef.current?.focus()
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Header doc={room.doc} onToggleShelf={() => setShelfOpen((o) => !o)} />

      <div className="flex min-h-0 flex-1">
        <Shelf
          open={shelfOpen}
          onClose={() => setShelfOpen(false)}
          activeId={room.chatId}
          onNew={() => {
            room.startNew()
            closeShelfOnPhone()
          }}
          onOpen={(id) => {
            room.open(id)
            closeShelfOnPhone()
          }}
          onDelete={room.remove}
        />

        <main className="flex min-h-0 min-w-0 flex-1 flex-col">
          {room.messages.length === 0 ? (
            <div className="min-h-0 flex-1 overflow-y-auto">
              <Desk onAttach={room.attach} onPrompt={applyPrompt} uploading={room.uploading} />
            </div>
          ) : (
            <Conversation messages={room.messages} asking={room.asking} onPrompt={applyPrompt} />
          )}
          <Composer
            value={question}
            onChange={setQuestion}
            onSubmit={send}
            onAttach={room.attach}
            asking={room.asking}
            uploading={room.uploading}
            uploadError={room.uploadError}
            hasDoc={Boolean(room.doc)}
            inputRef={inputRef}
          />
        </main>
      </div>
    </div>
  )
}
