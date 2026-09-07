import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { cn } from 'utils'

export type SheetProps = {
  open: boolean
  onClose: () => void
  children: ReactNode
  label: string
  className?: string
}

/* A native `<dialog>` opened with showModal(), which is why this is ~40 lines and not
   ~200: the platform gives the focus trap, the inert background, the top layer, Escape
   and the ::backdrop for free. `useCloseOnOutside` is not used here for that reason. */
export const Sheet = ({ open, onClose, children, label, className }: SheetProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)

  // One job: keep the DOM element's open state in step with the prop.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-label={label}
      onCancel={event => {
        // Escape fires `cancel`; preventDefault keeps React as the source of truth.
        event.preventDefault()
        onClose()
      }}
      onClick={event => {
        // A click that lands on the dialog element itself is a backdrop click: the
        // panel inside stops propagation by covering its own area.
        if (event.target === dialogRef.current) onClose()
      }}
      className={cn(
        'm-0 h-dvh max-h-none w-72 max-w-[85vw] border-0 bg-transparent p-0',
        'backdrop:bg-granite-950/45 open:flex',
        className,
      )}
    >
      <div className='flex size-full flex-col overflow-y-auto border-r border-line bg-surface-raised'>{children}</div>
    </dialog>
  )
}
