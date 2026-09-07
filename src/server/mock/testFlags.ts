import type { NextApiRequest } from 'next'

/* The edge-case triggers, parsed from the query string.
 *
 * Every one of them is reachable from a control in the deployed UI, not just from a
 * hand-typed URL. The brief's edge cases (slow fetch, failed initial fetch, failed
 * child fetch, empty dataset, empty child lists) are all demonstrable on the live site,
 * which is a large part of what makes them verifiable rather than claimed. */

export type TestFlags = {
  readonly fail: boolean
  readonly failChildren: boolean
  readonly empty: boolean
  readonly emptyChildren: boolean
  readonly delayMs: number | undefined
}

const readFlag = (value: string | string[] | undefined): boolean => value === '1' || value === 'true'

const readNumber = (value: string | string[] | undefined): number | undefined => {
  if (typeof value !== 'string') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export const readTestFlags = (request: NextApiRequest): TestFlags => ({
  fail: readFlag(request.query.fail),
  failChildren: readFlag(request.query.failChildren),
  empty: readFlag(request.query.empty),
  emptyChildren: readFlag(request.query.emptyChildren),
  delayMs: readNumber(request.query.delay),
})
