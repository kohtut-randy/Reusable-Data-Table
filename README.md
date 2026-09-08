# Reusable Data Table

A staff dashboard for a fictional bouldering gym, built around one reusable component: a
generic, typed `DataTable` with **no table or grid library**. Sorting, pagination,
expandable rows, sticky columns, and loading/empty/error states are all hand-built.

Next.js 16 (Pages Router) + React 19 + TypeScript + Tailwind v4 + yup.

- **Live URL:** https://reusable-data-table-sage.vercel.app/
- **Repo:** https://github.com/kohtut-randy/Reusable-Data-Table

## Setup

Requires Node 22.13+ (see `.nvmrc`). No environment variables; all data is mocked locally.

```bash
npm install
npm run dev        # http://localhost:4000
```

Other scripts: `npm run build` / `npm start` (production), `npm run lint`,
`npm run typecheck`, `npm test` (pure-logic unit tests, also prints sort timings).

## Pages

| Route      | Table mode                             | Expansion                             |
| ---------- | --------------------------------------- | -------------------------------------- |
| `/`        | Client sort & pagination               | Inline child rows                     |
| `/payouts` | Server sort & pagination               | On-demand (lazy-fetched) nested table |
| `/members` | Server sort & pagination               | None                                  |
| `/demo`    | Smallest example, source shown on page | —                                     |

Every page has a **Simulate states** popover to trigger slow/failed/empty responses
without DevTools. `?sortBy=bogus` and `?page=999` are handled gracefully at both ends.

## `DataTable` API

Single column type in `DataTable.types.ts`:

```ts
type DataTableColumn<T> = {
  field: Extract<keyof T, string>;
  id?: string;
  headerName?: ReactNode;
  sortable?: boolean;
  sortBy?: string; // key sent to server in server mode
  sortFn?: (a: T, b: T) => number;
  sortValue?: (row: T) => SortValue; // sort a derived value, display something else
  hide?: boolean;
  hideBelow?: "sm" | "md" | "lg" | "xl";
  minWidth?: string; // required when sticky
  flex?: number;
  sticky?: boolean | "left" | "right";
  align?: "start" | "center" | "end";
  isRowHeader?: boolean;
  renderCell?: (row: T) => ReactNode;
  valueFormatter?: (row: T) => string | number | ReactNode;
};
```

- Cell precedence: `renderCell` → `valueFormatter` → `String(row[field])`. Computed
  columns need no separate variant, since `renderCell` gets the whole row.
- **Display value ≠ sort value.** Time sorts by parsed instant, attendance by ratio (9/10
  outranks 12/20), status by domain rank, not by the formatted string.
- **Sizing needs no DOM measurement.** `table-layout: fixed` + `<colgroup>` with widths
  from `minWidth`/`flex`, so sticky offsets (prefix sums) are correct on first render with
  no hydration jump.
- `getRowId` is required: expansion state, the child cache and React keys all key off it,
  and an index fallback collapses the wrong row after a sort.

## Sort & pagination: client vs server

**Sort mode and control are orthogonal axes.** `sortMode: 'client' | 'server'` is
independent of whether state is controlled (`sort`/`onSortChange`) or uncontrolled
(`defaultSort`).

|              | client                                 | server                          |
| ------------ | --------------------------------------- | -------------------------------- |
| uncontrolled | plain local table                      | table owns state, caller reacts |
| controlled   | page owns sort, data stays local (`/`) | `/payouts`, `/members`          |

- Controlled-ness never implies server mode. Inferring it is the classic footgun: sync
  sort to the URL over a local array and the table silently stops sorting.
- Both modes import the **same comparator**, so they cannot diverge at nulls, mixed types
  or numeric strings. Nulls sort last in both directions.
- Bad input degrades at both ends: an invalid sort key renders unsorted with
  `aria-sort="none"` (and does _not_ self-correct, which would fight a controlled parent),
  and out-of-range pages clamp identically at render and in the route.
- `/` fetches one studio day whole, which is what makes its client pagination honest. A
  server page of 25 handed to a client-paginating table reports "1 to 25 of 25".

## Expandable rows, both modes

`mode` is the discriminant; nothing sniffs for `fetchChildren`. Both modes converge on one
state machine, so no component below that seam knows which mode is active:

```ts
type RowDetail<C> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: readonly C[] }
  | { status: "error"; error: Error };
```

- **Inline** (`getChildren`) resolves synchronously into `success`. **Lazy**
  (`fetchChildren`) fetches on cache miss, aborts in flight on collapse, retries from
  error only.
- **Race safety:** a per-row nonce plus `AbortController` means rapid
  expand/collapse/expand cannot render a stale child list.
- **Cache:** the details map _is_ the cache, so re-expanding refetches nothing;
  `invalidateRowDetail(id)` is exported. An empty child list is a **success**, never an
  error.
- **Transition:** `grid-template-rows: 0fr → 1fr`, with the shell always mounted so the
  first expand animates without a double-`rAF` hack. Chosen over measured `max-height`
  because it self-heals when a skeleton becomes real content mid-transition.

## Sticky column

- Offsets are prefix sums of declared widths (suffix sums from the right), so they are
  correct during SSR with nothing measured.
- **`border-collapse: separate` is mandatory.** Under `collapse`, borders belong to the
  table, so a sticky cell loses its borders and content bleeds through the sticky edge.
  Every rule is an inset `box-shadow` instead, which travels with the cell.
- Sticky goes on `th`/`td`, never `tr`/`thead`, so hover and zebra must be re-applied to
  sticky cells. A right-sticky column must sit **last** in column order.
- The scroll cue is two 1px IntersectionObserver sentinels, not a scroll listener, so
  there is no per-frame work during horizontal scroll.
- Below `unstickBelow` (default 640) only the **first** sticky column stays sticky, since
  offset 0 is the only width that can safely be clamped. Page overflow is 0px at 390px.

## State management, and why no library

**Plain React:** `useReducer` for the expansion machine, `useState`/`useMemo` for the
rest, no context inside the table, no state management library.

**Exactly one piece of state in this app is global: the toast list**, and context already
serves it correctly. `sort`, `page`, `search`, `flags`, `expandedRowIds` and
`statusOverrides` each live in a single card and are deliberately unshared, since
`/members` sorting by name must not move `/payouts` to page 3. There is no prop-drilling
problem to solve.

**Jotai, Zustand, React Redux, etc. were rejected on the merits:**

- Table state is per-instance, and `/payouts` nests a table inside a table, so any store
  needs instance-keyed slices or a `Provider` per instance to reach what `useState` gives
  free.
- The real requirement is **liftability**, not centralisation: sort and pagination must be
  hoistable to the URL or server params. `useControlledState` does that with zero
  dependencies.
- In controlled mode a store creates two sources of truth with the URL, so you write a
  reconciling effect.
- `DataTable/` has no third-party runtime dependency, enforced by an ESLint rule that also
  bars `services/`, `pages/`, `server/` and `next/` imports.
- **Jotai** would fix context re-renders via atom subscriptions, but expanding a row is
  flat at 4x the rows (below), so it would optimise a bottleneck that is not there.

**React Query** would own the data layer in production; `useFetchQuery` is ~100 lines and
does not cover cross-component cache sharing, focus refetch or mutation invalidation.

## Loading, empty & error states

Skeleton rows render inside the same `<colgroup>`, so placeholders match real column
widths. Background refetches keep rows on screen with `aria-busy` instead of skeletons.
Empty is a real state (`pageCount` is at least 1, so it reads "Page 1 of 1"). Errors are a
`role="alert"` panel with Retry; a failed child fetch is scoped to its own row.

## Accessibility & performance

Real `<table>` semantics (no `role="grid"`, which is a contract that is worse
half-implemented), `aria-sort` including `"none"`, `aria-expanded`/`aria-controls` on
toggles, `inert` collapsed content, and a debounced `aria-live` region. Axe-audited with 0
violations and Lighthouse 100 across all categories.

Sort over 5,000 rows: 2.6 ms numeric, 12.2 ms collated string. Expanding one row costs 19
style recalcs at 25 rendered rows and 20 at 100, essentially flat. Pagination bounds
rendered rows regardless of dataset size, so no virtualization is needed, which also
avoids fighting expanded rows of unknown animating height.

## Note for reviewers: macOS "Reduce Motion"

If **System Settings → Accessibility → Display → Reduce Motion** is on, Safari and
Chrome on macOS can suppress some CSS transitions and throttle or skip scroll-linked
effects at the browser/OS level — separately from this site's own reduced-motion
handling, which is off by default (see Assumptions below). This can make the motion
look muted or missing even though nothing is broken.

To see the full experience, turn Reduce Motion off before reviewing, or visit with
`?motion=reduce` if you'd rather review the intentionally reduced path instead.

## Tradeoffs & assumptions

- **Fixed column widths**, required by the sticky implementation: the cost of removing DOM
  measurement is no user-resizable columns.
- **Single-column sort.** The comparator supports multi-sort; the header UI and URL
  contract would need to change.
- **The child cache is instance-scoped with no TTL.** Production would invalidate on
  mutation, which is why `invalidateRowDetail` is exported.
- **`/` is client-rendered on purpose** so its skeleton/empty/error states are visible in
  the deployed app; `/payouts` is server-rendered to prove server mode.
- **`/` is scoped to one studio day** (~179 classes) so client sort and pagination act on
  a complete working set. Fetching all 5,000 classes with inline attendees would be a
  large payload for no gain.
- **Times are a UTC instant plus the studio's IANA zone**, since a class at 10:00 in
  Singapore is 10:00 for a manager in London. Money is minor units.
- **Popovers use CSS anchoring**, not a floating-element library: everything anchors to a
  control with room below it.

## Known limitations

- Unit tests cover only the pure logic (comparators, page math); components and hooks are
  manually verified rather than covered by RTL.
- No visual-regression tests.
- No column resize/reorder/visibility UI, no row selection, single-column sort only.
- Table cells are not individual focus stops; the scroller is focusable and
  arrow-scrollable.
- Light theme only.