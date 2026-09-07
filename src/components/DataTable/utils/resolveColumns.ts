import type { CSSProperties } from 'react'
import type { Breakpoint, ColumnAlign, Compare, DataTableColumn, ResolvedColumn, StickySide } from '../DataTable.types'
import { DEFAULT_COLUMN_FLEX, FALLBACK_STICKY_WIDTH_PX, Z_VAR_STICKY_CELL, Z_VAR_STICKY_CORNER } from '../constants'
import { compareValues } from './compare'

/* Turns the authoring-friendly column union into the shape the engine wants, in one
 * place, so no hook downstream contains a `'sortValue' in def` check.
 *
 * Sizing needs no DOM measurement: the table runs `table-layout: fixed` with a <colgroup>
 * and a min-width of every declared width summed. A sticky column emits a px <col> width
 * from its required `minWidth`; the rest emit `calc((100% - <sticky px>) * <flex share>)`.
 * Below the sum the table sits at its min widths, so the prefix sums used for sticky
 * offsets are exact; above it nothing overflows, so the offsets do not matter. Nothing is
 * measured, so the server-rendered output is already correct. */

const ALIGN_CLASS: Record<ColumnAlign, string> = {
  start: 'text-left',
  center: 'text-center',
  end: 'text-right',
}

const parseWidthPx = (value: string | undefined): number | null => {
  if (!value) return null
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : null
}

const normaliseSticky = (sticky: DataTableColumn<unknown>['sticky']): StickySide | false => {
  if (sticky === true) return 'left'
  if (sticky === 'left' || sticky === 'right') return sticky
  return false
}

const headerLabelOf = <T>(def: DataTableColumn<T>): string => {
  if (def.headerLabel) return def.headerLabel
  if (typeof def.headerName === 'string') return def.headerName
  return def.field
}

/** `sortFn` compares whole rows, so the "sort key" for that column IS the row. */
const comparatorFor = <T>(def: DataTableColumn<T>): { comparator: Compare<unknown> | null; sortKeyOf: (row: T) => unknown } => {
  const getValue = (row: T): unknown => (row as Record<string, unknown>)[def.field]

  if (def.sortFn) {
    const sortFn = def.sortFn
    return {
      comparator: (a, b) => sortFn(a as T, b as T),
      sortKeyOf: row => row,
    }
  }

  if (def.sortValue) {
    const sortValue = def.sortValue
    return { comparator: compareValues, sortKeyOf: row => sortValue(row) }
  }

  return { comparator: compareValues, sortKeyOf: getValue }
}

export type ResolveColumnsOptions = {
  /** From `useMediaQuery`, so the decision is reactive but the maths stays pure. */
  readonly isNarrow: boolean
  /** Which breakpoints are active, used to evaluate `hideBelow`. */
  readonly breakpoints: Readonly<Record<Breakpoint, boolean>>
  /** True once the client's media queries have resolved. False during SSR. */
  readonly breakpointsReady: boolean
  /**
   * Width of the expand-toggle column, which is rendered BEFORE every data column and
   * is itself sticky. Left-sticky prefix sums have to start after it, or the first
   * sticky column would sit at left: 0 and overlap the toggle.
   */
  readonly stickyStartOffsetPx: number
}

export type ResolvedColumns<T> = {
  readonly columns: readonly ResolvedColumn<T>[]
  /** Emitted as the table's `min-width`, so horizontal overflow appears on its own. */
  readonly totalMinWidthPx: number
  readonly rowHeaderId: string | null
}

export const resolveColumns = <T>(
  definitions: readonly DataTableColumn<T>[],
  { isNarrow, breakpoints, breakpointsReady, stickyStartOffsetPx }: ResolveColumnsOptions,
): ResolvedColumns<T> => {
  const visible = definitions.filter(def => {
    if (def.hide) return false
    if (!def.hideBelow) return true
    /* Before any media query resolves, keep the column: dropping by default would make
       the server render a narrow table that widens after hydration. */
    if (!breakpointsReady) return true
    return breakpoints[def.hideBelow]
  })

  const seenIds = new Set<string>()

  const withIds = visible.map(def => {
    const id = def.id ?? def.field
    if (process.env.NODE_ENV !== 'production' && seenIds.has(id)) {
      console.warn(`[DataTable] duplicate column id '${id}'. Give one of them an explicit \`id\`.`)
    }
    seenIds.add(id)
    return { id, def }
  })

  /* Below `unstickBelow`, only the first sticky column stays sticky: every later offset
     is a prefix sum of the earlier widths, so the one at offset 0 is the only width that
     can safely be clamped on a narrow screen. */
  let hasKeptSticky = false

  const staged = withIds.map(({ id, def }) => {
    const requestedSticky = normaliseSticky(def.sticky as DataTableColumn<unknown>['sticky'])

    let sticky: StickySide | false = requestedSticky
    if (requestedSticky && isNarrow) {
      sticky = hasKeptSticky ? false : requestedSticky
      if (sticky) hasKeptSticky = true
    }

    if (process.env.NODE_ENV !== 'production' && requestedSticky && !def.minWidth) {
      console.warn(`[DataTable] column '${id}' is sticky but declares no \`minWidth\`. Sticky offsets are prefix sums of px widths.`)
    }

    const widthPx = parseWidthPx(def.minWidth) ?? (sticky ? FALLBACK_STICKY_WIDTH_PX : null)

    return { id, def, sticky, widthPx }
  })

  const stickyTotalPx = staged.reduce((sum, entry) => sum + (entry.sticky ? (entry.widthPx ?? 0) : 0), 0)
  const flexTotal = staged.reduce((sum, entry) => sum + (entry.sticky ? 0 : (entry.def.flex ?? DEFAULT_COLUMN_FLEX)), 0)
  const totalMinWidthPx = stickyStartOffsetPx + staged.reduce((sum, entry) => sum + (entry.widthPx ?? FALLBACK_STICKY_WIDTH_PX), 0)

  /* Sticky offsets: prefix sums from the left, suffix sums from the right. Pure
     arithmetic over declared widths, so there is no `offsetLeft` read anywhere. */
  const leftOffsets = new Map<string, number>()
  let runningLeft = stickyStartOffsetPx
  for (const entry of staged) {
    if (entry.sticky !== 'left') continue
    leftOffsets.set(entry.id, runningLeft)
    runningLeft += entry.widthPx ?? 0
  }

  const rightOffsets = new Map<string, number>()
  let runningRight = 0
  for (const entry of [...staged].reverse()) {
    if (entry.sticky !== 'right') continue
    rightOffsets.set(entry.id, runningRight)
    runningRight += entry.widthPx ?? 0
  }

  const lastLeftSticky = [...staged].reverse().find(entry => entry.sticky === 'left')?.id ?? null
  const firstRightSticky = staged.find(entry => entry.sticky === 'right')?.id ?? null

  const columns: ResolvedColumn<T>[] = staged.map(({ id, def, sticky, widthPx }) => {
    const align: ColumnAlign = def.align ?? 'start'
    const headerAlign: ColumnAlign = def.headerAlign ?? align
    const { comparator, sortKeyOf } = comparatorFor(def)
    const sortable = def.sortable === true

    /* One style object per column, reused by every row. Inline `style={{ left }}` would
       build rows x columns fresh objects per render and defeat every downstream memo. */
    const cellStyle: CSSProperties | undefined = sticky
      ? {
          [sticky === 'left' ? 'left' : 'right']: `${sticky === 'left' ? leftOffsets.get(id) : rightOffsets.get(id)}px`,
          zIndex: Z_VAR_STICKY_CELL,
        }
      : undefined

    const cellClassName = [
      ALIGN_CLASS[align],
      sticky ? 'dt-cell-sticky' : '',
      id === lastLeftSticky ? 'dt-cell-sticky-last-left' : '',
      id === firstRightSticky ? 'dt-cell-sticky-first-right' : '',
      def.className ?? '',
    ]
      .filter(Boolean)
      .join(' ')

    const headerStyle: CSSProperties | undefined = sticky ? { ...cellStyle, zIndex: Z_VAR_STICKY_CORNER } : undefined

    /* Sticky columns are px; the rest split the remainder by flex share as a calc. */
    const colWidth = sticky
      ? `${widthPx ?? FALLBACK_STICKY_WIDTH_PX}px`
      : `calc((100% - ${stickyTotalPx + stickyStartOffsetPx}px) * ${flexTotal > 0 ? (def.flex ?? DEFAULT_COLUMN_FLEX) / flexTotal : 1})`

    return {
      id,
      def,
      colWidth,
      headerLabel: headerLabelOf(def),
      getValue: row => (row as Record<string, unknown>)[def.field],
      comparator: sortable ? comparator : null,
      sortKeyOf,
      sortable,
      sortBy: def.sortBy ?? id,
      sticky,
      isRowHeader: def.isRowHeader === true,
      align,
      headerAlign,
      widthPx,
      flex: def.flex ?? DEFAULT_COLUMN_FLEX,
      cellStyle,
      cellClassName,
      headerStyle,
    }
  })

  const rowHeader = columns.find(column => column.isRowHeader)

  return { columns, totalMinWidthPx, rowHeaderId: rowHeader?.id ?? null }
}
