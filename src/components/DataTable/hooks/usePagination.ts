import { useEffect, useMemo } from 'react'
import type { PageMode, PageState } from '../DataTable.types'
import { clampPageIndex, getPageCount, getVisibleRange, sliceRows } from '../utils/paginate'

export type UsePaginationOptions<T> = {
  readonly rows: readonly T[]
  readonly page: PageState
  readonly mode: PageMode
  /** Required in server mode; the table cannot know the total from one page of rows. */
  readonly rowCount: number | undefined
  /** Called only when the clamped page differs from the requested one. */
  readonly onClamp: (next: PageState) => void
}

export type PaginationModel<T> = {
  readonly pageRows: readonly T[]
  readonly pageCount: number
  readonly total: number
  readonly pageIndex: number
  readonly pageSize: number
  readonly range: { readonly from: number; readonly to: number }
}

/**
 * No state, and clamping is pure: render uses the clamped value, then one effect
 * converges the stored state so the URL agrees with what is on screen. It cannot loop,
 * because `useControlledState` drops no-op writes. A dataset shrinking under the user
 * takes the same path: `pageCount` drops, the clamp pulls `pageIndex` down.
 */
export const usePagination = <T>({ rows, page, mode, rowCount, onClamp }: UsePaginationOptions<T>): PaginationModel<T> => {
  const total = mode === 'server' ? (rowCount ?? 0) : rows.length
  const pageCount = mode === 'none' ? 1 : getPageCount(total, page.pageSize)
  const pageIndex = mode === 'none' ? 0 : clampPageIndex(page.pageIndex, pageCount)

  // One job: converge the stored page onto the clamped one.
  useEffect(() => {
    if (mode === 'none') return
    if (pageIndex === page.pageIndex) return
    onClamp({ pageIndex, pageSize: page.pageSize })
  }, [mode, pageIndex, page.pageIndex, page.pageSize, onClamp])

  const pageRows = useMemo(() => {
    if (mode === 'none') return rows
    // In server mode the parent already sent exactly one page, so slicing again would
    // show a page of a page.
    if (mode === 'server') return rows
    return sliceRows(rows, pageIndex, page.pageSize)
  }, [rows, mode, pageIndex, page.pageSize])

  const range = useMemo(
    () => (mode === 'none' ? { from: rows.length > 0 ? 1 : 0, to: rows.length } : getVisibleRange(pageIndex, page.pageSize, total)),
    [mode, rows.length, pageIndex, page.pageSize, total],
  )

  return { pageRows, pageCount, total, pageIndex, pageSize: page.pageSize, range }
}
