/* Every literal the table uses, in one place. No magic values in any component. */

export const DEFAULT_PAGE_SIZE = 25
export const PAGE_SIZE_OPTIONS: readonly number[] = [10, 25, 50, 100]

/* Skeleton rows default to the page size, so the card does not resize on load. Capped
   here so a 200-row page does not render 200 shimmering rows. */
export const MAX_SKELETON_ROWS = 25

/** Viewport width below which only the first sticky column stays sticky. */
export const DEFAULT_UNSTICK_BELOW_PX = 640

/** Fallback when a non-sticky column declares no `flex`. */
export const DEFAULT_COLUMN_FLEX = 1

/** The expand-toggle column. Sticky at left 0, and the origin of every left prefix sum. */
export const EXPAND_COLUMN_WIDTH_PX = 44

/** Fallback px width for a sticky column that (incorrectly) declares no `minWidth`. */
export const FALLBACK_STICKY_WIDTH_PX = 160

/* The stacking order itself lives in dataTable.css. These are only the var() names the
   inline styles reference, so there is one source of truth for the z-layers. */
export const Z_VAR_STICKY_CELL = 'var(--dt-z-sticky-cell)'
export const Z_VAR_STICKY_CORNER = 'var(--dt-z-sticky-corner)'

/** Tailwind's own breakpoint values, so `hideBelow` matches the utility classes. */
export const BREAKPOINT_PX = { sm: 640, md: 768, lg: 1024, xl: 1280 } as const

/** Debounce for the live region, so a fast sort-then-page does not announce twice. */
export const LIVE_REGION_DEBOUNCE_MS = 200

/** Max page-size value accepted from a URL, to stop `?pageSize=100000` rendering forever. */
export const MAX_PAGE_SIZE = 200
