import { useCallback, useMemo, useSyncExternalStore } from 'react'

/* `useSyncExternalStore` rather than useState plus an effect, for its `getServerSnapshot`:
   the server render and the first client render agree, so there is no hydration mismatch
   and no post-hydration flash.

   The server snapshot is `false`, so the wide layout is assumed and only genuinely narrow
   clients adjust after hydration. */
export const useMediaQuery = (query: string): boolean => {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    [query],
  )

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query])
  const getServerSnapshot = useMemo(() => () => false, [])

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
