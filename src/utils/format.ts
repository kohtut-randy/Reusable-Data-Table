import { STUDIO_LOCALE } from 'constants/datetime'

/* Money travels in minor units (integer cents) and is only divided at the formatting
   boundary: a float dollar amount accumulates error as soon as it is summed. */

const numberFormatters = new Map<string, Intl.NumberFormat>()

const numberFormatterFor = (options: Intl.NumberFormatOptions): Intl.NumberFormat => {
  const key = JSON.stringify(options)
  const existing = numberFormatters.get(key)
  if (existing) return existing

  const created = new Intl.NumberFormat(STUDIO_LOCALE, options)
  numberFormatters.set(key, created)
  return created
}

const MINOR_UNITS_PER_MAJOR = 100

export const formatCurrency = (minor: number, currency: string): string =>
  numberFormatterFor({ style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    minor / MINOR_UNITS_PER_MAJOR,
  )

export const formatNumber = (value: number): string => numberFormatterFor({ maximumFractionDigits: 0 }).format(value)

export const formatPercent = (ratio: number): string => numberFormatterFor({ style: 'percent', maximumFractionDigits: 0 }).format(ratio)

/** Initials for the avatar fallback. Two letters, upper case. */
export const initialsOf = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('')
