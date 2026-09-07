import type { ReactNode } from 'react'
import type { ScrollShadowRefs } from '../hooks/useScrollShadow'
import { cn } from 'utils'

export type TableScrollerProps = ScrollShadowRefs & {
  children: ReactNode
  label: string
  maxHeight: number | string | undefined
  /** Emitted as the CONTENT width, which is what makes horizontal overflow appear. */
  minWidthPx: number
  className?: string
}

export const TableScroller = ({
  children,
  label,
  maxHeight,
  minWidthPx,
  className,
  scrollerRef,
  startSentinelRef,
  endSentinelRef,
}: TableScrollerProps) => (
  /* `tabIndex={0}` + `role='region'` + a label, so a keyboard user can scroll an
     overflowing table with the arrow keys. WCAG 2.1.1: a scrollable area reachable only
     with a pointer is a keyboard trap in reverse. */
  <div
    ref={scrollerRef}
    role='region'
    aria-label={label}
    tabIndex={0}
    style={maxHeight === undefined ? undefined : { maxHeight, overflowY: 'auto' }}
    className={cn('dt-scroller outline-offset-2 focus-visible:outline-2 focus-visible:outline-focus', className)}
  >
    {/* The content wrapper carries the min-width, so `right: 0` means the end of the
        content. The sentinels must resolve against the scrolled content: as a child of
        the scroller itself, the end sentinel stays visible and its shadow never fires. */}
    <div className='relative' style={{ minWidth: `${minWidthPx}px` }}>
      <div ref={startSentinelRef} aria-hidden='true' className='dt-sentinel dt-sentinel-start' />
      {children}
      <div ref={endSentinelRef} aria-hidden='true' className='dt-sentinel dt-sentinel-end' />
    </div>
  </div>
)
