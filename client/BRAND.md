# DocMind brand guide

Most AI document tools look the same: a purple gradient, a sparkle icon, "Ask me anything" and a row of suggestion chips. DocMind is about **reading** a real document carefully and showing where every answer came from, so it's designed as a **reading room**: warm paper, ink, a serif built for long reading, and a highlighter.

## Principles

1. **Answers are pages, not chat bubbles.** Each answer is typeset on its own page in a reading serif, with real lists, headings and code.
2. **Show your sources.** When the server answers from retrieved passages, they appear in the margin (or a fold-out on phones), highlighted, with their match score. Trust comes from being able to check.
3. **Calm by default.** Paper and ink everywhere; the highlighter only marks what came from the document.
4. **Honest about limits.** The composer reminds people to check anything important against the source.

## Colour

All colours are tokens in `src/styles/index.css`. Components never use raw hex values.

| Token       | Hex       | Use                                              |
| ----------- | --------- | ------------------------------------------------ |
| `paper`     | `#F3EFE6` | App background                                   |
| `page`      | `#FFFDF8` | Answer pages, cards, inputs                      |
| `desk`      | `#E9E3D6` | The shelf (history) and quiet hovers             |
| `line`      | `#DED6C6` | Borders, dividers                                |
| `ink`       | `#1C2230` | Main text, code background                       |
| `muted`     | `#5B6170` | Supporting text                                  |
| `blue`      | `#1F3F6E` | Ink-blue: actions, your questions, the logo      |
| `highlight` | `#F8DE6B` | Highlighter, only ever behind text               |
| `pencil`    | `#A63D24` | Red pencil: margin lines, passage labels, errors |

### Contrast (WCAG 2.1)

| Pair                 | Ratio | Level |
| -------------------- | ----- | ----- |
| ink on page          | 15.6  | AAA   |
| ink on paper         | 13.9  | AAA   |
| ink on highlight     | 11.9  | AAA   |
| muted on page        | 6.10  | AA    |
| muted on paper       | 5.40  | AA    |
| white on blue        | 10.5  | AAA   |
| pencil on page       | 6.23  | AA    |

## Type

- **Literata** for answers, headlines and anything you read at length. It was designed for long-form reading on screens.
- **IBM Plex Sans** for the interface: labels, buttons, your questions.
- **IBM Plex Mono** for code.
- Answer text is 17px with a 1.75 line height and a comfortable line length.

## Signature details

- **Margin rule:** a thin red-pencil margin line on every answer page.
- **Highlighter:** source passages are marked with a highlighter stroke that sits slightly inside the line height, like a real marker.
- **Ruled sheet:** the drop zone on the empty desk is a ruled sheet of paper.
- **Reading indicator:** a highlighter sweeping across a line while DocMind reads.
- **Logo:** an open book with a yellow ribbon bookmark, marking where the answer is.

## Motion

Short and quiet: answers and notes rise in by 10px, the reading indicator sweeps, and answers type themselves in. Everything respects `prefers-reduced-motion`.
