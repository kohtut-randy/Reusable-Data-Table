import type { NextApiRequest, NextApiResponse } from 'next'
import { API_CODE_OK, LATENCY_CHILD_MS } from 'constants/api'
import { getMockData } from 'server/mock/getMockData'
import { delayResponse } from 'server/mock/latency'
import { readTestFlags } from 'server/mock/testFlags'

/* GET /api/payouts/:payoutId/sessions
 *
 * The session line items behind a payout. Naturally tabular, which is why the expanded
 * region renders a NESTED <DataTable> with its own columns and its own client-side
 * sort: nesting the component inside itself is the strongest available proof that
 * nothing in it is hard-coded to one dataset. */
export default async function handler(request: NextApiRequest, response: NextApiResponse): Promise<void> {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    response.status(405).json({ code: 405, message: 'Method not allowed.', error: { kind: 'method', requestId: 'req_method' } })
    return
  }

  const flags = readTestFlags(request)
  const latencyMs = await delayResponse(LATENCY_CHILD_MS, flags.delayMs)

  if (flags.fail || flags.failChildren) {
    response.status(500).json({
      code: 500,
      message: 'Could not load sessions for this payout.',
      error: { kind: 'forced', requestId: 'req_forced_child' },
    })
    return
  }

  const payoutId = String(request.query.payoutId)
  const sessions = getMockData().sessionsByPayout.get(payoutId)

  if (!sessions) {
    response.status(404).json({ code: 404, message: 'Payout not found.', error: { kind: 'not_found', requestId: 'req_404' } })
    return
  }

  response.status(200).json({
    code: API_CODE_OK,
    message: 'OK',
    data: flags.emptyChildren ? [] : sessions,
    meta: { latencyMs },
  })
}
