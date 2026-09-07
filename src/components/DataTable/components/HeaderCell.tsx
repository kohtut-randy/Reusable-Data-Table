import { memo } from 'react'
import type { ResolvedColumn, SortDirection } from '../DataTable.types'
import { SortIcon } from './SortIcon'
import { cn } from 'utils'

export type HeaderCellProps<T> = {
  column: ResolvedColumn<T>
  direction: SortDirection | null
  /** What the NEXT click will do, so the control announces its action not its state. */
  nextAction: 'ascending' | 'descending' | 'none'
  onSort: (columnId: string) => void
}

const ALIGN_JUSTIFY = { start: 'justify-start', center: 'justify-center', end: 'justify-end' } as const

const NEXT_ACTION_LABEL = {
  ascending: 'Sort ascending',
  descending: 'Sort descending',
  none: 'Clear sort',
} as const

const HeaderCellInner = <T,>({ column, direction, nextAction, onSort }: HeaderCellProps<T>) => {
  /* `aria-sort` is set EXPLICITLY including 'none' on every sortable header, and is
     absent entirely on non-sortable ones. A missing aria-sort on a sortable column
     reads as "not sortable"; 'none' reads as "sortable, currently unsorted". */
  const ariaSort = column.sortable ? (direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none') : undefined

  const content = (
    <span className={cn('flex items-center', ALIGN_JUSTIFY[column.headerAlign])}>
      <span className='truncate'>{column.def.headerName ?? column.headerLabel}</span>
      {column.sortable && <SortIcon direction={direction} />}
    </span>
  )

  return (
    <th
      scope='col'
      aria-sort={ariaSort}
      style={column.headerStyle}
      className={cn('dt-th', column.cellClassName, column.def.headerClassName)}
    >
      {/* A real button filling the cell, never a click handler on the <th>. A <th> is
          not focusable or keyboard-operable, so a handler there is mouse-only. */}
      {column.sortable ? (
        <button
          type='button'
          onClick={() => onSort(column.id)}
          className='dt-focus-ring -mx-1 flex w-full cursor-pointer items-center rounded px-1 py-0.5 transition-colors duration-100 hover:text-ink'
        >
          {content}
          <span className='sr-only'>, {NEXT_ACTION_LABEL[nextAction]}</span>
        </button>
      ) : (
        content
      )}
    </th>
  )
}

/* Memoised on the column and its sort direction. Without it, every header re-renders on
   every row expand. */
export const HeaderCell = memo(HeaderCellInner) as typeof HeaderCellInner
