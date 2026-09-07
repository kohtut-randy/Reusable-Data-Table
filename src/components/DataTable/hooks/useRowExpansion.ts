import { useCallback, useEffect, useInsertionEffect, useMemo, useReducer, useRef } from 'react'
import type { ExpandConfig, RowDetail, RowId } from '../DataTable.types'
import { useControlledState } from './useControlledState'

/* The per-row async machine. A reducer rather than `useState`, because every transition
 * is keyed by row id and fired from an async callback, where hand-merging a Map through
 * a functional update invites stale closures.
 *
 *   expand(id)   --cache hit--> render the cached success, no fetch
 *                --cache miss-> FETCH_START --> FETCH_SUCCESS | FETCH_ERROR
 *   collapse(id) -> abort any in-flight request; keep the cached entry
 *   retry(id)    -> FETCH_START, from the error state only
 *
 * Race safety: each request takes a per-row nonce from a ref, and a resolution whose
 * nonce is stale is dropped before it reaches dispatch. With a per-row AbortController
 * that makes rapid expand/collapse/expand safe, resolves StrictMode's double invocation
 * to one render, and guarantees no setState after unmount. The nonce and the controllers
 * live in refs because neither is needed for rendering.
 */

type ExpansionState<C> = {
  readonly details: ReadonlyMap<RowId, RowDetail<C>>
  /** Rows whose detail shell has ever been expanded, so content mounts lazily once. */
  readonly mounted: ReadonlySet<RowId>
}

type ExpansionAction<C> =
  { type: 'MOUNT'; rowId: RowId } | { type: 'SET_DETAIL'; rowId: RowId; detail: RowDetail<C> } | { type: 'INVALIDATE'; rowId: RowId }

const reducer = <C>(state: ExpansionState<C>, action: ExpansionAction<C>): ExpansionState<C> => {
  switch (action.type) {
    case 'MOUNT': {
      if (state.mounted.has(action.rowId)) return state
      const mounted = new Set(state.mounted)
      mounted.add(action.rowId)
      return { ...state, mounted }
    }

    case 'SET_DETAIL': {
      const details = new Map(state.details)
      details.set(action.rowId, action.detail)
      return { ...state, details }
    }

    case 'INVALIDATE': {
      if (!state.details.has(action.rowId)) return state
      const details = new Map(state.details)
      details.delete(action.rowId)
      return { ...state, details }
    }

    default:
      return state
  }
}

const initialState = <C>(): ExpansionState<C> => ({ details: new Map(), mounted: new Set() })

const IDLE_DETAIL = { status: 'idle' } as const

export type UseRowExpansionOptions<T, C> = {
  readonly config: ExpandConfig<T, C> | undefined
}

export type ExpansionModel<T, C> = {
  readonly expandedRowIds: ReadonlySet<RowId>
  readonly hasMounted: (rowId: RowId) => boolean
  readonly detailFor: (rowId: RowId) => RowDetail<C>
  readonly toggle: (rowId: RowId, row: T) => void
  readonly collapse: (rowId: RowId) => void
  readonly retry: (rowId: RowId, row: T) => void
  readonly invalidate: (rowId: RowId) => void
  readonly canExpand: (row: T) => boolean
  readonly ensureDetails: (entries: readonly { readonly id: RowId; readonly row: T }[]) => void
  readonly enabled: boolean
}

export const useRowExpansion = <T, C>({ config }: UseRowExpansionOptions<T, C>): ExpansionModel<T, C> => {
  const [state, dispatch] = useReducer(reducer as typeof reducer<C>, undefined, initialState<C>)

  const [expandedRowIds, setExpandedRowIds] = useControlledState<ReadonlySet<RowId>>({
    value: config?.expandedRowIds,
    defaultValue: () => new Set(config?.defaultExpandedRowIds ?? []),
    name: 'expandedRowIds',
  })

  const controllers = useRef(new Map<RowId, AbortController>())
  const nonces = useRef(new Map<RowId, number>())

  /* Mirrored so the callbacks below keep a permanently stable identity. `toggle` reaches
     every memoised Row, so an identity that moved with any row's detail would re-render
     all 25 rows on every expand. */
  const latest = useRef({ config, expandedRowIds, details: state.details })

  useInsertionEffect(() => {
    latest.current = { config, expandedRowIds, details: state.details }
  })

  // One job: abort everything still in flight when the table unmounts.
  useEffect(() => {
    const map = controllers.current
    return () => {
      map.forEach(controller => controller.abort())
      map.clear()
    }
  }, [])

  const startFetch = useCallback((rowId: RowId, row: T) => {
    const config = latest.current.config
    if (config?.mode !== 'lazy') return

    controllers.current.get(rowId)?.abort()
    const controller = new AbortController()
    controllers.current.set(rowId, controller)

    const requestNonce = (nonces.current.get(rowId) ?? 0) + 1
    nonces.current.set(rowId, requestNonce)

    dispatch({ type: 'SET_DETAIL', rowId, detail: { status: 'loading' } })

    const isCurrent = (): boolean => !controller.signal.aborted && nonces.current.get(rowId) === requestNonce

    config
      .fetchChildren(row, controller.signal)
      .then(data => {
        if (!isCurrent()) return
        dispatch({ type: 'SET_DETAIL', rowId, detail: { status: 'success', data } })
      })
      .catch((error: unknown) => {
        // An abort is the expected outcome of collapsing, never an error to show.
        if (!isCurrent()) return
        dispatch({
          type: 'SET_DETAIL',
          rowId,
          detail: { status: 'error', error: error instanceof Error ? error : new Error(String(error)) },
        })
      })
  }, [])

  /* `next` is computed outside the state updater and passed as a value, so
     `onExpandedChange` fires exactly once: React may invoke an updater twice, which
     would emit two notifications for one click. */
  const collapse = useCallback(
    (rowId: RowId) => {
      const { config, expandedRowIds } = latest.current

      controllers.current.get(rowId)?.abort()
      controllers.current.delete(rowId)
      // Bump the nonce so an in-flight resolution that beat the abort is still dropped.
      nonces.current.set(rowId, (nonces.current.get(rowId) ?? 0) + 1)

      if (config?.mode === 'lazy' && config.cache === false) dispatch({ type: 'INVALIDATE', rowId })

      if (!expandedRowIds.has(rowId)) return

      const next = new Set(expandedRowIds)
      next.delete(rowId)
      setExpandedRowIds(next)
      config?.onExpandedChange?.(next, { rowId, expanded: false })
    },
    [setExpandedRowIds],
  )

  const expand = useCallback(
    (rowId: RowId, row: T) => {
      const { config, expandedRowIds, details } = latest.current
      if (!config) return

      dispatch({ type: 'MOUNT', rowId })

      if (config.mode === 'inline') {
        dispatch({ type: 'SET_DETAIL', rowId, detail: { status: 'success', data: config.getChildren(row) ?? [] } })
      } else {
        // Cache hit: the entry survived an earlier collapse, so no request at all.
        const cached = details.get(rowId)
        const isCacheHit = config.cache !== false && cached?.status === 'success'
        if (!isCacheHit) startFetch(rowId, row)
      }

      const next = config.allowMultiple === false ? new Set<RowId>() : new Set(expandedRowIds)
      next.add(rowId)
      setExpandedRowIds(next)
      config.onExpandedChange?.(next, { rowId, expanded: true })
    },
    [setExpandedRowIds, startFetch],
  )

  const toggle = useCallback(
    (rowId: RowId, row: T) => {
      if (latest.current.expandedRowIds.has(rowId)) collapse(rowId)
      else expand(rowId, row)
    },
    [collapse, expand],
  )

  /** Resolves any row that is expanded but has no detail entry yet, so
   *  `defaultExpandedRowIds` and a controlled parent do not render an empty shell
   *  forever. Idempotent: a row that already has an entry is skipped. */
  const ensureDetails = useCallback(
    (entries: readonly { readonly id: RowId; readonly row: T }[]) => {
      const { config, expandedRowIds, details } = latest.current
      if (!config) return

      for (const entry of entries) {
        if (!expandedRowIds.has(entry.id) || details.has(entry.id)) continue

        dispatch({ type: 'MOUNT', rowId: entry.id })

        if (config.mode === 'inline') {
          dispatch({ type: 'SET_DETAIL', rowId: entry.id, detail: { status: 'success', data: config.getChildren(entry.row) ?? [] } })
        } else {
          startFetch(entry.id, entry.row)
        }
      }
    },
    [startFetch],
  )

  const retry = useCallback((rowId: RowId, row: T) => startFetch(rowId, row), [startFetch])

  const invalidate = useCallback((rowId: RowId) => dispatch({ type: 'INVALIDATE', rowId }), [])

  const canExpand = useCallback((row: T) => {
    const config = latest.current.config
    return config ? (config.canExpand?.(row) ?? true) : false
  }, [])

  const detailFor = useCallback((rowId: RowId): RowDetail<C> => state.details.get(rowId) ?? IDLE_DETAIL, [state.details])

  const hasMounted = useCallback((rowId: RowId) => state.mounted.has(rowId), [state.mounted])

  return useMemo(
    () => ({
      expandedRowIds,
      hasMounted,
      detailFor,
      toggle,
      collapse,
      retry,
      invalidate,
      canExpand,
      ensureDetails,
      enabled: config !== undefined,
    }),
    [expandedRowIds, hasMounted, detailFor, toggle, collapse, retry, invalidate, canExpand, ensureDetails, config],
  )
}
