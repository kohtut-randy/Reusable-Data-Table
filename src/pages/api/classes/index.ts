import type { NextApiRequest, NextApiResponse } from 'next'
import { LATENCY_LIST_MS } from 'constants/api'
import { STUDIO_UTC_OFFSET_HOURS } from 'constants/datetime'
import type { ClassDTO } from 'schemas/timetable.types'
import { getMockData } from 'server/mock/getMockData'
import { handleListRequest } from 'server/mock/listHandler'
import { readTestFlags } from 'server/mock/testFlags'

/* GET /api/classes
 *
 *   ?page=1&pageSize=25          1-based on the wire
 *   &sortBy=name&sortDir=asc
 *   &q=bouldering
 *   &include=attendees           inline-children payload
 *   &delay=3000 &fail=1 &empty=1 &emptyChildren=1
 *
 * Sort keys are declared rather than inferred from the DTO: they are part of the
 * endpoint's contract, and an undeclared key is dropped rather than sorting on
 * something arbitrary. */
const SORT_KEYS = {
  name: (row: ClassDTO) => row.name,
  instructor: (row: ClassDTO) => row.instructor.name,
  // Sorts the underlying INSTANT, never the formatted time string.
  startsAt: (row: ClassDTO) => Date.parse(row.startsAt),
  room: (row: ClassDTO) => row.room,
  attendance: (row: ClassDTO) => (row.capacity > 0 ? row.booked / row.capacity : 0),
  status: (row: ClassDTO) => row.status,
} as const

/* Day filtering happens on the server, which is what makes the timetable's client-side
   pagination honest: one request returns every class on that day, and the browser sorts
   and pages the complete set rather than paginating a page. */
const isOnStudioDay = (row: ClassDTO, dayIso: string): boolean => {
  const start = new Date(row.startsAt)
  // Shift into studio-local time before taking the calendar date, or a 7 am class in
  // Singapore lands on the previous UTC day.
  const local = new Date(start.getTime() + STUDIO_UTC_OFFSET_HOURS * 3600 * 1000)
  return local.toISOString().slice(0, 10) === dayIso
}

const matches = (row: ClassDTO, query: string): boolean =>
  row.name.toLowerCase().includes(query) || row.instructor.name.toLowerCase().includes(query) || row.room.toLowerCase().includes(query)

export default async function handler(request: NextApiRequest, response: NextApiResponse): Promise<void> {
  const data = getMockData()
  const flags = readTestFlags(request)
  const wantsAttendees = request.query.include === 'attendees'

  const day = typeof request.query.date === 'string' ? request.query.date : null
  const rows = day ? data.classes.filter(row => isOnStudioDay(row, day)) : data.classes

  await handleListRequest<ClassDTO>(request, response, {
    rows,
    sortKeys: SORT_KEYS,
    band: LATENCY_LIST_MS,
    errorMessage: 'The scheduling service did not respond. This is the simulated error state.',
    matches,
    /* Inline children only when asked for: unconditionally, a 5,000-class dataset would
       push roughly 60,000 attendee records. */
    decorate: wantsAttendees
      ? row => ({ ...row, attendees: flags.emptyChildren ? [] : (data.attendeesByClass.get(row.id) ?? []) })
      : undefined,
  })
}
