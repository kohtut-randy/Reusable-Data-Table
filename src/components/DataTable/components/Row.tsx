import { memo } from 'react'
import type { ResolvedColumn, RowId } from '../DataTable.types'
import { Cell } from './Cell'
import { ExpandToggle } from './ExpandToggle'
import { cn } from 'utils'

export type RowProps<T> = {
  rowId: RowId
  row: T
  index: number
  columns: readonly ResolvedColumn<T>[]
  hasExpandColumn: boolean
  canExpand: boolean
  isExpanded: boolean
  detailId: string
  rowHeaderId: string
  toggleLabel: string
  className: string | undefined
  onToggle: (rowId: RowId, row: T) => void
  onRowClick: ((row: T) => void) | undefined
}

/* Clicks that start on a control inside the row are not row clicks: otherwise the expand
   toggle would expand and the row click would collapse again. Matching the closest
   interactive ancestor cannot be forgotten the way a stopPropagation per control can. */
const INTERACTIVE_SELECTOR = 'button, a, input, select, textarea, label, [role="menuitem"], [role="menu"], [role="dialog"]'

const isInteractiveTarget = (target: EventTarget | null): boolean =>
  target instanceof Element && target.closest(INTERACTIVE_SELECTOR) !== null

const RowInner = <T,>({
  rowId,
  row,
  columns,
  hasExpandColumn,
  canExpand,
  isExpanded,
  detailId,
  rowHeaderId,
  toggleLabel,
  className,
  onToggle,
  onRowClick,
}: RowProps<T>) => (
  <tr
    data-row-id={rowId}
    data-clickable={onRowClick ? 'true' : undefined}
    onClick={
      onRowClick
        ? event => {
            if (isInteractiveTarget(event.target)) return
            onRowClick(row)
          }
        : undefined
    }
    className={cn('dt-row', className)}
  >
    {hasExpandColumn && (
      <td className='dt-cell-expand'>
        {canExpand && (
          <ExpandToggle
            expanded={isExpanded}
            label={toggleLabel}
            controls={detailId}
            // Bound here rather than in the parent, so the parent hands down ONE stable
            // `onToggle` for every row instead of an arrow per row per render.
            onToggle={() => onToggle(rowId, row)}
          />
        )}
      </td>
    )}

    {columns.map(column => (
      <Cell key={column.id} column={column} row={row} rowHeaderId={column.isRowHeader ? rowHeaderId : undefined} />
    ))}
  </tr>
)

/* The memo boundary of the table. Every prop is a primitive or a permanently stable
   reference, so the default shallow comparator is enough. Cells are deliberately not
   memoised: at ~7 columns the wrapper costs more than the render, and the row is already
   the granularity at which state changes. */
export const Row = memo(RowInner) as typeof RowInner
