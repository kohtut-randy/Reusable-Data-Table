import { useCallback, useEffect, useInsertionEffect, useRef, useState } from 'react'

export type UseControlledStateOptions<S> = {
  /** `undefined` means uncontrolled. Use `null` for a controlled-but-empty value. */
  value: S | undefined
  defaultValue: S | (() => S)
  onChange?: (next: S) => void
  /** Used only in the dev warning, so a mismatch says which prop flipped. */
  name?: string
}

/**
 * The one resolver for every controlled/uncontrolled prop pair in the table: sort,
 * pagination and expansion. Three things it guarantees, all load-bearing downstream:
 *
 * - the setter identity is permanently stable, so it cannot defeat the memo boundaries
 *   it flows into,
 * - the updater form works in both modes, so two updater calls in one tick compose,
 * - no-op writes are dropped, so a controlled parent syncing to the URL does not push a
 *   duplicate history entry, and the pagination clamping effect cannot loop.
 */
export const useControlledState = <S>({
  value,
  defaultValue,
  onChange,
  name = 'value',
}: UseControlledStateOptions<S>): readonly [S, (next: S | ((prev: S) => S)) => void] => {
  const isControlled = value !== undefined

  /* Switching a prop between controlled and uncontrolled mid-life is a caller bug with a
     confusing symptom, so it is named in dev. Checked in an effect, not during render:
     reading a ref in the render phase is unsafe under concurrent rendering. */
  const wasControlled = useRef(isControlled)

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return
    if (wasControlled.current === isControlled) return
    console.warn(`[DataTable] \`${name}\` switched between controlled and uncontrolled.`)
    wasControlled.current = isControlled
  }, [isControlled, name])

  const [uncontrolled, setUncontrolled] = useState<S>(defaultValue)
  const resolved = isControlled ? (value as S) : uncontrolled

  /* Mirrors kept fresh in an insertion effect, so the stable setter below never reads a
     stale closure and never writes a ref during render. */
  const latest = useRef(resolved)
  const latestOnChange = useRef(onChange)
  const latestIsControlled = useRef(isControlled)

  useInsertionEffect(() => {
    latest.current = resolved
    latestOnChange.current = onChange
    latestIsControlled.current = isControlled
  })

  const set = useCallback((next: S | ((prev: S) => S)) => {
    const previous = latest.current
    const resolvedNext = typeof next === 'function' ? (next as (prev: S) => S)(previous) : next

    if (Object.is(resolvedNext, previous)) return

    if (!latestIsControlled.current) {
      latest.current = resolvedNext
      setUncontrolled(resolvedNext)
    }

    latestOnChange.current?.(resolvedNext)
  }, [])

  return [resolved, set] as const
}
