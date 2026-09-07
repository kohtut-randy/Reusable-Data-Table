import type { Compare, SortDirection } from '../DataTable.types'

/* The comparator, imported by the client table and by the API route handlers, so server
   and client orderings cannot diverge at nulls, mixed types or numeric strings. Runs
   unchanged in Node and in the browser. */

/** `numeric: true` so 'Room 2' sorts before 'Room 10'. Created once, never per call. */
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

const TYPE_RANK = {
  number: 0,
  bigint: 0,
  string: 1,
  boolean: 2,
  object: 3,
  symbol: 4,
  undefined: 5,
  function: 6,
} as const

const isNil = (value: unknown): boolean => value === null || value === undefined

/** Nulls always sort last, in both directions: flipping "Paid at" to descending should
 *  give the most recent payment first, not forty unpaid rows. Mixed types fall back to a
 *  type rank rather than throwing mid-sort. */
export const compareValues = (a: unknown, b: unknown): number => {
  const aNil = isNil(a)
  const bNil = isNil(b)
  if (aNil || bNil) return aNil && bNil ? 0 : aNil ? 1 : -1

  if (typeof a === 'number' && typeof b === 'number') {
    if (Number.isNaN(a) || Number.isNaN(b)) {
      return Number.isNaN(a) && Number.isNaN(b) ? 0 : Number.isNaN(a) ? 1 : -1
    }
    return a - b
  }

  if (typeof a === 'string' && typeof b === 'string') return collator.compare(a, b)
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b)
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()

  const rankA = TYPE_RANK[typeof a]
  const rankB = TYPE_RANK[typeof b]
  if (rankA !== rankB) return rankA - rankB

  return collator.compare(String(a), String(b))
}

/** Sorts by a precomputed key: O(n) key extractions instead of the ~120,000 a naive
 *  comparator would run over 5,000 rows. `rows` is never mutated, and the explicit index
 *  tiebreak keeps stability across the direction negation. */
export const sortRowsBy = <T>(
  rows: readonly T[],
  keyOf: (row: T) => unknown,
  comparator: Compare<unknown>,
  direction: SortDirection,
): readonly T[] => {
  const count = rows.length
  const keyed: { key: unknown; index: number }[] = new Array(count)
  for (let index = 0; index < count; index += 1) keyed[index] = { key: keyOf(rows[index]!), index }

  const sign = direction === 'asc' ? 1 : -1

  keyed.sort((a, b) => {
    const aNil = isNil(a.key)
    const bNil = isNil(b.key)
    // Outside the sign, so nulls stay last when the direction flips.
    if (aNil || bNil) return aNil && bNil ? a.index - b.index : aNil ? 1 : -1

    const result = comparator(a.key, b.key)
    return result !== 0 ? result * sign : a.index - b.index
  })

  const out: T[] = new Array(count)
  for (let index = 0; index < count; index += 1) out[index] = rows[keyed[index]!.index]!
  return out
}
