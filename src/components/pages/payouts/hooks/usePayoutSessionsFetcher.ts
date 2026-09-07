import { useCallback } from 'react'
import { fetchPayoutSessions } from 'services/api'
import type { PayoutDTO, PayoutSessionDTO, PayoutsTestFlags } from '../payouts.types'

/** Supplies `fetchChildren` for the table's on-demand expansion. A plain fetcher, not a
 *  query hook: the table already owns the per-row loading, error, retry, cache and abort
 *  machine, and its AbortSignal passes straight through so a collapse cancels. */
export const usePayoutSessionsFetcher = (
  flags: PayoutsTestFlags,
): ((row: PayoutDTO, signal: AbortSignal) => Promise<readonly PayoutSessionDTO[]>) =>
  useCallback(
    (row, signal) =>
      fetchPayoutSessions(
        {
          payoutId: row.id,
          delay: flags.slow ? flags.delayMs : undefined,
          failChildren: flags.failChildren,
          emptyChildren: flags.emptyChildren,
        },
        signal,
      ),
    [flags],
  )
