import { useEffect, useRef } from 'react'
import { useEvent } from './useEvent'

export type UseCloseOnOutsideOptions = {
  open: boolean
  onClose: () => void
  /** Element that opened the layer. Focus returns here on close. */
  triggerRef?: React.RefObject<HTMLElement | null>
}

/* One implementation of the outside-close behaviour, shared by every menu, popover and
   sheet. Three details it gets right:

   1. `pointerdown`, not `click`, so dragging a selection out of the layer does not close
      it and a click on the trigger does not close then immediately reopen.
   2. Focus returns to the trigger on close, but only if focus is still inside the layer.
   3. Escape is captured on the document, so it works from a child input.
*/
export const useCloseOnOutside = <T extends HTMLElement>({
  open,
  onClose,
  triggerRef,
}: UseCloseOnOutsideOptions): React.RefObject<T | null> => {
  const layerRef = useRef<T>(null)

  /* Wrapped so the effect depends only on `open`, not on a caller's inline arrow, which
     would re-subscribe the document listeners on every render. */
  const close = useEvent(onClose)

  useEffect(() => {
    if (!open) return

    const isInsideLayer = (target: EventTarget | null): boolean => target instanceof Node && layerRef.current?.contains(target) === true

    const onPointerDown = (event: PointerEvent): void => {
      if (isInsideLayer(event.target)) return
      if (triggerRef?.current?.contains(event.target as Node)) return
      close()
    }

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      close()
    }

    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKeyDown, true)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKeyDown, true)

      // Return focus only if it is still inside the layer being torn down.
      const active = document.activeElement
      if (active instanceof Node && layerRef.current?.contains(active)) triggerRef?.current?.focus()
    }
  }, [open, triggerRef, close])

  return layerRef
}
