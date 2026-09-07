import { cn } from 'utils'

export type MeterProps = {
  value: number
  max: number
  /** Accessible text, since the visual bar alone carries the meaning. */
  label: string
  className?: string
}

const FULL_RATIO = 1
const NEAR_FULL_RATIO = 0.85

/* A real `<meter>` element would be semantically ideal but is close to unstyleable
   across engines (the bar is a shadow pseudo-element with different names per browser).
   So this is a div pair with explicit ARIA, which is the honest trade. */
export const Meter = ({ value, max, label, className }: MeterProps) => {
  const ratio = max > 0 ? Math.min(value / max, 1) : 0

  const tone = ratio >= FULL_RATIO ? 'bg-danger' : ratio >= NEAR_FULL_RATIO ? 'bg-warning' : 'bg-success'

  return (
    <span
      role='progressbar'
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn('block h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken', className)}
    >
      {/* scaleX, not width: a width transition would relayout the row. */}
      <span
        aria-hidden='true'
        style={{ transform: `scaleX(${ratio})` }}
        className={cn('block h-full origin-left rounded-full transition-transform duration-300', tone)}
      />
    </span>
  )
}
