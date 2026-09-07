import { useMemo, useRef } from 'react'
import { useDebouncedValue, useFetchQuery } from 'hooks'
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
  /* Only the flags this request actually uses. `failChildren`/`emptyChildren` govern
     the per-row session fetch and must not appear here, or toggling them busts this
     key and needlessly refetches the whole list. */
  const listFlags = useMemo(
    () => ({ slow: flags.slow, delayMs: flags.delayMs, failList: flags.failList, emptyList: flags.emptyList }),
    [flags.slow, flags.delayMs, flags.failList, flags.emptyList],
  )

  // Debounced so a request fires once typing pauses, not once per keystroke.
  const debouncedSearch = useDebouncedValue(search, 300)

  const key = useMemo(
    () => JSON.stringify({ page: page.pageIndex, size: page.pageSize, sort, search: debouncedSearch, flags: listFlags }),
    [page.pageIndex, page.pageSize, sort, debouncedSearch, listFlags],
  )

  /* The flags active when the SSR request was made, frozen at mount: the server render
     never applied any test flag, so this must not track the live `flags` state, or
     toggling a switch while still on page 1 with no sort/search matches `initialKey`
     on the flags field too and the fetch it should trigger never fires. */
  const initialFlags = useRef(listFlags).current

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
            flags: initialFlags,
          }),
    [initialData, initialFlags],
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
          q: debouncedSearch,
          delay: listFlags.slow ? listFlags.delayMs : undefined,
          fail: listFlags.failList,
          empty: listFlags.emptyList,
        },
        signal,
      ),
  })

  /* Falls back to `initialData` while the first post-SSR request is in flight, since
     `query.data` is still undefined at that point (the initial key's request was
     skipped). Without this, `rowCount` drops to 0 for a render, `usePagination` clamps
     the just-requested page back to 0, and the in-flight request is aborted with
     nothing to replace it. */
  const response = isInitialKey ? initialData : (query.data ?? initialData)

  return {
    response,
    isLoading: !isInitialKey && query.status === 'loading' && query.data === undefined,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  }
}
