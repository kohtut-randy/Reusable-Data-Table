import type { NextApiRequest, NextApiResponse } from 'next'
import { LATENCY_LIST_MS } from 'constants/api'
import type { PayoutDTO } from 'schemas/payouts.types'
import { getMockData } from 'server/mock/getMockData'
import { handleListRequest } from 'server/mock/listHandler'

/* GET /api/payouts
 *
 * The genuinely server-sorted and server-paged endpoint. The client table runs in
 * `sortMode: 'server'` + `pageMode: 'server'` against it, so the ordering visible in
 * the browser is the ordering this handler produced. */
const SORT_KEYS = {
  instructor: (row: PayoutDTO) => row.instructor.name,
  reference: (row: PayoutDTO) => row.reference,
  periodStart: (row: PayoutDTO) => Date.parse(row.periodStart),
  sessionCount: (row: PayoutDTO) => row.sessionCount,
  grossMinor: (row: PayoutDTO) => row.grossMinor,
  feesMinor: (row: PayoutDTO) => row.feesMinor,
  netMinor: (row: PayoutDTO) => row.netMinor,
  status: (row: PayoutDTO) => row.status,
  /* Returns null for an unpaid payout, and the shared comparator sorts nulls LAST in
     both directions. Sorting "Paid" descending therefore shows the most recent payment
     first, not forty pending rows. */
  paidAt: (row: PayoutDTO) => (row.paidAt === null ? null : Date.parse(row.paidAt)),
} as const

const matches = (row: PayoutDTO, query: string): boolean =>
  row.instructor.name.toLowerCase().includes(query) || row.reference.toLowerCase().includes(query)

export default async function handler(request: NextApiRequest, response: NextApiResponse): Promise<void> {
  await handleListRequest<PayoutDTO>(request, response, {
    rows: getMockData().payouts,
    sortKeys: SORT_KEYS,
    band: LATENCY_LIST_MS,
    errorMessage: 'The payouts service did not respond. This is the simulated error state.',
    matches,
  })
}
