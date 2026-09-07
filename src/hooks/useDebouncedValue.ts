import { useEffect, useState } from 'react'

/* Delays a fast-changing value (typically search text) so a query key built from it
   settles once typing pauses, instead of busting on every keystroke. */
export const useDebouncedValue = <TValue>(value: TValue, delayMs: number): TValue => {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
