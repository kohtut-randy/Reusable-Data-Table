import type { GetServerSidePropsContext } from 'next'
import { MAX_API_PAGE_SIZE } from 'constants/api'
import { DEFAULT_PAGE_SIZE } from 'components/DataTable'
import type { PageState, SortState } from 'components/DataTable'
import { fetchPayouts } from 'services/api'
import type { PayoutsListResponse } from 'services/api'
import { PAYOUTS_QUERY_KEY } from '../constants'

export type PayoutsServerProps = {
  initialData: PayoutsListResponse
  initialSort: SortState
  initialPage: PageState
}

const readNumber = (value: string | string[] | undefined, fallback: number): number => {
  if (typeof value !== 'string') return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const readDirection = (value: string | string[] | undefined): 'asc' | 'desc' => (value === 'desc' ? 'desc' : 'asc')

/* Reads page and sort from the query string and fetches the first page on the server, so
   the server mode is genuinely server-side. Shared by the two routes that render the
   payouts card, because a second copy of this would be a second place for the clamping
   rules to drift.

   It goes through the service layer rather than the mock directly, so a server render
   takes the same validation and clamping path as a client fetch, and a bad deep link
   (`?page=999`, `?sortBy=bogus`) is clamped by the route handler and echoed back. */
export const readPayoutsServerProps = async (context: GetServerSidePropsContext): Promise<PayoutsServerProps> => {
  const requestedPage = Math.max(1, readNumber(context.query[PAYOUTS_QUERY_KEY.page], 1))
  const requestedSize = Math.min(readNumber(context.query[PAYOUTS_QUERY_KEY.pageSize], DEFAULT_PAGE_SIZE), MAX_API_PAGE_SIZE)
  const sortBy =
    typeof context.query[PAYOUTS_QUERY_KEY.sortBy] === 'string' ? (context.query[PAYOUTS_QUERY_KEY.sortBy] as string) : undefined
  const sortDir = readDirection(context.query[PAYOUTS_QUERY_KEY.sortDir])

  const protocol = context.req.headers['x-forwarded-proto'] ?? 'http'
  const host = context.req.headers.host ?? 'localhost:3100'
  const origin = `${protocol}://${host}`

  const initialData = await fetchPayouts({ page: requestedPage, pageSize: requestedSize, sortBy, sortDir }, undefined, origin)

  return {
    initialData,
    // Adopt the ECHOED sort and page, not what was asked for.
    initialSort: initialData.sort,
    initialPage: { pageIndex: initialData.page - 1, pageSize: initialData.pageSize },
  }
}
