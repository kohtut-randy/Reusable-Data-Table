import { useCallback, useInsertionEffect, useRef } from 'react'

/* A stable callback identity that still sees the latest render's closure. `useCallback`
   gives one or the other: an empty dep array captures a stale closure, and a populated
   one changes identity and invalidates every memoised child it reaches.

   `useInsertionEffect` for the ref update, because it runs before layout effects and
   before any child effect could call the handler with a stale reference. */
export const useEvent = <A extends readonly unknown[], R>(handler: (...args: A) => R): ((...args: A) => R) => {
  const latest = useRef(handler)

  useInsertionEffect(() => {
    latest.current = handler
  })

  return useCallback((...args: A): R => latest.current(...args), [])
}
