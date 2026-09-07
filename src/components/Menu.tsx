import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'
import { useAnchoredLayer, useCloseOnOutside } from 'hooks'
import { cn } from 'utils'

export type MenuItem = {
  id: string
  label: string
  icon?: ReactNode
  tone?: 'default' | 'danger'
  onSelect?: () => void
  disabled?: boolean
}

export type MenuProps = {
  renderTrigger: (props: {
    ref: React.RefObject<HTMLButtonElement | null>
    onClick: () => void
    'aria-expanded': boolean
    'aria-haspopup': 'menu'
    'aria-controls': string
  }) => ReactNode
  items: readonly MenuItem[]
  align?: 'start' | 'end'
  menuLabel: string
}

const MENU_WIDTH_PX = 190

/* Hand-built menu with roving focus, portalled to the body. The portal is a fix, not a
 * preference: inside a table cell the menu has three clipping ancestors and was visibly
 * cut off mid-item, and no z-index escapes a clipping context. `useAnchoredLayer` owns
 * the coordinates, the flip and the viewport clamp.
 *
 * Items are real `<button role='menuitem'>` and the arrow keys move focus rather than a
 * highlight, so the browser's own focus handling does the work. */
export const Menu = ({ renderTrigger, items, align = 'end', menuLabel }: MenuProps) => {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()
  const menuRef = useCloseOnOutside<HTMLDivElement>({ open, onClose: () => setOpen(false), triggerRef })
  const { position, remeasure } = useAnchoredLayer({ open, triggerRef, width: MENU_WIDTH_PX, align })

  const enabledItems = useCallback(
    () => Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') ?? []),
    [menuRef],
  )

  /** Relative move, wrapping at both ends. */
  const moveFocus = useCallback(
    (offset: number) => {
      const buttons = enabledItems()
      if (buttons.length === 0) return

      const activeIndex = buttons.findIndex(button => button === document.activeElement)
      const nextIndex = activeIndex === -1 ? 0 : (activeIndex + offset + buttons.length) % buttons.length
      buttons[nextIndex]?.focus()
    },
    [enabledItems],
  )

  /* Absolute move, for Home and End. Separate from `moveFocus`, whose offsets are
     relative: `moveFocus(0)` computes `(active + 0) % length` and is a no-op. */
  const focusEdge = useCallback(
    (edge: 'first' | 'last') => {
      const buttons = enabledItems()
      const target = edge === 'first' ? buttons[0] : buttons[buttons.length - 1]
      target?.focus()
    },
    [enabledItems],
  )

  /* Move focus into the menu when it opens. The menu is portalled, so without this
     focus stays on the trigger and the menu's keydown handler never sees the arrow
     keys. It is also what makes Escape's focus-return meaningful. */
  useEffect(() => {
    if (!open) return
    menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]:not(:disabled)')?.focus()
  }, [open, menuRef])

  const onKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      moveFocus(1)
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      moveFocus(-1)
      return
    }
    if (event.key === 'Home') {
      event.preventDefault()
      focusEdge('first')
      return
    }
    if (event.key === 'End') {
      event.preventDefault()
      focusEdge('last')
    }
  }

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
        'aria-haspopup': 'menu',
        'aria-controls': menuId,
      })}

      {open &&
        position !== null &&
        createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role='menu'
            aria-label={menuLabel}
            onKeyDown={onKeyDown}
            style={{ top: position.top, left: position.left, width: MENU_WIDTH_PX }}
            className='fixed z-50 rounded-xl border border-line bg-surface-raised p-1 shadow-card'
          >
            {items.map(item => (
              <button
                key={item.id}
                type='button'
                role='menuitem'
                disabled={item.disabled}
                onClick={() => {
                  item.onSelect?.()
                  setOpen(false)
                  /* Return focus explicitly: after a selection the layer is already
                     unmounting, so `useCloseOnOutside` cannot, and focus would fall to
                     <body> with the next Tab restarting from the top of the document. */
                  triggerRef.current?.focus()
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[0.8125rem] transition-colors duration-100',
                  'hover:bg-surface-hover focus-visible:bg-surface-hover focus-visible:outline-none',
                  'disabled:pointer-events-none disabled:opacity-40',
                  item.tone === 'danger' ? 'text-danger' : 'text-ink',
                )}
              >
                {item.icon && <span className='grid size-4 shrink-0 place-items-center [&>svg]:size-4'>{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  )
}
