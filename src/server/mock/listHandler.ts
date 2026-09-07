import type { NextApiRequest, NextApiResponse } from 'next'
import { API_CODE_OK } from 'constants/api'
import { compareValues, sortRowsBy } from 'components/DataTable/utils/compare'
import type { SortDirection } from 'components/DataTable'
import { listQuerySchema } from 'schemas/apiValidation'
import { delayResponse } from './latency'
import type { LatencyBand } from './latency'
import { readTestFlags } from './testFlags'

/* The shared list-endpoint implementation, used by every list route. It imports the same
   `compare.ts` the client table uses, so server-mode and client-mode sorting cannot
   disagree at nulls or mixed types. */

export type SortKeyMap<T> = Readonly<Record<string, (row: T) => unknown>>

export type ListHandlerOptions<T> = {
  readonly rows: readonly T[]
  /** Which `sortBy` values are valid, and how to read each one. */
  readonly sortKeys: SortKeyMap<T>
  readonly band: LatencyBand
  /** Copy for the forced-error state, per endpoint, so the message names the right
   *  service rather than whichever domain the shared handler was written for. */
  readonly errorMessage: string
  /** Free-text filter, applied before sorting and paging. */
  readonly matches?: ((row: T, query: string) => boolean) | undefined
  /** Applied after filtering, for `include=` style payload shaping. */
  readonly decorate?: ((row: T) => T) | undefined
}

const requestId = (): string => `req_${Math.random().toString(36).slice(2, 10)}`

export const handleListRequest = async <T>(
  request: NextApiRequest,
  response: NextApiResponse,
  { rows, sortKeys, band, errorMessage, matches, decorate }: ListHandlerOptions<T>,
): Promise<void> => {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    response.status(405).json({ code: 405, message: 'Method not allowed.', error: { kind: 'method', requestId: requestId() } })
    return
  }

  const flags = readTestFlags(request)
  const latencyMs = await delayResponse(band, flags.delayMs)

  if (flags.fail) {
    response.status(500).json({
      code: 500,
      message: errorMessage,
      error: { kind: 'forced', requestId: requestId() },
    })
    return
  }

  /* An invalid `sortBy` drops the sort and echoes `sort: null` rather than returning
     400: a bad deep link should render data, not an error page. */
  const query = await listQuerySchema.validate(request.query, { stripUnknown: true })

  const sortKey = query.sortBy && sortKeys[query.sortBy] ? query.sortBy : null
  const direction = query.sortDir as SortDirection

  const filtered = flags.empty ? [] : matches && query.q ? rows.filter(row => matches(row, query.q!.toLowerCase())) : rows

  const sorted = sortKey ? sortRowsBy(filtered, sortKeys[sortKey]!, compareValues, direction) : filtered

  const total = sorted.length
  /* The page is clamped and echoed: page 999 of 3 returns page 3 with page 3's data. */
  const pageCount = Math.max(1, Math.ceil(total / query.pageSize))
  const page = Math.min(Math.max(query.page, 1), pageCount)
  const start = (page - 1) * query.pageSize

  const pageRows = sorted.slice(start, start + query.pageSize)

  response.status(200).json({
    code: API_CODE_OK,
    message: 'OK',
    data: decorate ? pageRows.map(decorate) : pageRows,
    page,
    pageSize: query.pageSize,
    total,
    sort: sortKey ? { columnId: sortKey, direction } : null,
    meta: { latencyMs, sortedOnServer: sortKey !== null },
  })
}
