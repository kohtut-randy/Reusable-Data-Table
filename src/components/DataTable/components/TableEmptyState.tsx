import type { ReactNode } from 'react'
import { EmptyIcon } from '../../EmptyIcon'

export type TableEmptyStateProps = {
  columnCount: number
  children?: ReactNode
}

const DEFAULT_TITLE = 'Nothing to show'
const DEFAULT_BODY = 'There are no rows for the current filters.'

export const TableEmptyState = ({ columnCount, children }: TableEmptyStateProps) => (
  <tr>
    {/* Spans the full width so the message is centred in the table, not in column one. */}
    <td colSpan={columnCount} className='px-4 py-14'>
      {children ?? (
        <div className='flex flex-col items-center gap-3 text-center'>
          <EmptyIcon className='h-16 w-24' />
          <p className='text-sm font-medium text-ink'>{DEFAULT_TITLE}</p>
          <p className='max-w-[38ch] text-[0.8125rem] text-ink-muted'>{DEFAULT_BODY}</p>
        </div>
      )}
    </td>
  </tr>
)
