import type { SortState } from '../DataTable.types'

/** The header-click cycle: none -> asc -> desc -> none, or a plain asc/desc toggle when
 *  `enableNone` is false. A different column always restarts at ascending, since carrying
 *  the direction over gives newest-first when the user meant oldest-first. */
export const cycleSort = (current: SortState, columnId: string, enableNone: boolean): SortState => {
  if (current?.columnId !== columnId) return { columnId, direction: 'asc' }
  if (current.direction === 'asc') return { columnId, direction: 'desc' }
  return enableNone ? null : { columnId, direction: 'asc' }
}
