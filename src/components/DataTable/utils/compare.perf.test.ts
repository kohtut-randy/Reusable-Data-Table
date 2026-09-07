import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { compareValues, sortRowsBy } from './compare.ts'

/* Makes the README's sort-time claim reproducible: it isolates the sort from React's
   commit and runs anywhere with `npm test`. The 100ms budget is deliberately loose, so
   this is a regression guard rather than a benchmark. The observed figure is printed. */

const ROW_COUNT = 5000
const BUDGET_MS = 100

type Row = { id: number; attempts: number; sends: number; label: string; retiredAt: string | null }

const buildRows = (): readonly Row[] => {
  // Deterministic, so successive runs are comparable.
  let seed = 97
  const random = (): number => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 0x7fffffff
  }

  return Array.from({ length: ROW_COUNT }, (_, id) => {
    const attempts = Math.floor(random() * 400) + 20
    return {
      id,
      attempts,
      sends: Math.floor(attempts * random() * 0.6),
      label: `Problem ${Math.floor(random() * 9000)}`,
      // A third are null, so nulls-last is exercised at scale too.
      retiredAt: random() < 0.33 ? null : new Date(1_780_000_000_000 + Math.floor(random() * 1e9)).toISOString(),
    }
  })
}

const timed = (label: string, run: () => void): number => {
  const startedAt = performance.now()
  run()
  const elapsed = performance.now() - startedAt
  console.log(`    ${label}: ${elapsed.toFixed(1)} ms for ${ROW_COUNT} rows`)
  return elapsed
}

describe(`sortRowsBy over ${ROW_COUNT} rows`, () => {
  const rows = buildRows()

  it('sorts a plain numeric key inside budget', () => {
    const elapsed = timed('numeric key', () => sortRowsBy(rows, row => row.attempts, compareValues, 'asc'))
    assert.ok(elapsed < BUDGET_MS, `expected under ${BUDGET_MS}ms, got ${elapsed.toFixed(1)}ms`)
  })

  it('sorts a COMPUTED key inside budget', () => {
    // The interesting case: the accessor divides two fields per row, which is what the
    // precomputed-sort-key path exists to make cheap.
    const elapsed = timed('computed ratio', () =>
      sortRowsBy(rows, row => (row.attempts > 0 ? row.sends / row.attempts : 0), compareValues, 'desc'),
    )
    assert.ok(elapsed < BUDGET_MS, `expected under ${BUDGET_MS}ms, got ${elapsed.toFixed(1)}ms`)
  })

  it('sorts a collated string key inside budget', () => {
    const elapsed = timed('collated string', () => sortRowsBy(rows, row => row.label, compareValues, 'asc'))
    assert.ok(elapsed < BUDGET_MS, `expected under ${BUDGET_MS}ms, got ${elapsed.toFixed(1)}ms`)
  })

  it('sorts a nullable date key inside budget, with nulls last', () => {
    const keyOf = (row: Row): number | null => (row.retiredAt === null ? null : Date.parse(row.retiredAt))
    let sorted: readonly Row[] = []
    const elapsed = timed('nullable date', () => {
      sorted = sortRowsBy(rows, keyOf, compareValues, 'desc')
    })

    assert.ok(elapsed < BUDGET_MS, `expected under ${BUDGET_MS}ms, got ${elapsed.toFixed(1)}ms`)
    // Nulls last even descending, at scale.
    assert.equal(keyOf(sorted[sorted.length - 1]!), null)
    assert.notEqual(keyOf(sorted[0]!), null)
  })

  it('calls the accessor once per row, not once per comparison', () => {
    let calls = 0
    sortRowsBy(
      rows,
      row => {
        calls += 1
        return row.attempts
      },
      compareValues,
      'asc',
    )
    // O(n), not O(n log n): ~5,000 rather than ~120,000.
    assert.equal(calls, ROW_COUNT)
  })
})
