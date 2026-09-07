export const PAYOUTS_CAPTION = 'Instructor payouts by pay period'
export const PAYOUTS_SESSIONS_CAPTION = 'Sessions in this payout'

export const PAYOUTS_COLUMN_ID = {
  instructor: 'instructor',
  reference: 'reference',
  period: 'periodStart',
  sessions: 'sessionCount',
  gross: 'grossMinor',
  fees: 'feesMinor',
  net: 'netMinor',
  status: 'status',
  paid: 'paidAt',
} as const

/* Sticky columns must declare px widths, because sticky offsets are prefix sums.
   Total is roughly 1360px, so both the left-sticky identity column and the
   right-sticky Net column are exercised on a normal laptop. */
export const PAYOUTS_COLUMN_WIDTH = {
  instructor: '240px',
  net: '150px',
} as const

/** Measured height of one real row (avatar plus a two-line identity cell). */
export const PAYOUTS_ROW_HEIGHT_PX = 57

/** Query keys used in the URL, so sort and page are shareable state. */
export const PAYOUTS_QUERY_KEY = {
  page: 'page',
  pageSize: 'pageSize',
  sortBy: 'sortBy',
  sortDir: 'sortDir',
} as const
