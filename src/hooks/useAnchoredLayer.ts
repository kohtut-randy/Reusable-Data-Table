import { useCallback, useEffect, useState } from 'react'

/* Positions a portalled overlay against its trigger.
 *
 * The portal is not optional: a menu inside a table cell has three clipping ancestors
 * (the table's own scroller, the main region, the app shell), and no z-index escapes a
 * clipping context. So the overlay is `position: fixed` in a body portal and this hook
 * owns the coordinates. It flips above the trigger when there is no room below, and
 * clamps horizontally into the viewport.
 *
 * Measurement happens in the caller's click handler (`remeasure`), not in an effect: an
 * effect would setState during commit and cascade a second render per open, and the
 * first painted frame would be in the wrong place. The effect below only subscribes.
 */

export type LayerAlign = 'start' | 'end'

export type AnchoredPosition = {
  readonly top: number
  readonly left: number
  readonly placement: 'below' | 'above'
}

export type UseAnchoredLayerOptions = {
  open: boolean
  triggerRef: React.RefObject<HTMLElement | null>
  /** Layer width, so `end` alignment and the viewport clamp are exact. */
  width: number
  align?: LayerAlign
}

export type UseAnchoredLayerResult = {
  readonly position: AnchoredPosition | null
  /** Call this from the trigger's click handler, before or as the layer opens. */
  readonly remeasure: () => void
}

const GAP_PX = 6
const VIEWPORT_MARGIN_PX = 8
/** Assumed layer height when deciding whether to flip, before it has been measured. */
const ASSUMED_HEIGHT_PX = 180

export const useAnchoredLayer = ({ open, triggerRef, width, align = 'end' }: UseAnchoredLayerOptions): UseAnchoredLayerResult => {
  const [position, setPosition] = useState<AnchoredPosition | null>(null)

  const remeasure = useCallback(() => {
    const trigger = triggerRef.current
    if (!trigger) return

    const rect = trigger.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom

    const placement: AnchoredPosition['placement'] = spaceBelow < ASSUMED_HEIGHT_PX && rect.top > spaceBelow ? 'above' : 'below'
    const top = placement === 'below' ? rect.bottom + GAP_PX : Math.max(VIEWPORT_MARGIN_PX, rect.top - GAP_PX - ASSUMED_HEIGHT_PX)

    const preferredLeft = align === 'end' ? rect.right - width : rect.left
    const maxLeft = window.innerWidth - width - VIEWPORT_MARGIN_PX
    const left = Math.min(Math.max(preferredLeft, VIEWPORT_MARGIN_PX), Math.max(maxLeft, VIEWPORT_MARGIN_PX))

    setPosition({ top, left, placement })
  }, [triggerRef, width, align])

  // One job: keep the layer attached to its trigger while it is open. Capture phase, so
  // scrolling an ancestor container is caught and not just the window.
  useEffect(() => {
    if (!open) return

    window.addEventListener('scroll', remeasure, true)
    window.addEventListener('resize', remeasure)

    return () => {
      window.removeEventListener('scroll', remeasure, true)
      window.removeEventListener('resize', remeasure)
    }
  }, [open, remeasure])

  return { position, remeasure }
}
