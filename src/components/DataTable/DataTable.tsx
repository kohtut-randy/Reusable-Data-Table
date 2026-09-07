import { useId, useMemo } from 'react'
import type { DataTableProps } from './DataTable.types'
import { MAX_SKELETON_ROWS } from './constants'
import { ColGroup } from './components/ColGroup'
import { SkeletonRows } from './components/SkeletonRows'
import { TableBodyRows } from './components/TableBodyRows'
import { TableEmptyState } from './components/TableEmptyState'
import { TableErrorState } from './components/TableErrorState'
import { TableHead } from './components/TableHead'
import { TablePagination } from './components/TablePagination'
import { TableScroller } from './components/TableScroller'
import { TableStatus } from './components/TableStatus'
import { useDataTable } from './hooks/useDataTable'
import { useScrollShadow } from './hooks/useScrollShadow'
import { useTableMessage } from './hooks/useTableMessage'
import { cn } from 'utils'

/* The batteries-included entry point. Everything here is presentational: all state and
   cross-cutting behaviour lives in `useDataTable`.

   A real <table>, and deliberately no `role='grid'`. That role is a contract (one tab
   stop, arrow-key cell navigation, Home/End/PageUp/PageDown) and half-implementing it is
   worse for screen-reader users than clean native semantics, because assistive tech
   switches navigation mode and the promised keys then do nothing. */

export const DataTable = <T, C = unknown>(props: DataTableProps<T, C>) => {
  const {
    caption,
    rowNoun,
    className,
    density = 'normal',
    zebra = false,
    stickyHeader = true,
    skeletonRows,
    skeletonRowHeight,
    loading = false,
    fetching = false,
    error = null,
    onRetry,
    emptyState,
    errorState,
    expansion,
    rowClassName,
    onRowClick,
    toolbar,
    footer,
    maxBodyHeight,
  } = props

  const model = useDataTable<T, C>(props)
  const shadow = useScrollShadow()
  const instanceId = useId()

  const message = useTableMessage({
    status: model.status,
    sort: model.activeSort,
    sortLabel: model.activeSort ? model.sortLabelOf(model.activeSort.columnId) : null,
    from: model.range.from,
    to: model.range.to,
    total: model.total,
    noun: rowNoun,
  })

  /* The skeleton count follows the page size, so the table is roughly the same height
     loading as loaded (a fixed 8 rows against a 25-row page measured CLS 0.6). Capped,
     because a 200-row page should not render 200 shimmering rows. */
  const resolvedSkeletonRows = skeletonRows ?? Math.min(model.pageSize, MAX_SKELETON_ROWS)

  const hasExpandColumn = model.expansion.enabled
  const columnCount = model.columns.length + (hasExpandColumn ? 1 : 0)

  /* Id builders, scoped to this instance so two tables on one page cannot collide.

     No context anywhere in the table: every value a row needs already arrives as a prop
     on a memoised component, and row-varying state in context would re-render all 25
     rows to open one. */
  const ids = useMemo(
    () => ({
      detailIdFor: (rowId: string) => `${instanceId}-detail-${rowId}`,
      rowHeaderIdFor: (rowId: string) => `${instanceId}-rowheader-${rowId}`,
    }),
    [instanceId],
  )

  return (
    <div className={cn('relative flex flex-col', className)}>
      {toolbar}

      {/* A thin progress bar for a BACKGROUND refetch. Skeletons are reserved for the
            first load; replacing rows with skeletons on every page change makes a
            dashboard strobe. */}
      {fetching && !loading && (
        <div aria-hidden='true' className='absolute inset-x-0 top-0 h-0.5 overflow-hidden'>
          <span className='dt-shimmer block h-full w-full' />
        </div>
      )}

      <TableScroller {...shadow} label={caption} maxHeight={maxBodyHeight} minWidthPx={model.totalMinWidthPx}>
        <table
          className={cn('dt-table', !stickyHeader && '[&_.dt-th]:static')}
          data-density={density}
          data-zebra={zebra ? 'true' : 'false'}
          aria-busy={loading || fetching || undefined}
        >
          {/* Required prop, so no table can ship unnamed. */}
          <caption className='sr-only'>{caption}</caption>

          <ColGroup columns={model.columns} hasExpandColumn={hasExpandColumn} />

          <TableHead
            columns={model.columns}
            sort={model.activeSort}
            hasExpandColumn={hasExpandColumn}
            onSort={model.toggleSort}
            nextSortFor={model.nextSortFor}
          />

          <tbody>
            {model.status === 'loading' && (
              <SkeletonRows
                columns={model.columns}
                rows={resolvedSkeletonRows}
                hasExpandColumn={hasExpandColumn}
                rowHeight={skeletonRowHeight}
              />
            )}

            {model.status === 'error' &&
              error &&
              (errorState ? (
                <tr>
                  <td colSpan={columnCount}>{errorState({ error, ...(onRetry ? { retry: onRetry } : {}) })}</td>
                </tr>
              ) : (
                <TableErrorState columnCount={columnCount} error={error} onRetry={onRetry} />
              ))}

            {model.status === 'empty' && <TableEmptyState columnCount={columnCount}>{emptyState}</TableEmptyState>}

            {model.status === 'ready' && (
              <TableBodyRows
                rows={model.rows}
                columns={model.columns}
                expansion={model.expansion}
                expandConfig={expansion}
                columnCount={columnCount}
                rowHeaderId={model.rowHeaderId}
                detailIdFor={ids.detailIdFor}
                rowHeaderIdFor={ids.rowHeaderIdFor}
                rowClassName={rowClassName}
                onRowClick={onRowClick}
              />
            )}
          </tbody>
        </table>
      </TableScroller>

      {footer ??
        (model.showFooter && (
          <TablePagination
            pageIndex={model.pageIndex}
            pageSize={model.pageSize}
            pageCount={model.pageCount}
            total={model.total}
            from={model.range.from}
            to={model.range.to}
            pageSizeOptions={model.pageSizeOptions}
            noun={rowNoun}
            onPageIndexChange={model.setPageIndex}
            onPageSizeChange={model.setPageSize}
          />
        ))}

      <TableStatus message={message} />
    </div>
  )
}
