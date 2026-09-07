/* Pure page maths. `pageIndex` is 0-based here and everywhere inside the table; it is
   1-based only in the UI and in URLs, converted at those two edges. */

export const clampPageIndex = (index: number, pageCount: number): number =>
  Number.isFinite(index) ? Math.min(Math.max(Math.trunc(index), 0), Math.max(pageCount - 1, 0)) : 0

/** At least 1, so an empty dataset reads "Page 1 of 1", never "Page 1 of 0". */
export const getPageCount = (total: number, pageSize: number): number => (pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1)

export const sliceRows = <T>(rows: readonly T[], pageIndex: number, pageSize: number): readonly T[] => {
  const start = pageIndex * pageSize
  return rows.slice(start, start + pageSize)
}

/** Keeps the first visible row on screen when the page size changes: 25 to 50 on page 3
 *  (rows 51-75) lands on page 2 (rows 51-100), rather than jumping back to page 1. */
export const pageIndexForNewSize = (pageIndex: number, pageSize: number, nextSize: number): number =>
  nextSize > 0 ? Math.floor((pageIndex * pageSize) / nextSize) : 0

/** 1-based inclusive range for the "Showing 1 to 25 of 120" readout. */
export const getVisibleRange = (pageIndex: number, pageSize: number, total: number): { readonly from: number; readonly to: number } => {
  if (total === 0) return { from: 0, to: 0 }
  const from = pageIndex * pageSize + 1
  return { from, to: Math.min(from + pageSize - 1, total) }
}
