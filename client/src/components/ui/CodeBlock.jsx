import CopyButton from './CopyButton'

export default function CodeBlock({ lang, content }) {
  return (
    <figure className="my-4 overflow-hidden rounded-lg bg-ink font-sans">
      <figcaption className="flex items-center justify-between border-b border-white/10 px-3 py-1.5">
        <span className="font-mono text-xs tracking-wide text-white/60 uppercase">{lang || 'code'}</span>
        <CopyButton text={content} className="!text-white/60 hover:!bg-white/10 hover:!text-white" />
      </figcaption>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-[#e8e4da]">
        <code>{content}</code>
      </pre>
    </figure>
  )
}
