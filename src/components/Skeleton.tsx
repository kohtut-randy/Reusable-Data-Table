import { cn } from 'utils'

export type SkeletonProps = {
  className?: string
  /** Width as a CSS length or percentage, so a skeleton can match a real column. */
  width?: string
}

/* The shimmer is a background-position animation on a gradient, not an opacity pulse.
   It reads as "content streaming in" rather than "something is blinking", and it
   animates a compositor-friendly property. Stopped entirely under reduced motion by
   dataTable.css. */
export const Skeleton = ({ className, width }: SkeletonProps) => (
  <span
    aria-hidden='true'
    style={width ? { width } : undefined}
    className={cn('dt-shimmer block h-3.5 rounded bg-surface-sunken', className)}
  />
)
