import { MAX_FORCED_DELAY_MS } from 'constants/api'

export type LatencyBand = { readonly min: number; readonly max: number }

/**
 * Adds artificial latency so the loading states are real rather than theoretical.
 *
 * `forcedMs` comes from `?delay=`, capped, which is what makes the slow-fetch edge case
 * demonstrable on the deployed URL without opening DevTools.
 */
export const delayResponse = async (band: LatencyBand, forcedMs?: number | undefined): Promise<number> => {
  const latency =
    forcedMs === undefined
      ? Math.round(band.min + Math.random() * (band.max - band.min))
      : Math.min(Math.max(forcedMs, 0), MAX_FORCED_DELAY_MS)

  await new Promise(resolve => setTimeout(resolve, latency))
  return latency
}
