import { useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from 'utils'

export type TruncatedTextProps = {
  children: React.ReactNode
  /** Plain-text tooltip content. Falls back to the rendered text. */
  title?: string
  className?: string
}

const TOOLTIP_HIDE_DELAY_MS = 120
const TOOLTIP_GAP_PX = 8

/* Shows a tooltip only when the text is actually clipped, checked with
   `scrollWidth > clientWidth` on hover rather than on render, because column widths
   change with the viewport.

   Portalled, since the table scroller would clip a tooltip positioned inside it.
   Position is read once on hover, so there is no scroll or resize listener. The short
   hide delay makes the tooltip itself hoverable. */
export const TruncatedText = ({ children, title, className }: TruncatedTextProps) => {
  const textRef = useRef<HTMLSpanElement>(null)
  const hideTimer = useRef<number | undefined>(undefined)
  const [anchor, setAnchor] = useState<{ top: number; left: number; text: string } | null>(null)
  const tooltipId = useId()

  const show = (): void => {
    window.clearTimeout(hideTimer.current)

    const element = textRef.current
    if (!element) return
    // The whole point: no tooltip unless the text is genuinely clipped.
    if (element.scrollWidth <= element.clientWidth) return

    const rect = element.getBoundingClientRect()
    setAnchor({ top: rect.bottom + TOOLTIP_GAP_PX, left: rect.left, text: title ?? element.textContent ?? '' })
  }

  const hide = (): void => {
    hideTimer.current = window.setTimeout(() => setAnchor(null), TOOLTIP_HIDE_DELAY_MS)
  }

  return (
    <>
      <span
        ref={textRef}
        onPointerEnter={show}
        onPointerLeave={hide}
        onFocus={show}
        onBlur={hide}
        aria-describedby={anchor ? tooltipId : undefined}
        className={cn('block overflow-hidden text-ellipsis whitespace-nowrap', className)}
      >
        {children}
      </span>

      {anchor &&
        createPortal(
          <span
            id={tooltipId}
            role='tooltip'
            onPointerEnter={() => window.clearTimeout(hideTimer.current)}
            onPointerLeave={hide}
            style={{ top: anchor.top, left: anchor.left }}
            className='fixed z-50 max-w-xs rounded-lg border border-line bg-surface-inverse px-2.5 py-1.5 text-xs text-ink-inverse shadow-card'
          >
            {anchor.text}
          </span>,
          document.body,
        )}
    </>
  )
}
