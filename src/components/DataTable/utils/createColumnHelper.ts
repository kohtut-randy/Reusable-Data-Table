import type { DataTableColumn } from '../DataTable.types'

/** Pins the row type once so `field`, `sortValue` and `renderCell` are checked inside each
 *  column literal, and a typo fails at that column. Identity at runtime: the value is all
 *  in the type position. */
export const createColumnHelper =
  <T>() =>
  (definition: DataTableColumn<T>): DataTableColumn<T> =>
    definition
