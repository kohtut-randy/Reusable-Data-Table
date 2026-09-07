import { useMediaQuery } from 'hooks'
import type { Breakpoint } from '../DataTable.types'
import { BREAKPOINT_PX } from '../constants'

export type BreakpointFlags = Readonly<Record<Breakpoint, boolean>> & {
  /** False during SSR, true on the client at any width. It needs its own probe: reusing
   *  `sm` would read as "not resolved yet" on a 390px phone, which is exactly the case
   *  `hideBelow` exists for. */
  readonly ready: boolean
}

/* Four fixed queries rather than one measured width: hooks cannot run in a loop over
   caller data, and a numeric width would re-render the table on every pixel of a resize
   when `hideBelow` only cares about four thresholds. */
export const useBreakpoints = (): BreakpointFlags => {
  // Always true in a browser, false on the server: the readiness signal.
  const ready = useMediaQuery('(min-width: 0px)')
  const sm = useMediaQuery(`(min-width: ${BREAKPOINT_PX.sm}px)`)
  const md = useMediaQuery(`(min-width: ${BREAKPOINT_PX.md}px)`)
  const lg = useMediaQuery(`(min-width: ${BREAKPOINT_PX.lg}px)`)
  const xl = useMediaQuery(`(min-width: ${BREAKPOINT_PX.xl}px)`)

  return { ready, sm, md, lg, xl }
}
