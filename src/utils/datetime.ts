import {
  DATE_FORMAT_OPTIONS,
  DATE_SHORT_FORMAT_OPTIONS,
  STUDIO_LOCALE,
  TIME_FORMAT_OPTIONS,
  WEEKDAY_FORMAT_OPTIONS,
} from 'constants/datetime'

/* The only place dates become text. Two rules follow from the booking domain:

   1. Every formatter carries an explicit `timeZone`. A bare `new Date()` would render the
      viewer's local time and be silently wrong outside the studio's zone.
   2. Sorting never touches these strings: a column showing a formatted time sorts on the
      underlying instant, since "10:00 AM" as a string sorts before "9:00 AM".

   Formatters are memoised in a module Map. Constructing an `Intl.DateTimeFormat` is about
   two orders of magnitude more expensive than using one, and a table has many cells. */

const formatters = new Map<string, Intl.DateTimeFormat>()

const formatterFor = (options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat => {
  const key = JSON.stringify(options)
  const existing = formatters.get(key)
  if (existing) return existing

  const created = new Intl.DateTimeFormat(STUDIO_LOCALE, options)
  formatters.set(key, created)
  return created
}

/** Epoch ms for sorting. Returns null for a missing or unparseable instant. */
export const toInstant = (iso: string | null | undefined): number | null => {
  if (!iso) return null
  const ms = Date.parse(iso)
  return Number.isNaN(ms) ? null : ms
}

export const formatTime = (iso: string): string => formatterFor(TIME_FORMAT_OPTIONS).format(new Date(iso))

/** "10:00 AM to 11:00 AM", in the studio's zone. */
export const formatTimeRange = (startIso: string, endIso: string): string => `${formatTime(startIso)} to ${formatTime(endIso)}`

export const formatDate = (iso: string): string => formatterFor(DATE_FORMAT_OPTIONS).format(new Date(iso))

export const formatDateShort = (iso: string): string => formatterFor(DATE_SHORT_FORMAT_OPTIONS).format(new Date(iso))

export const formatWeekday = (iso: string): string => formatterFor(WEEKDAY_FORMAT_OPTIONS).format(new Date(iso))

/** "1 Sep to 14 Sep 2026" for a payout period. */
export const formatDateRange = (startIso: string, endIso: string): string => `${formatDateShort(startIso)} to ${formatDate(endIso)}`
