import type { NextApiRequest, NextApiResponse } from 'next'
import { LATENCY_LIST_MS } from 'constants/api'
import type { MemberDTO } from 'schemas/members.types'
import { getMockData } from 'server/mock/getMockData'
import { handleListRequest } from 'server/mock/listHandler'

/* GET /api/members
 *
 * Server-sorted and server-paged, like /api/payouts: the roster is 2,400 rows, so the
 * page asks for one page at a time. The difference from /api/classes, which returns a
 * whole studio day for the browser to sort, lives entirely in the caller. */
const SORT_KEYS = {
  name: (row: MemberDTO) => row.name,
  reference: (row: MemberDTO) => row.reference,
  tier: (row: MemberDTO) => row.tier,
  status: (row: MemberDTO) => row.status,
  joinedAt: (row: MemberDTO) => Date.parse(row.joinedAt),
  visits: (row: MemberDTO) => row.visits,
  // Null for a member who has never checked in, so nulls-last applies.
  lastVisitAt: (row: MemberDTO) => (row.lastVisitAt === null ? null : Date.parse(row.lastVisitAt)),
  homeZone: (row: MemberDTO) => row.homeZone,
} as const

const matches = (row: MemberDTO, query: string): boolean =>
  row.name.toLowerCase().includes(query) || row.reference.toLowerCase().includes(query) || row.homeZone.toLowerCase().includes(query)

export default async function handler(request: NextApiRequest, response: NextApiResponse): Promise<void> {
  await handleListRequest<MemberDTO>(request, response, {
    rows: getMockData().members,
    sortKeys: SORT_KEYS,
    band: LATENCY_LIST_MS,
    errorMessage: 'The membership service did not respond. This is the simulated error state.',
    matches,
  })
}
