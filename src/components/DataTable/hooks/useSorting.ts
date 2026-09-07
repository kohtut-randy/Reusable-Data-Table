import { useMemo } from 'react'
import type { ResolvedColumn, SortMode, SortState } from '../DataTable.types'
import { sortRowsBy } from '../utils/compare'
import { cycleSort } from '../utils/cycleSort'

export type UseSortingOptions<T> = {
  readonly rows: readonly T[]
  readonly columns: readonly ResolvedColumn<T>[]
  readonly sort: SortState
  readonly mode: SortMode
  readonly enableSortNone: boolean
}

export type SortingModel<T> = {
  readonly sortedRows: readonly T[]
  readonly nextSortFor: (columnId: string) => SortState
  /** The sort actually being applied. `null` when the key is invalid or mode is server. */
  readonly activeSort: SortState
  readonly isSortKeyValid: boolean
}

/**
 * No state: a pure derivation plus one `useMemo`. The dependency list deliberately
 * excludes the expanded set, so expanding a row can never re-sort the dataset.
 */
export const useSorting = <T>({ rows, columns, sort, mode, enableSortNone }: UseSortingOptions<T>): SortingModel<T> => {
  const columnId = sort?.columnId ?? null
  const direction = sort?.direction ?? null

  const column = useMemo(() => (columnId === null ? undefined : columns.find(candidate => candidate.id === columnId)), [columns, columnId])

  const isSortKeyValid = columnId === null || (column !== undefined && column.sortable)

  /* An invalid sort key (`?sortBy=bogus`, a removed column) renders unsorted and warns in
     dev. It deliberately does not call `onSortChange(null)` to "fix" itself: that would
     fight a controlled parent that owns the URL and could clobber a valid deep link. */
  if (process.env.NODE_ENV !== 'production' && !isSortKeyValid) {
    console.warn(
      `[DataTable] '${columnId}' is not a sortable column id. Rendering unsorted. Sortable ids: ${columns
        .filter(candidate => candidate.sortable)
        .map(candidate => candidate.id)
        .join(', ')}`,
    )
  }

  const activeSort = isSortKeyValid && columnId !== null && direction !== null ? { columnId, direction } : null

  const sortedRows = useMemo(() => {
    /* The one place sort is applied. In server mode the parent has already ordered the
       data, and re-sorting the page in place would break the order across page
       boundaries. Ownership is a separate axis, resolved by `useControlledState`. */
    if (mode === 'server') return rows
    if (!column || !column.comparator || direction === null || !isSortKeyValid) return rows

    return sortRowsBy(rows, column.sortKeyOf, column.comparator, direction)
  }, [rows, column, direction, mode, isSortKeyValid])

  const nextSortFor = (candidateId: string): SortState => cycleSort(sort, candidateId, enableSortNone)

  return { sortedRows, nextSortFor, activeSort, isSortKeyValid }
}
