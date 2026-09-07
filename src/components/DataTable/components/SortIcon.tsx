import type { SortDirection } from '../DataTable.types'
import { cn } from 'utils'

export type SortIconProps = { direction: SortDirection | null }

/* Two chevrons, one dimmed. Rotation and opacity only, so the transition composites.
   Both arrows always render, so the header's width never changes when the sort state
   does, which would otherwise shift the whole column on every click. */
export const SortIcon = ({ direction }: SortIconProps) => (
  <span aria-hidden='true' className='ml-1 inline-flex flex-col leading-none'>
    <svg
      viewBox='0 0 10 6'
      className={cn('h-[5px] w-2.5 transition-opacity duration-150', direction === 'asc' ? 'opacity-100' : 'opacity-25')}
    >
      <path d='M5 0 10 6H0z' fill='currentColor' />
    </svg>
    <svg
      viewBox='0 0 10 6'
      className={cn('mt-0.5 h-[5px] w-2.5 transition-opacity duration-150', direction === 'desc' ? 'opacity-100' : 'opacity-25')}
    >
      <path d='M5 6 0 0h10z' fill='currentColor' />
    </svg>
  </span>
)
