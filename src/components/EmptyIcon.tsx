import { cn } from 'utils'

export type EmptyIconProps = { className?: string }

/* A hand-drawn empty-state mark rather than a stock illustration or an icon-font glyph.
   It is decorative, so it is aria-hidden: the empty state's text carries the meaning. */
export const EmptyIcon = ({ className }: EmptyIconProps) => (
  <svg viewBox='0 0 96 72' aria-hidden='true' focusable='false' className={cn('text-ink-subtle', className)}>
    <rect x='14' y='16' width='68' height='44' rx='6' fill='none' stroke='currentColor' strokeWidth='2' opacity='0.4' />
    <path d='M14 34h20l5 8h18l5-8h20' fill='none' stroke='currentColor' strokeWidth='2' opacity='0.6' />
    <circle cx='48' cy='27' r='4.5' fill='currentColor' opacity='0.25' />
    <path d='M31 52h34' stroke='currentColor' strokeWidth='2' strokeLinecap='round' opacity='0.2' />
  </svg>
)
