import type { ResolvedColumn } from '../DataTable.types'
import { Skeleton } from '../../Skeleton'
import { cn } from 'utils'

export type SkeletonRowsProps<T> = {
  columns: readonly ResolvedColumn<T>[]
  rows: number
  hasExpandColumn: boolean
  /** Real row height in px, so the loading table matches the loaded one. */
  rowHeight: number | undefined
}

/* Skeleton rows that match the column layout rather than a centred spinner. They render
   inside the same <colgroup>, so each placeholder sits at the width its real column will
   have and content arrives without the table resizing. `aria-hidden` on the cells, with
   `aria-busy` on the table, so assistive tech hears "loading" once. */

const WIDTH_BY_ALIGN = { start: '72%', center: '48%', end: '54%' } as const

export const SkeletonRows = <T,>({ columns, rows, hasExpandColumn, rowHeight }: SkeletonRowsProps<T>) => (
  <>
    {Array.from({ length: rows }, (_, rowIndex) => (
      <tr key={rowIndex} className='dt-row' aria-hidden='true' style={rowHeight === undefined ? undefined : { height: `${rowHeight}px` }}>
        {hasExpandColumn && (
          <td className='dt-cell-expand'>
            <Skeleton className='size-4 rounded' />
          </td>
        )}
        {columns.map(column => (
          <td key={column.id} className={cn(column.cellClassName)} style={column.cellStyle}>
            <span
              className={cn(
                'flex',
                column.align === 'end' ? 'justify-end' : column.align === 'center' ? 'justify-center' : 'justify-start',
              )}
            >
              <Skeleton width={WIDTH_BY_ALIGN[column.align]} />
            </span>
          </td>
        ))}
      </tr>
    ))}
  </>
)
