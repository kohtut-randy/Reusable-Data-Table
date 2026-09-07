import type { NextApiRequest, NextApiResponse } from 'next'
import { API_CODE_OK, LATENCY_CHILD_MS } from 'constants/api'
import { getMockData } from 'server/mock/getMockData'
import { delayResponse } from 'server/mock/latency'
import { readTestFlags } from 'server/mock/testFlags'

/* GET /api/classes/:classId/attendees
 *
 * The on-demand children endpoint. Deliberately slower than the list (see
 * LATENCY_CHILD_MS): child fetches are a second round trip in real products, and the
 * extra time is what makes the child skeleton genuinely visible rather than a flicker
 * nobody can evaluate. */
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
      message: 'Could not load attendees for this class.',
      error: { kind: 'forced', requestId: 'req_forced_child' },
    })
    return
  }

  const classId = String(request.query.classId)
  const attendees = getMockData().attendeesByClass.get(classId)

  if (!attendees) {
    response.status(404).json({ code: 404, message: 'Class not found.', error: { kind: 'not_found', requestId: 'req_404' } })
    return
  }

  /* An empty list is a SUCCESS with `data: []`, never a 404 and never an error. About
     8% of the seeded classes have zero attendees, so this path is exercised without
     needing the chaos flag. */
  response.status(200).json({
    code: API_CODE_OK,
    message: 'OK',
    data: flags.emptyChildren ? [] : attendees,
    meta: { latencyMs },
  })
}
