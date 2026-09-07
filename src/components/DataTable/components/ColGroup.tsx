import type { ResolvedColumn } from '../DataTable.types'
import { EXPAND_COLUMN_WIDTH_PX } from '../constants'

export type ColGroupProps<T> = {
  columns: readonly ResolvedColumn<T>[]
  hasExpandColumn: boolean
}

/* The colgroup is what makes `table-layout: fixed` deterministic: the browser sizes
   columns from these widths alone and never measures cell content. That is also why
   sticky offsets can be pure arithmetic instead of DOM reads. */
export const ColGroup = <T,>({ columns, hasExpandColumn }: ColGroupProps<T>) => (
  <colgroup>
    {hasExpandColumn && <col style={{ width: `${EXPAND_COLUMN_WIDTH_PX}px` }} />}
    {columns.map(column => (
      <col key={column.id} style={{ width: column.colWidth }} />
    ))}
  </colgroup>
)
