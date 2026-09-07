import { useMemo } from 'react'
import { MAX_API_PAGE_SIZE } from 'constants/api'
import { useFetchQuery } from 'hooks'
import { fetchClasses } from 'services/api'
import type { ClassesListResponse } from 'services/api'
import type { TimetableTestFlags } from '../timetable.types'

/* Composes the data layer (`useFetchQuery`) with the API layer (`fetchClasses`). The
   component below it sees neither. */

export type UseTimetableClassesQueryOptions = {
  /** Studio-local calendar date. One day is the page's complete working set. */
  readonly date: string
  readonly flags: TimetableTestFlags
}

export type UseTimetableClassesQueryResult = {
  readonly response: ClassesListResponse | undefined
  readonly isLoading: boolean
  readonly isFetching: boolean
  readonly error: Error | null
  readonly refetch: () => void
}

export const useTimetableClassesQuery = ({ date, flags }: UseTimetableClassesQueryOptions): UseTimetableClassesQueryResult => {
  /* The key is the only refetch trigger, and what is absent from it is the point: no
     sort, no page, no search term, because all three are applied in the browser. One
     request per day, everything else local. */
  const key = useMemo(() => JSON.stringify({ date, flags }), [date, flags])

  const query = useFetchQuery<ClassesListResponse>({
    key,
    fetcher: signal =>
      fetchClasses(
        {
          date,
          /* One studio day is comfortably under the API's page cap, so a single request
             returns the COMPLETE working set for the day. */
          page: 1,
          pageSize: MAX_API_PAGE_SIZE,
          // Inline children: one request carries the attendees with their parents.
          includeAttendees: true,
          delay: flags.slow ? flags.delayMs : undefined,
          fail: flags.failList,
          empty: flags.emptyList,
          emptyChildren: flags.emptyChildren,
        },
        signal,
      ),
  })

  return {
    response: query.data,
    /* 'idle' counts as loading, which matters for the server render: this page fetches
       on the client, so during SSR the query has never run. Treating idle as "not
       loading" rendered the empty state on the server and 25 skeleton rows after
       hydration, measured as CLS 0.6. Skeletons still appear only on a first load. */
    isLoading: (query.status === 'loading' || query.status === 'idle') && query.data === undefined,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  }
}
