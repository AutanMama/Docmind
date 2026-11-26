import { useEffect, useRef } from 'react'
import { Answer, Question } from './Exchange'
import ReadingIndicator from './ReadingIndicator'
import PromptCards from './PromptCards'

export default function Conversation({ messages, asking, onPrompt }) {
  // Right after a document is read, offer a few ways to start until the first question.
  const showPrompts = !asking && messages.length > 0 && messages.every((m) => m.role === 'assistant')

  const scrollRef = useRef(null)
  const atBottomRef = useRef(true)
  const countRef = useRef(0)

  // Follow new text only while the reader is at the bottom, so the typing
  // animation never drags them away from something they're reading above.
  // Sending your own question always jumps to the bottom.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const sentOwn = messages.length > countRef.current && messages[messages.length - 1]?.role === 'user'
    countRef.current = messages.length
    if (sentOwn) atBottomRef.current = true
    if (atBottomRef.current) el.scrollTop = el.scrollHeight
  }, [messages, asking])

  return (
    <div
      ref={scrollRef}
      onScroll={() => {
        const el = scrollRef.current
        atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
      }}
      className="min-h-0 flex-1 overflow-y-auto px-4 py-8 md:px-8"
    >
      <div className="mx-auto max-w-3xl space-y-8 xl:max-w-5xl">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'xl:max-w-3xl' : ''}>
            {m.role === 'user' ? <Question text={m.displayText} /> : <Answer message={m} />}
          </div>
        ))}
        {asking && <ReadingIndicator />}
        {showPrompts && <PromptCards label="Try asking" onPick={onPrompt} />}
      </div>
    </div>
  )
}
