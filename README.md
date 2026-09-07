# CRUX Timetable

A staff dashboard for a fictional bouldering gym, built around one component: a generic,
typed `DataTable` with **no table or grid library**. Sorting, pagination, expandable rows,
sticky columns, and loading/empty/error states are all hand-built.

Next.js 16 (Pages Router) + React 19 + TypeScript + Tailwind v4 + yup.

## Setup

Requires Node 22.13+ (see `.nvmrc`). No environment variables; all data is mocked locally.

```bash
npm install
npm run dev        # http://localhost:4000
```

Other scripts: `npm run build` / `npm start` (production), `npm run lint`,
`npm run typecheck`, `npm test` (pure-logic unit tests, also prints sort timings).

## Pages

| Route | Table mode | Expansion |
|---|---|---|
| `/` | Client sort & pagination | Inline child rows |
| `/payouts` | Server sort & pagination | On-demand (lazy-fetched) nested table |
| `/members` | Server sort & pagination | None |
| `/demo` | Smallest example, source shown on page | — |

Every page has a **Simulate states** popover to trigger slow/failed/empty responses
without DevTools. `?sortBy=bogus` and `?page=999` are handled gracefully at both ends.

## `DataTable` API

Single column type in `DataTable.types.ts`:

```ts
type DataTableColumn<T> = {
  field: Extract<keyof T, string>
  id?: string
  headerName?: ReactNode
  sortable?: boolean
  sortBy?: string                    // key sent to server in server mode
  sortFn?: (a: T, b: T) => number
  sortValue?: (row: T) => SortValue  // sort a derived value, display something else
  hide?: boolean
  hideBelow?: 'sm' | 'md' | 'lg' | 'xl'
  minWidth?: string                  // required when sticky
  flex?: number
  sticky?: boolean | 'left' | 'right'
  align?: 'start' | 'center' | 'end'
  isRowHeader?: boolean
  renderCell?: (row: T) => ReactNode
  valueFormatter?: (row: T) => string | number | ReactNode
}
```

Cell render precedence: `renderCell` → `valueFormatter` → `String(row[field])`.
`getRowId` is required: expansion state, the child cache and React keys all key off it.

## Key design decisions

- **Sort mode vs control are orthogonal.** `sortMode: 'client' | 'server'` is independent
  of whether sort state is controlled (`sort`/`onSortChange`) or uncontrolled
  (`defaultSort`) — controlled-ness never implies server mode.
- **Display value ≠ sort value.** e.g. time sorts by parsed instant, attendance by ratio,
  status by domain rank — not by the formatted string.
- **Sizing needs no DOM measurement.** `table-layout: fixed` + `<colgroup>` with widths
  from `minWidth`/`flex`, so sticky offsets (prefix sums) are correct on first render.
- **Expandable rows** converge inline and lazy modes onto one state machine
  (`idle/loading/success/error`), with per-row abort + nonce guarding against races, and a
  cache keyed by `getRowId` (invalidate via `invalidateRowDetail`).
- **State management is plain React** (`useReducer` for the expansion machine,
  `useState`/`useMemo` for the rest) — every piece of state is per-instance UI state, so no
  global store or context is used.
- **`DataTable/` has no dependency on the rest of the app** (no `services/`, `pages/`,
  `server/`, or `next/` imports), enforced by an ESLint rule.

## Accessibility & performance

Real `<table>` semantics (no `role="grid"`), `aria-sort`, `aria-expanded`/`aria-controls`
on toggles, and a debounced `aria-live` region for state announcements. Axe-audited with 0
violations and Lighthouse 100 across all categories. Pagination bounds rendered rows
regardless of dataset size, so no virtualization is needed.

## Known limitations

- Unit tests cover only the pure logic (comparators, page math); components/hooks are
  manually verified rather than covered by RTL.
- No visual-regression tests.
- No column resize/reorder/visibility UI, no row selection, single-column sort only.
- Light theme only.
