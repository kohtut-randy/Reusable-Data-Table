import { useCallback, useEffect, useMemo } from 'react'
import { useMediaQuery } from 'hooks'
import type { DataTableProps, PageState, ResolvedColumn, RowDetail, RowId, SortState, TableRow, TableStatus } from '../DataTable.types'
import { DEFAULT_PAGE_SIZE, DEFAULT_UNSTICK_BELOW_PX, EXPAND_COLUMN_WIDTH_PX, MAX_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '../constants'
import { resolveColumns } from '../utils/resolveColumns'
import { pageIndexForNewSize } from '../utils/paginate'
import { useBreakpoints } from './useBreakpoints'
import { useControlledState } from './useControlledState'
import { usePagination } from './usePagination'
import { useRowExpansion } from './useRowExpansion'
import { useSorting } from './useSorting'

/* The orchestrator. Composition order is fixed and meaningful:
 *
 *   resolveColumns -> useSorting -> usePagination -> build TableRow[]
 *                  -> useRowExpansion -> status
 *
 * Every cross-cutting behaviour lives here and nowhere else, which is what keeps the leaf
 * hooks pure and independently testable: `useSorting` has no idea pagination exists.
 */

export type TableModel<T, C> = {
  readonly columns: readonly ResolvedColumn<T>[]
  readonly rows: readonly TableRow<T>[]
  readonly totalMinWidthPx: number
  readonly rowHeaderId: string | null

  readonly sort: SortState
  readonly activeSort: SortState
  readonly sortLabelOf: (columnId: string) => string
  readonly toggleSort: (columnId: string) => void
  readonly nextSortFor: (columnId: string) => SortState

  readonly pageIndex: number
  readonly pageSize: number
  readonly pageCount: number
  readonly total: number
  readonly range: { readonly from: number; readonly to: number }
  readonly pageSizeOptions: readonly number[]
  readonly setPageIndex: (next: number) => void
  readonly setPageSize: (next: number) => void
  readonly showFooter: boolean

  readonly expansion: {
    readonly enabled: boolean
    readonly expandedRowIds: ReadonlySet<RowId>
    readonly hasMounted: (rowId: RowId) => boolean
    readonly detailFor: (rowId: RowId) => RowDetail<C>
    readonly toggle: (rowId: RowId, row: T) => void
    readonly collapse: (rowId: RowId) => void
    readonly retry: (rowId: RowId, row: T) => void
  }

  readonly status: TableStatus
}

export const useDataTable = <T, C>(props: DataTableProps<T, C>): TableModel<T, C> => {
  const {
    columns: columnDefs,
    data,
    getRowId,
    loading = false,
    error = null,
    expansion,
    sortMode = 'client',
    enableSortNone = true,
    resetPageOnSortChange = true,
    unstickBelow = DEFAULT_UNSTICK_BELOW_PX,
    pageMode = 'client',
    pageSizeOptions = PAGE_SIZE_OPTIONS,
  } = props

  /* `unstickBelow: false` disables the narrow treatment entirely. The query string is
     built rather than read from a constant because it is caller-configurable. */
  const isNarrow = useMediaQuery(unstickBelow === false ? '(max-width: 0px)' : `(max-width: ${unstickBelow - 0.02}px)`)

  const breakpoints = useBreakpoints()

  const stickyStartOffsetPx = expansion === undefined ? 0 : EXPAND_COLUMN_WIDTH_PX

  const { columns, totalMinWidthPx, rowHeaderId } = useMemo(
    () => resolveColumns(columnDefs, { isNarrow, breakpoints, breakpointsReady: breakpoints.ready, stickyStartOffsetPx }),
    [columnDefs, isNarrow, breakpoints, stickyStartOffsetPx],
  )

  const [sort, setSort] = useControlledState<SortState>({
    value: props.sort,
    defaultValue: props.defaultSort ?? null,
    ...(props.onSortChange ? { onChange: props.onSortChange } : {}),
    name: 'sort',
  })

  const [page, setPage] = useControlledState<PageState>({
    value: props.pagination,
    defaultValue: () => ({
      pageIndex: props.defaultPage?.pageIndex ?? 0,
      pageSize: Math.min(props.defaultPage?.pageSize ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE),
    }),
    ...(props.onPageChange ? { onChange: props.onPageChange } : {}),
    name: 'pagination',
  })

  const { sortedRows, nextSortFor, activeSort } = useSorting({
    rows: data,
    columns,
    sort,
    mode: sortMode,
    enableSortNone,
  })

  const onClamp = useCallback((next: PageState) => setPage(next), [setPage])

  const pagination = usePagination({
    rows: sortedRows,
    page,
    mode: pageMode,
    rowCount: props.pageMode === 'server' ? props.rowCount : undefined,
    onClamp,
  })

  const expansionModel = useRowExpansion<T, C>({ config: expansion })

  /* Sorting resets to page 1: staying on page 7 after a re-sort shows a slice of a
     completely different ordering, which reads as data loss. */
  const toggleSort = useCallback(
    (columnId: string) => {
      const next = nextSortFor(columnId)
      setSort(next)
      if (resetPageOnSortChange) setPage(previous => ({ ...previous, pageIndex: 0 }))
    },
    [nextSortFor, setSort, setPage, resetPageOnSortChange],
  )

  const setPageIndex = useCallback((next: number) => setPage(previous => ({ ...previous, pageIndex: next })), [setPage])

  /* A page-size change keeps the first visible row on screen rather than resetting. */
  const setPageSize = useCallback(
    (nextSize: number) =>
      setPage(previous => ({
        pageIndex: pageIndexForNewSize(previous.pageIndex, previous.pageSize, nextSize),
        pageSize: nextSize,
      })),
    [setPage],
  )

  const rows = useMemo<readonly TableRow<T>[]>(
    () =>
      pagination.pageRows.map((row, index) => {
        const id = getRowId(row, index)
        return {
          id,
          row,
          index,
          canExpand: expansionModel.canExpand(row),
          isExpanded: expansionModel.expandedRowIds.has(id),
        }
      }),
    [pagination.pageRows, getRowId, expansionModel],
  )

  /* Resolve any row that is expanded but has no detail yet: otherwise a fetch would
     only ever start from a click. */
  useEffect(() => {
    expansionModel.ensureDetails(rows.map(entry => ({ id: entry.id, row: entry.row })))
  }, [rows, expansionModel])

  /* Dev guard on row identity: a duplicate or empty id collapses the wrong row after a
     sort and corrupts the child cache, and the symptom looks like a rendering glitch. */
  if (process.env.NODE_ENV !== 'production' && rows.length > 0) {
    const seen = new Set<RowId>()
    for (const row of rows) {
      if (!row.id) {
        console.warn('[DataTable] getRowId returned an empty id. Row identity must be stable and non-empty.')
        break
      }
      if (seen.has(row.id)) {
        console.warn(`[DataTable] duplicate row id '${row.id}' on this page. Expansion state will collapse the wrong row.`)
        break
      }
      seen.add(row.id)
    }
  }

  const status: TableStatus = loading ? 'loading' : error ? 'error' : rows.length === 0 ? 'empty' : 'ready'

  const sortLabelOf = useCallback((columnId: string) => columns.find(column => column.id === columnId)?.headerLabel ?? columnId, [columns])

  return {
    columns,
    rows,
    totalMinWidthPx,
    rowHeaderId,

    sort,
    activeSort,
    sortLabelOf,
    toggleSort,
    nextSortFor,

    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    pageCount: pagination.pageCount,
    total: pagination.total,
    range: pagination.range,
    pageSizeOptions,
    setPageIndex,
    setPageSize,
    showFooter: pageMode !== 'none',

    expansion: {
      enabled: expansionModel.enabled,
      expandedRowIds: expansionModel.expandedRowIds,
      hasMounted: expansionModel.hasMounted,
      detailFor: expansionModel.detailFor,
      toggle: expansionModel.toggle,
      collapse: expansionModel.collapse,
      retry: expansionModel.retry,
    },

    status,
  }
}
