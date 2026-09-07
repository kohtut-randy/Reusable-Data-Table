import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { compareValues, sortRowsBy } from './compare.ts'

/* Tests over the PURE core. These need no DOM, no renderer and no test framework
   beyond `node:test`, which is the point: the sorting engine is plain functions, so it
   is testable without dragging in a browser environment.
 *
 * Run with `npm test`. */

describe('compareValues', () => {
  it('orders numbers numerically, not lexically', () => {
    assert.equal(compareValues(9, 10) < 0, true)
    assert.equal(compareValues(100, 20) > 0, true)
  })

  it('orders strings with a numeric-aware collator', () => {
    // The reason `numeric: true` is set: 'Room 2' must precede 'Room 10'.
    assert.equal(compareValues('Room 2', 'Room 10') < 0, true)
    assert.equal(compareValues('a', 'B') < 0, true) // sensitivity: 'base'
  })

  it('puts nil last regardless of the other operand', () => {
    assert.equal(compareValues(null, 5) > 0, true)
    assert.equal(compareValues(5, null) < 0, true)
    assert.equal(compareValues(undefined, 'a') > 0, true)
    assert.equal(compareValues(null, undefined), 0)
  })

  it('puts NaN last among numbers', () => {
    assert.equal(compareValues(Number.NaN, 1) > 0, true)
    assert.equal(compareValues(1, Number.NaN) < 0, true)
    assert.equal(compareValues(Number.NaN, Number.NaN), 0)
  })

  it('compares dates by instant', () => {
    assert.equal(compareValues(new Date('2026-01-01'), new Date('2026-06-01')) < 0, true)
  })

  it('is deterministic for mixed types and never throws', () => {
    // Numbers rank before strings, so the order is stable rather than arbitrary.
    assert.equal(compareValues(1, 'a') < 0, true)
    assert.equal(compareValues('a', true) < 0, true)
    assert.doesNotThrow(() => compareValues({ a: 1 }, 'x'))
  })

  it('orders booleans false before true', () => {
    assert.equal(compareValues(false, true) < 0, true)
  })
})

describe('sortRowsBy', () => {
  type Row = { id: string; value: number | null }

  const rows: readonly Row[] = [
    { id: 'a', value: 3 },
    { id: 'b', value: null },
    { id: 'c', value: 1 },
    { id: 'd', value: 3 },
    { id: 'e', value: null },
  ]

  const keyOf = (row: Row) => row.value
  const ids = (list: readonly Row[]) => list.map(row => row.id).join('')

  it('does not mutate the input', () => {
    const before = ids(rows)
    sortRowsBy(rows, keyOf, compareValues, 'asc')
    assert.equal(ids(rows), before)
  })

  it('sorts ascending with nils last', () => {
    assert.equal(ids(sortRowsBy(rows, keyOf, compareValues, 'asc')), 'cadbe')
  })

  it('keeps nils last when the direction flips', () => {
    // The whole reason nil handling sits outside the direction sign.
    assert.equal(ids(sortRowsBy(rows, keyOf, compareValues, 'desc')), 'adcbe')
  })

  it('is stable for equal keys in both directions', () => {
    // 'a' and 'd' both have value 3 and must keep their original relative order.
    assert.equal(
      ids(sortRowsBy(rows, keyOf, compareValues, 'asc')).indexOf('a') < ids(sortRowsBy(rows, keyOf, compareValues, 'asc')).indexOf('d'),
      true,
    )
    assert.equal(
      ids(sortRowsBy(rows, keyOf, compareValues, 'desc')).indexOf('a') < ids(sortRowsBy(rows, keyOf, compareValues, 'desc')).indexOf('d'),
      true,
    )
  })

  it('calls the key accessor once per row, not once per comparison', () => {
    let calls = 0
    const counted = (row: Row) => {
      calls += 1
      return row.value
    }
    sortRowsBy(rows, counted, compareValues, 'asc')
    assert.equal(calls, rows.length)
  })

  it('handles an empty list', () => {
    assert.deepEqual(sortRowsBy([], keyOf, compareValues, 'asc'), [])
  })
})
