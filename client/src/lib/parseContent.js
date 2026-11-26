// Turns a model answer into blocks the reading view can typeset:
// fenced code, headings, bullet and numbered lists, and paragraphs.
// Inline **bold** and `code` are handled by splitInline.

export function parseBlocks(text) {
  const blocks = []
  const fence = /```(\w*)\n?([\s\S]*?)(```|$)/g
  let last = 0
  let match
  while ((match = fence.exec(text))) {
    if (match.index > last) blocks.push(...parseProse(text.slice(last, match.index)))
    blocks.push({ type: 'code', lang: match[1], content: match[2].replace(/\n$/, '') })
    last = fence.lastIndex
    if (match[3] === '') break // unfinished fence while the answer is still being typed
  }
  if (last < text.length) blocks.push(...parseProse(text.slice(last)))
  return blocks
}

function parseProse(chunk) {
  const blocks = []
  let list = null
  const flush = () => {
    if (list) blocks.push(list)
    list = null
  }

  for (const raw of chunk.split('\n')) {
    const line = raw.trimEnd()
    const bullet = line.match(/^\s*[-*•]\s+(.*)/)
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)/)
    const heading = line.match(/^#{1,4}\s+(.*)/)

    if (bullet || numbered) {
      const ordered = Boolean(numbered)
      if (!list || list.ordered !== ordered) {
        flush()
        list = { type: 'list', ordered, items: [] }
      }
      list.items.push((bullet || numbered)[1])
    } else if (heading) {
      flush()
      blocks.push({ type: 'heading', content: heading[1] })
    } else if (line.trim() === '') {
      flush()
    } else {
      flush()
      const prev = blocks[blocks.length - 1]
      if (prev?.type === 'paragraph' && !prev.closed) prev.content += `\n${line}`
      else blocks.push({ type: 'paragraph', content: line })
    }
    if (line.trim() === '' && blocks.length) blocks[blocks.length - 1].closed = true
  }
  flush()
  return blocks
}

// Splits a line into plain, bold and inline-code runs.
export function splitInline(text) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean).map((part) => {
    if (part.startsWith('**') && part.endsWith('**')) return { type: 'bold', content: part.slice(2, -2) }
    if (part.startsWith('`') && part.endsWith('`')) return { type: 'code', content: part.slice(1, -1) }
    return { type: 'text', content: part }
  })
}
