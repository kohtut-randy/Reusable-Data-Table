import { useMemo } from 'react'
import { useFetchQuery } from 'hooks'
import type { PageState, SortState } from 'components/DataTable'
import { fetchPayouts } from 'services/api'
import type { PayoutsListResponse } from 'services/api'
import type { PayoutsTestFlags } from '../payouts.types'

/* The SERVER-MODE counterpart to useTimetableClassesQuery.
 *
 * The contrast is the whole point of having two pages. Here the sort and the page ARE
 * in the query key, because the server owns both: changing either is a request. On the
 * timetable neither is, because one day is fetched whole and everything else is local.
 * Same table component, opposite data strategy. */

export type UsePayoutsQueryOptions = {
  readonly page: PageState
  readonly sort: SortState
  readonly search: string
  readonly flags: PayoutsTestFlags
  /** Server-rendered first page, so the table has rows before any client fetch runs. */
  readonly initialData?: PayoutsListResponse | undefined
}

export type UsePayoutsQueryResult = {
  readonly response: PayoutsListResponse | undefined
  readonly isLoading: boolean
  readonly isFetching: boolean
  readonly error: Error | null
  readonly refetch: () => void
}

export const usePayoutsQuery = ({ page, sort, search, flags, initialData }: UsePayoutsQueryOptions): UsePayoutsQueryResult => {
  const key = useMemo(
    () => JSON.stringify({ page: page.pageIndex, size: page.pageSize, sort, search, flags }),
    [page.pageIndex, page.pageSize, sort, search, flags],
  )

  /* The first page came from getServerSideProps, so skip the client request for exactly
     that key. Anything else is a real fetch. Without this the page would render
     server-side and then immediately refetch the same rows on mount. */
  const initialKey = useMemo(
    () =>
      initialData === undefined
        ? null
        : JSON.stringify({
            page: initialData.page - 1,
            size: initialData.pageSize,
            sort: initialData.sort,
            search: '',
            flags,
          }),
    [initialData, flags],
  )

  const isInitialKey = initialKey !== null && key === initialKey

  const query = useFetchQuery<PayoutsListResponse>({
    key,
    enabled: !isInitialKey,
    fetcher: signal =>
      fetchPayouts(
        {
          // 0-based internally, 1-BASED on the wire.
          page: page.pageIndex + 1,
          pageSize: page.pageSize,
          sortBy: sort?.columnId,
          sortDir: sort?.direction,
          q: search,
          delay: flags.slow ? flags.delayMs : undefined,
          fail: flags.failList,
          empty: flags.emptyList,
        },
        signal,
      ),
  })

  const response = isInitialKey ? initialData : query.data

  return {
    response,
    isLoading: !isInitialKey && query.status === 'loading' && query.data === undefined,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  }
}
