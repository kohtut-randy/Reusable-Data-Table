import type { ResolvedColumn } from '../DataTable.types'
import { TruncatedText } from '../../TruncatedText'
import { cn } from 'utils'

export type CellProps<T> = {
  column: ResolvedColumn<T>
  row: T
  rowHeaderId: string | undefined
}

/* Render precedence: renderCell(row) -> valueFormatter(row) -> String(row[field]). Only
   the latter two are wrapped in TruncatedText, since a custom `renderCell` owns its own
   layout and a single-line ellipsis container would clip it. */
export const Cell = <T,>({ column, row, rowHeaderId }: CellProps<T>) => {
  const { def } = column

  const content = def.renderCell ? (
    def.renderCell(row)
  ) : (
    <TruncatedText>{def.valueFormatter ? def.valueFormatter(row) : String(column.getValue(row) ?? '')}</TruncatedText>
  )

  const customStyle = typeof def.customStyle === 'function' ? def.customStyle(row) : def.customStyle

  /* The row-header column renders <th scope='row'>, which is what gives each row an
     accessible name. It is also the column worth making sticky, so the two decisions
     reinforce each other rather than being independent choices. */
  if (column.isRowHeader) {
    return (
      <th
        scope='row'
        id={rowHeaderId}
        style={customStyle ? { ...column.cellStyle, ...customStyle } : column.cellStyle}
        className={cn('font-medium text-ink', column.cellClassName)}
      >
        {content}
      </th>
    )
  }

  return (
    <td
      style={customStyle ? { ...column.cellStyle, ...customStyle } : column.cellStyle}
      className={cn('text-ink-muted', column.cellClassName)}
    >
      {content}
    </td>
  )
}
