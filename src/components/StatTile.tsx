import type { ReactNode } from 'react'
import { Skeleton } from './Skeleton'
import { cn } from 'utils'

export type StatTileProps = {
  label: string
  value: ReactNode
  hint?: ReactNode
  icon?: ReactNode
  loading?: boolean
  className?: string
}

export const StatTile = ({ label, value, hint, icon, loading, className }: StatTileProps) => (
  <div className={cn('flex items-start justify-between gap-3 rounded-xl border border-line bg-surface-raised p-4', className)}>
    <div className='flex min-w-0 flex-col gap-1'>
      <span className='text-xs font-medium text-ink-muted'>{label}</span>
      {loading ? (
        <Skeleton className='mt-1 h-6' width='3.5rem' />
      ) : (
        // Tabular figures so a value change cannot reflow the tile.
        <span className='text-2xl font-semibold [font-variant-numeric:tabular-nums] text-ink'>{value}</span>
      )}
      {hint && <span className='truncate text-xs text-ink-subtle'>{hint}</span>}
    </div>
    {icon && (
      <span
        aria-hidden='true'
        className='grid size-8 shrink-0 place-items-center rounded-lg bg-surface-sunken text-ink-muted [&>svg]:size-4'
      >
        {icon}
      </span>
    )}
  </div>
)
