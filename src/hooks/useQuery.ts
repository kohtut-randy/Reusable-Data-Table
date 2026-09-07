import { useCallback, useEffect, useReducer, useRef } from 'react'
import { useEvent } from './useEvent'

/* The data layer, hand-rolled. React Query would own this in production; it is excluded
   here to keep the build dependency-free.

   `keepPreviousData` defaults to true: changing page keeps the previous rows on screen at
   reduced opacity with `aria-busy` rather than replacing them with skeletons, so
   skeletons appear only on a table's first load. */

export type QueryStatus = 'idle' | 'loading' | 'success' | 'error'

type QueryState<TData> = {
  readonly status: QueryStatus
  readonly data: TData | undefined
  readonly error: Error | null
  readonly isFetching: boolean
}

type QueryAction<TData> =
  { type: 'START'; keepPreviousData: boolean } | { type: 'SUCCESS'; data: TData } | { type: 'ERROR'; error: Error } | { type: 'DISABLED' }

const reducer = <TData>(state: QueryState<TData>, action: QueryAction<TData>): QueryState<TData> => {
  switch (action.type) {
    case 'START':
      return {
        // 'loading' only while there is nothing to show. With data already on screen
        // this stays 'success' and flips `isFetching`, which is what drives the
        // stale-with-progress-bar treatment instead of a skeleton flash.
        status: action.keepPreviousData && state.data !== undefined ? 'success' : 'loading',
        data: action.keepPreviousData ? state.data : undefined,
        error: null,
        isFetching: true,
      }

    case 'SUCCESS':
      return { status: 'success', data: action.data, error: null, isFetching: false }

    case 'ERROR':
      return { status: 'error', data: state.data, error: action.error, isFetching: false }

    case 'DISABLED':
      return { status: 'idle', data: undefined, error: null, isFetching: false }

    default:
      return state
  }
}

const INITIAL_STATE = { status: 'idle', data: undefined, error: null, isFetching: false } as const

export type UseFetchQueryOptions<TData> = {
  /** Serialised dependencies. THE ONLY refetch trigger, so a refetch is never accidental. */
  readonly key: string
  readonly fetcher: (signal: AbortSignal) => Promise<TData>
  readonly enabled?: boolean
  readonly keepPreviousData?: boolean
}

export type UseFetchQueryResult<TData> = QueryState<TData> & {
  readonly refetch: () => void
}

export const useFetchQuery = <TData>({
  key,
  fetcher,
  enabled = true,
  keepPreviousData = true,
}: UseFetchQueryOptions<TData>): UseFetchQueryResult<TData> => {
  const [state, dispatch] = useReducer(reducer as typeof reducer<TData>, INITIAL_STATE as QueryState<TData>)

  /* Wrapped, so callers can pass an inline closure without it becoming a refetch
     trigger. `key` is the only thing that decides when to refetch, which is what makes
     the trigger auditable: you can read the key and know exactly when it fires. */
  const run = useEvent(fetcher)

  const requestId = useRef(0)
  const [nonce, bump] = useReducer((value: number) => value + 1, 0)

  // One job: run the request for the current key, and cancel it if the key changes.
  useEffect(() => {
    if (!enabled) {
      dispatch({ type: 'DISABLED' })
      return
    }

    const controller = new AbortController()
    requestId.current += 1
    const id = requestId.current

    dispatch({ type: 'START', keepPreviousData })

    run(controller.signal)
      .then(data => {
        // A superseded request must never overwrite a newer one's data.
        if (id !== requestId.current || controller.signal.aborted) return
        dispatch({ type: 'SUCCESS', data })
      })
      .catch((error: unknown) => {
        /* An abort is the expected outcome of a key change or an unmount, never an
           error to render. Swallowing only this is why the catch is narrow. */
        if (controller.signal.aborted || id !== requestId.current) return
        dispatch({ type: 'ERROR', error: error instanceof Error ? error : new Error(String(error)) })
      })

    return () => controller.abort()
  }, [key, enabled, keepPreviousData, nonce, run])

  const refetch = useCallback(() => bump(), [])

  return { ...state, refetch }
}
