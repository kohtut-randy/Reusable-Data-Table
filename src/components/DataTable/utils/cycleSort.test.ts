import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { cycleSort } from './cycleSort.ts'

describe('cycleSort with none enabled', () => {
  it('walks none, asc, desc, none', () => {
    const first = cycleSort(null, 'name', true)
    assert.deepEqual(first, { columnId: 'name', direction: 'asc' })

    const second = cycleSort(first, 'name', true)
    assert.deepEqual(second, { columnId: 'name', direction: 'desc' })

    assert.equal(cycleSort(second, 'name', true), null)
  })
})

describe('cycleSort with none disabled', () => {
  it('toggles asc and desc forever', () => {
    const asc = cycleSort(null, 'name', false)
    assert.deepEqual(asc, { columnId: 'name', direction: 'asc' })

    const desc = cycleSort(asc, 'name', false)
    assert.deepEqual(desc, { columnId: 'name', direction: 'desc' })

    assert.deepEqual(cycleSort(desc, 'name', false), { columnId: 'name', direction: 'asc' })
  })
})

describe('cycleSort across columns', () => {
  it('restarts at ascending on a different column', () => {
    // Carrying the direction over would give newest-first when the user clicked Date
    // expecting oldest-first.
    const nameDesc = { columnId: 'name', direction: 'desc' } as const
    assert.deepEqual(cycleSort(nameDesc, 'startsAt', true), { columnId: 'startsAt', direction: 'asc' })
  })
})
