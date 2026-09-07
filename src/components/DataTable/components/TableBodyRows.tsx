import { Fragment } from 'react'
import type { ExpandConfig, ResolvedColumn, RowId, TableRow } from '../DataTable.types'
import type { TableModel } from '../hooks/useDataTable'
import { Row } from './Row'
import { RowDetail } from './RowDetail'

export type TableBodyRowsProps<T, C> = {
  rows: readonly TableRow<T>[]
  columns: readonly ResolvedColumn<T>[]
  expansion: TableModel<T, C>['expansion']
  expandConfig: ExpandConfig<T, C> | undefined
  columnCount: number
  rowHeaderId: string | null
  detailIdFor: (rowId: RowId) => string
  rowHeaderIdFor: (rowId: RowId) => string
  rowClassName: ((row: T, index: number) => string | undefined) | undefined
  onRowClick: ((row: T) => void) | undefined
}

const DEFAULT_TOGGLE_LABEL = (label: string, expanded: boolean): string =>
  expanded ? `Hide details for ${label}` : `Show details for ${label}`

export const TableBodyRows = <T, C>({
  rows,
  columns,
  expansion,
  expandConfig,
  columnCount,
  rowHeaderId,
  detailIdFor,
  rowHeaderIdFor,
  rowClassName,
  onRowClick,
}: TableBodyRowsProps<T, C>) => (
  <>
    {rows.map(entry => {
      const detailId = detailIdFor(entry.id)
      const headerId = rowHeaderIdFor(entry.id)

      /* The toggle's accessible name comes from the generic `getRowLabel` hook, and
         that indirection is exactly what keeps the toggle reusable across datasets:
         the table never knows a row is a class or a payout. */
      const label = expandConfig?.getRowLabel?.(entry.row) ?? `row ${entry.index + 1}`
      const toggleLabel = expandConfig?.toggleLabel?.(entry.row, entry.isExpanded) ?? DEFAULT_TOGGLE_LABEL(label, entry.isExpanded)

      return (
        /* A keyed Fragment, because the row and its detail row are two siblings
           produced by one iteration. The key belongs on the outermost node of the
           list item, so keys on the children alone would leave React unable to match
           the pair across a re-sort. */
        <Fragment key={entry.id}>
          <Row
            rowId={entry.id}
            row={entry.row}
            index={entry.index}
            columns={columns}
            hasExpandColumn={expansion.enabled}
            canExpand={entry.canExpand}
            isExpanded={entry.isExpanded}
            detailId={detailId}
            rowHeaderId={rowHeaderId ? headerId : ''}
            toggleLabel={toggleLabel}
            className={rowClassName?.(entry.row, entry.index)}
            onToggle={expansion.toggle}
            onRowClick={onRowClick}
          />

          {expandConfig && (
            <RowDetail
              row={entry.row}
              rowId={entry.id}
              detail={expansion.detailFor(entry.id)}
              config={expandConfig}
              detailId={detailId}
              rowHeaderId={headerId}
              columnCount={columnCount}
              isExpanded={entry.isExpanded}
              hasMounted={expansion.hasMounted(entry.id)}
              onCollapse={expansion.collapse}
              onRetry={expansion.retry}
            />
          )}
        </Fragment>
      )
    })}
  </>
)
