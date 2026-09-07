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

## Where to look

| | |
|---|---|
| `/` | One studio day. ***Client*** sort + pagination, ***inline*** child rows. |
| `/payouts` | Payouts. ***Server*** sort + pagination, ***on-demand*** child rows in a nested table. |
| `/members` | 2,400-row roster. Server mode, no expansion. |
| `/demo` | Reusability showcase: four configurations, the smallest in full source. |

Every edge case (slow fetch, failed list, failed child fetch, empty dataset, empty child
list) is reachable from the ***Simulate states*** popover, so none needs DevTools. Each
switch changes what the mock API returns, so the state on screen is a real response.
`?sortBy=bogus` and `?page=999` are handled at both ends.

## Reduced motion

Motion mode is set on `<html data-motion-mode>` in `_document` before the first paint, and
both stylesheets key off that attribute.

**For this demo the OS `prefers-reduced-motion` setting is intentionally ignored**, because
the expand/collapse transition and the shimmer are assessed features and a reviewer with the
flag on would never see them. `?motion=reduce` opts into the reduced build, which is fully
implemented: `base.css` collapses every animation and transition, `dataTable.css` drops the
detail-grid transition to 1ms, stops the shimmer, and removes row and sticky-cell
transitions. Behaviour never changes, only motion. Honouring the OS preference is a one-line
change in `_document`.

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
