import { useMemo } from 'react'
import { useDebouncedValue, useFetchQuery } from 'hooks'
import type { PageState, SortState } from 'components/DataTable'
import { fetchMembers } from 'services/api'
import type { MembersListResponse } from 'services/api'
import type { MembersTestFlags } from '../members.types'

/* Server sort and server pagination, like the payouts page: the roster is 2,400 rows,
   so fetching it whole to sort in the browser would be a large payload for no gain.
   Sort and page are therefore in the query key, because the server owns both. */

export type UseMembersQueryOptions = {
  readonly page: PageState
  readonly sort: SortState
  readonly search: string
  readonly flags: MembersTestFlags
}

export type UseMembersQueryResult = {
  readonly response: MembersListResponse | undefined
  readonly isLoading: boolean
  readonly isFetching: boolean
  readonly error: Error | null
  readonly refetch: () => void
}

export const useMembersQuery = ({ page, sort, search, flags }: UseMembersQueryOptions): UseMembersQueryResult => {
  // Debounced so a request fires once typing pauses, not once per keystroke.
  const debouncedSearch = useDebouncedValue(search, 300)

  const key = useMemo(
    () => JSON.stringify({ page: page.pageIndex, size: page.pageSize, sort, search: debouncedSearch, flags }),
    [page.pageIndex, page.pageSize, sort, debouncedSearch, flags],
  )

  const query = useFetchQuery<MembersListResponse>({
    key,
    fetcher: signal =>
      fetchMembers(
        {
          // 0-based internally, 1-BASED on the wire.
          page: page.pageIndex + 1,
          pageSize: page.pageSize,
          q: debouncedSearch,
          delay: flags.slow ? flags.delayMs : undefined,
          fail: flags.failList,
          empty: flags.emptyList,
        },
        signal,
      ),
  })

  return {
    response: query.data,
    /* 'idle' counts as loading so the SERVER renders the loading state, matching what
       the client starts with. Treating it as "not loading" made the server render the
       empty state and hydration replace it with skeleton rows, which measured as a
       large layout shift. See the timetable hook for the numbers. */
    isLoading: (query.status === 'loading' || query.status === 'idle') && query.data === undefined,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  }
}
