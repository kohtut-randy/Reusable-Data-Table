/* The DTOs live in the model layer because the API routes need them too. They are
   re-exported here so page code has one obvious import. */
export type {
  AttendeeBookingStatus,
  AttendeeDTO,
  AttendeePaymentType,
  ClassDTO,
  ClassDiscipline,
  ClassStatus,
  InstructorSummary,
} from 'schemas/timetable.types'

/** The edge-case triggers, surfaced through the simulate-states popover. Page-only, not
 *  model layer: the server reads them off the query string, and the UI decides which to
 *  offer. */
export type TimetableTestFlags = {
  readonly slow: boolean
  readonly delayMs: number
  readonly failList: boolean
  readonly failChildren: boolean
  readonly emptyList: boolean
  readonly emptyChildren: boolean
}
