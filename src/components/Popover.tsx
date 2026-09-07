import { useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'
import { useAnchoredLayer, useCloseOnOutside } from 'hooks'
import { cn } from 'utils'

export type PopoverProps = {
  /** Render the trigger. Receives the props it must spread, so it can be any element. */
  renderTrigger: (props: {
    ref: React.RefObject<HTMLButtonElement | null>
    onClick: () => void
    'aria-expanded': boolean
    'aria-haspopup': 'dialog'
    'aria-controls': string
  }) => ReactNode
  children: ReactNode
  align?: 'start' | 'end'
  panelLabel: string
  width?: number
  className?: string
}

const DEFAULT_WIDTH_PX = 288

/* Hand-built, no Radix, and PORTALLED for the same reason as Menu: the demo-controls
   trigger sits inside a card whose ancestors clip, so an in-place panel was cut off.
   `useAnchoredLayer` handles the flip and the viewport clamp, which is also what
   replaces the collision detection a floating-element library would provide. */
export const Popover = ({ renderTrigger, children, align = 'end', panelLabel, width = DEFAULT_WIDTH_PX, className }: PopoverProps) => {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()
  const panelRef = useCloseOnOutside<HTMLDivElement>({ open, onClose: () => setOpen(false), triggerRef })
  const { position, remeasure } = useAnchoredLayer({ open, triggerRef, width, align })

  return (
    <>
      {renderTrigger({
        ref: triggerRef,
        onClick: () => {
          // Measured here rather than in an effect: the first painted frame is already
          // in the right place, and it avoids a setState during commit.
          remeasure()
          setOpen(value => !value)
        },
        'aria-expanded': open,
        'aria-haspopup': 'dialog',
        'aria-controls': panelId,
      })}

      {open &&
        position !== null &&
        createPortal(
          <div
            ref={panelRef}
            id={panelId}
            role='dialog'
            aria-label={panelLabel}
            style={{ top: position.top, left: position.left, width }}
            className={cn(
              'fixed z-50 max-h-[min(80vh,32rem)] overflow-y-auto rounded-xl border border-line bg-surface-raised p-4 shadow-card',
              className,
            )}
          >
            {children}
          </div>,
          document.body,
        )}
    </>
  )
}
