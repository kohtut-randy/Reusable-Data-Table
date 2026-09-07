import type { CSSProperties, ReactNode } from 'react'

/* The DataTable's entire public API surface. */

export type RowId = string

export type SortDirection = 'asc' | 'desc'

/** `null` means unsorted. `undefined` is reserved for "uncontrolled", so a controlled
 *  table that is currently unsorted must pass `sort={null}`. */
export type SortState = { readonly columnId: string; readonly direction: SortDirection } | null

/** `pageIndex` is 0-based INTERNALLY, and 1-based in the UI and in URLs. */
export type PageState = { readonly pageIndex: number; readonly pageSize: number }

export type Compare<V> = (a: V, b: V) => number

export type SortValue = string | number | boolean | Date | null | undefined

export type ColumnAlign = 'start' | 'center' | 'end'

export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl'

export type SortMode = 'client' | 'server'

export type PageMode = 'client' | 'server' | 'none'

/** `true` is shorthand for `'left'`, which is the common case. */
export type StickySide = 'left' | 'right'

/* One column kind only. Both render hooks take the whole row rather than an extracted
   value, so a computed column needs no separate variant and nothing needs a cast. */
export type DataTableColumn<T> = {
  /** Data key, constrained to `keyof T`, so a typo fails to compile. */
  readonly field: Extract<keyof T, string>

  /** Defaults to `field`. Set it when two columns share a field. */
  readonly id?: string

  readonly headerName?: ReactNode

  /** Plain-text label for `aria-label` and live-region copy when `headerName` is a node. */
  readonly headerLabel?: string

  readonly sortable?: boolean

  /** Sort key sent to the server in server mode. Defaults to `id`. */
  readonly sortBy?: string

  /** Row comparator, for anything the default value comparison gets wrong. */
  readonly sortFn?: (a: T, b: T) => number

  /** Sort on a derived primitive while displaying something else: show `10:00 AM`, sort by the epoch instant. */
  readonly sortValue?: (row: T) => SortValue

  readonly hide?: boolean

  /** Drop the column below this breakpoint. */
  readonly hideBelow?: Breakpoint

  /** px string. Required when `sticky` is set: sticky offsets are prefix sums of declared widths. Asserted in dev. */
  readonly minWidth?: string

  /** Share of the remaining width, for non-sticky columns. Default 1. */
  readonly flex?: number

  /** `true` means `'left'`. */
  readonly sticky?: boolean | StickySide

  readonly headerAlign?: ColumnAlign
  readonly align?: ColumnAlign

  /** Render as `<th scope='row'>`, giving the row its accessible name. Max one per table. */
  readonly isRowHeader?: boolean

  readonly className?: string
  readonly headerClassName?: string

  readonly customStyle?: CSSProperties | ((row: T) => CSSProperties | undefined)

  /** Highest precedence renderer. */
  readonly renderCell?: (row: T) => ReactNode

  /** Used when there is no `renderCell`. Wrapped in `TruncatedText`. */
  readonly valueFormatter?: (row: T) => string | number | ReactNode
}

/** Required, not optional: expansion state, the child cache and React keys all have to
 *  survive sorting and paging. An index fallback collapses the wrong row after a sort. */
export type GetRowId<T> = (row: T, index: number) => RowId

/* Expansion: one surface, two modes. Inline resolves synchronously to `success`, so
   every presentational component renders one state machine and never checks the mode. */
export type RowDetail<C> =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'success'; readonly data: readonly C[] }
  | { readonly status: 'error'; readonly error: Error }

export type ExpandContext<T, C> = {
  readonly row: T
  readonly rowId: RowId
  readonly children: readonly C[]
  readonly collapse: () => void
}

type ExpandBase<T> = {
  readonly canExpand?: (row: T) => boolean

  /** Controlled. */
  readonly expandedRowIds?: ReadonlySet<RowId>

  /** Uncontrolled initial value. */
  readonly defaultExpandedRowIds?: Iterable<RowId>

  readonly onExpandedChange?: (next: ReadonlySet<RowId>, meta: { readonly rowId: RowId; readonly expanded: boolean }) => void

  /** `false` makes it an accordion. Default `true`. */
  readonly allowMultiple?: boolean

  /** Names the row in the toggle's accessible label and in live-region copy. */
  readonly getRowLabel?: (row: T) => string

  readonly toggleLabel?: (row: T, expanded: boolean) => string
}

export type InlineExpand<T, C> = ExpandBase<T> & {
  readonly mode: 'inline'
  readonly getChildren: (row: T) => readonly C[] | null | undefined
  readonly renderContent: (context: ExpandContext<T, C>) => ReactNode
  readonly renderEmpty?: (context: { row: T }) => ReactNode
}

export type LazyExpand<T, C> = ExpandBase<T> & {
  readonly mode: 'lazy'
  readonly fetchChildren: (row: T, signal: AbortSignal) => Promise<readonly C[]>
  readonly renderContent: (context: ExpandContext<T, C>) => ReactNode
  readonly renderLoading?: (context: { row: T }) => ReactNode
  readonly renderError?: (context: { row: T; error: Error; retry: () => void }) => ReactNode
  readonly renderEmpty?: (context: { row: T }) => ReactNode
  /** Default `true`. Collapsing keeps the entry, so re-expanding makes no request. */
  readonly cache?: boolean
}

/** `mode` is the discriminant. Nothing ever sniffs for the presence of `fetchChildren`. */
export type ExpandConfig<T, C> = InlineExpand<T, C> | LazyExpand<T, C>

/* Props */

export type SortProps = {
  /** Controlled. */
  readonly sort?: SortState
  /** Uncontrolled initial value. */
  readonly defaultSort?: SortState
  readonly onSortChange?: (next: SortState) => void

  /** Default `'client'`. Not inferred from controlled-ness: syncing sort to the URL over
   *  a local dataset would then silently stop the table sorting. */
  readonly sortMode?: SortMode

  /** `true` (default) cycles none -> asc -> desc -> none. `false` toggles asc and desc. */
  readonly enableSortNone?: boolean

  /** Default `true`. */
  readonly resetPageOnSortChange?: boolean
}

/** In server mode `rowCount` and `onPageChange` are required at compile time: the table
 *  cannot compute its own page count, and unheard page changes are a dead end. */
export type PaginationProps =
  | {
      readonly pageMode?: 'client' | 'none'
      readonly rowCount?: never
      readonly pagination?: PageState
      readonly defaultPage?: Partial<PageState>
      readonly onPageChange?: (next: PageState) => void
      readonly pageSizeOptions?: readonly number[]
    }
  | {
      readonly pageMode: 'server'
      readonly rowCount: number
      readonly pagination?: PageState
      readonly defaultPage?: Partial<PageState>
      readonly onPageChange: (next: PageState) => void
      readonly pageSizeOptions?: readonly number[]
    }

export type DataTableBaseProps<T, C> = {
  readonly columns: readonly DataTableColumn<T>[]

  /** Never mutated. Sorting copies. */
  readonly data: readonly T[]

  readonly getRowId: GetRowId<T>

  /** Initial load. Renders column-shaped skeleton rows. */
  readonly loading?: boolean

  /** Background refetch. Keeps rows on screen with `aria-busy` and a progress bar. */
  readonly fetching?: boolean

  readonly error?: Error | null
  readonly onRetry?: () => void

  readonly expansion?: ExpandConfig<T, C>

  /** Required, so no table ever ships unnamed. Rendered as an sr-only `<caption>`. */
  readonly caption: string

  /** Plural noun for the rows: "Showing 1 to 25 of 1200 payouts". */
  readonly rowNoun: string

  readonly density?: 'compact' | 'normal'
  readonly stickyHeader?: boolean
  readonly zebra?: boolean
  readonly skeletonRows?: number

  /** Height of one real row, in px, applied to the skeleton rows. Set it when rows are
   *  taller than one line of text: on the first load there is nothing to measure, and
   *  that is the load that shifts (CLS 0.31 on the timetable before this). */
  readonly skeletonRowHeight?: number

  readonly emptyState?: ReactNode
  readonly errorState?: (context: { error: Error; retry?: () => void }) => ReactNode

  readonly rowClassName?: (row: T, index: number) => string | undefined
  readonly onRowClick?: (row: T) => void

  readonly toolbar?: ReactNode
  readonly footer?: ReactNode

  /** Viewport width below which only the FIRST sticky column stays sticky. Default 640. */
  readonly unstickBelow?: number | false

  readonly className?: string
  readonly maxBodyHeight?: number | string
}

export type DataTableProps<T, C = unknown> = DataTableBaseProps<T, C> & SortProps & PaginationProps

/* Internal shapes. Exported for the hooks and tests, not part of the public API. */

/** The public column type optimises for authoring, this one for the engine: every hook
 *  downstream sees only `ResolvedColumn`, never a `'sortValue' in def` check. */
export type ResolvedColumn<T> = {
  readonly id: string
  readonly def: DataTableColumn<T>
  readonly headerLabel: string
  readonly getValue: (row: T) => unknown
  /** `null` means not sortable. */
  readonly comparator: Compare<unknown> | null
  readonly sortKeyOf: (row: T) => unknown
  readonly sortable: boolean
  readonly sortBy: string
  readonly sticky: StickySide | false
  readonly isRowHeader: boolean
  readonly align: ColumnAlign
  readonly headerAlign: ColumnAlign
  /** Parsed px width. Used for sticky prefix sums and for the table's min-width. */
  readonly widthPx: number | null
  readonly flex: number
  /** The exact string emitted into `<colgroup>`: px when sticky, a calc share otherwise. */
  readonly colWidth: string
  /** Precomputed and identity-stable across every row. */
  readonly cellStyle: CSSProperties | undefined
  readonly cellClassName: string
  readonly headerStyle: CSSProperties | undefined
}

export type TableStatus = 'loading' | 'error' | 'empty' | 'ready'

export type TableRow<T> = {
  readonly id: RowId
  readonly row: T
  readonly index: number
  readonly canExpand: boolean
  readonly isExpanded: boolean
}
