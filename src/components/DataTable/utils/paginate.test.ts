import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { clampPageIndex, getPageCount, getVisibleRange, pageIndexForNewSize, sliceRows } from './paginate.ts'

describe('getPageCount', () => {
  it('is at least 1 for an empty dataset', () => {
    // So the footer reads "Page 1 of 1" with an empty state, never "Page 1 of 0".
    assert.equal(getPageCount(0, 25), 1)
  })

  it('rounds up a partial final page', () => {
    assert.equal(getPageCount(120, 25), 5)
    assert.equal(getPageCount(100, 25), 4)
  })

  it('survives a zero page size', () => {
    assert.equal(getPageCount(120, 0), 1)
  })
})

describe('clampPageIndex', () => {
  it('clamps an out-of-range page down to the last one', () => {
    // The `?page=999` deep-link case.
    assert.equal(clampPageIndex(998, 5), 4)
  })

  it('clamps a negative page up to the first', () => {
    assert.equal(clampPageIndex(-3, 5), 0)
  })

  it('truncates a fractional index', () => {
    assert.equal(clampPageIndex(2.7, 5), 2)
  })

  it('falls back to the first page for a non-finite index', () => {
    // `Number('abc')` from a query string.
    assert.equal(clampPageIndex(Number.NaN, 5), 0)
    assert.equal(clampPageIndex(Number.POSITIVE_INFINITY, 5), 0)
  })

  it('stays at 0 when there are no pages', () => {
    assert.equal(clampPageIndex(3, 0), 0)
  })
})

describe('pageIndexForNewSize', () => {
  it('keeps the first visible row on screen', () => {
    // Page 3 at size 25 shows rows 51 to 75. At size 50 those rows live on page 2.
    assert.equal(pageIndexForNewSize(2, 25, 50), 1)
  })

  it('works when shrinking the page size', () => {
    // Page 1 at size 50 shows rows 51 to 100, which is page 3 at size 25.
    assert.equal(pageIndexForNewSize(1, 50, 25), 2)
  })

  it('stays on the first page from the first page', () => {
    assert.equal(pageIndexForNewSize(0, 25, 100), 0)
  })
})

describe('sliceRows', () => {
  const rows = Array.from({ length: 7 }, (_, index) => index)

  it('returns the requested window', () => {
    assert.deepEqual(sliceRows(rows, 1, 3), [3, 4, 5])
  })

  it('returns a short final page', () => {
    assert.deepEqual(sliceRows(rows, 2, 3), [6])
  })

  it('returns empty past the end rather than throwing', () => {
    assert.deepEqual(sliceRows(rows, 9, 3), [])
  })
})

describe('getVisibleRange', () => {
  it('is 1-based for the UI', () => {
    assert.deepEqual(getVisibleRange(0, 25, 120), { from: 1, to: 25 })
    assert.deepEqual(getVisibleRange(4, 25, 120), { from: 101, to: 120 })
  })

  it('collapses to zero for an empty dataset', () => {
    assert.deepEqual(getVisibleRange(0, 25, 0), { from: 0, to: 0 })
  })
})
