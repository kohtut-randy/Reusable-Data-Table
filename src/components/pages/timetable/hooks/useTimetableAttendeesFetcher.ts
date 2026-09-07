import { useCallback } from 'react'
import { fetchClassAttendees } from 'services/api'
import type { AttendeeDTO, ClassDTO, TimetableTestFlags } from '../timetable.types'

/** Supplies `fetchChildren` for the table's on-demand expansion. A plain fetcher, not a
 *  query hook: the table already owns the per-row loading, error, retry, cache and abort
 *  machine, and its AbortSignal passes straight through so a collapse cancels. */
export const useTimetableAttendeesFetcher = (
  flags: TimetableTestFlags,
): ((row: ClassDTO, signal: AbortSignal) => Promise<readonly AttendeeDTO[]>) =>
  useCallback(
    (row, signal) =>
      fetchClassAttendees(
        {
          classId: row.id,
          delay: flags.slow ? flags.delayMs : undefined,
          failChildren: flags.failChildren,
          emptyChildren: flags.emptyChildren,
        },
        signal,
      ),
    [flags],
  )
