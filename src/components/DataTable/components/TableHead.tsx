import type { ResolvedColumn, SortState } from '../DataTable.types'
import { HeaderCell } from './HeaderCell'
import { cn } from 'utils'

export type TableHeadProps<T> = {
  columns: readonly ResolvedColumn<T>[]
  sort: SortState
  hasExpandColumn: boolean
  onSort: (columnId: string) => void
  nextSortFor: (columnId: string) => SortState
}

export const TableHead = <T,>({ columns, sort, hasExpandColumn, onSort, nextSortFor }: TableHeadProps<T>) => (
  <thead>
    <tr>
      {hasExpandColumn && (
        <th scope='col' className={cn('dt-th', 'dt-cell-expand')}>
          {/* The toggle column has no visible header; naming it in the row scope would
              repeat "Expand" on every row. */}
          <span className='sr-only'>Expand row</span>
        </th>
      )}

      {columns.map(column => {
        const direction = sort?.columnId === column.id ? sort.direction : null
        const next = nextSortFor(column.id)
        const nextAction = next === null ? 'none' : next.direction === 'asc' ? 'ascending' : 'descending'

        return <HeaderCell key={column.id} column={column} direction={direction} nextAction={nextAction} onSort={onSort} />
      })}
    </tr>
  </thead>
)
