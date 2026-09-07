import { useEffect, useRef } from 'react'

/* The visual cue that content is scrolling underneath a sticky column.

   IntersectionObserver over two 1px sentinels rather than a scroll listener: it does no
   work per frame during horizontal scroll, fires only on threshold crossings, and
   self-corrects on resize and column-width changes with no extra listener. Both edges
   are symmetric, so a right-sticky column gets the mirrored cue for free. */

export type ScrollShadowRefs = {
  readonly scrollerRef: React.RefObject<HTMLDivElement | null>
  readonly startSentinelRef: React.RefObject<HTMLDivElement | null>
  readonly endSentinelRef: React.RefObject<HTMLDivElement | null>
}

const FULLY_VISIBLE = 1

export const useScrollShadow = (): ScrollShadowRefs => {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const startSentinelRef = useRef<HTMLDivElement>(null)
  const endSentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scroller = scrollerRef.current
    const startSentinel = startSentinelRef.current
    const endSentinel = endSentinelRef.current
    if (!scroller || !startSentinel || !endSentinel) return

    /* `data-scrolled` means content is hidden to the left, `data-scrolled-end` is the
       mirror. Data attributes, so the whole visual treatment stays in CSS. */
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          const attribute = entry.target === startSentinel ? 'scrolled' : 'scrolledEnd'
          scroller.dataset[attribute] = entry.isIntersecting ? 'false' : 'true'
        }
      },
      { root: scroller, threshold: FULLY_VISIBLE },
    )

    observer.observe(startSentinel)
    observer.observe(endSentinel)

    return () => observer.disconnect()
  }, [])

  return { scrollerRef, startSentinelRef, endSentinelRef }
}
