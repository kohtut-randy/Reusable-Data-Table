/* The timetable's API contract as types. They sit beside their yup schemas rather than
 * inside the page module because `src/pages/api/**` needs them too, and a server route
 * importing from a UI folder would invert the layering.
 *
 * Hand-written rather than `yup.InferType`: InferType widens `.oneOf([...]).required()`
 * into `NonNullable<'a' | 'b' | undefined>` and makes arrays mutable, which fights the
 * readonly DTOs and leaks into every signature. `contract.assert.ts` keeps the two in
 * step at compile time. */

export type ClassStatus = 'scheduled' | 'full' | 'cancelled'
export type ClassDiscipline = 'bouldering' | 'lead' | 'strength' | 'youth'
export type AttendeePaymentType = 'membership' | 'drop-in' | 'class-pass' | 'comp'
export type AttendeeBookingStatus = 'booked' | 'checked-in' | 'waitlist' | 'no-show'

export type InstructorSummary = {
  readonly id: string
  readonly name: string
  readonly tier: 'coach' | 'senior' | 'lead'
}

export type AttendeeDTO = {
  readonly id: string
  readonly name: string
  readonly paymentType: AttendeePaymentType
  readonly bookingStatus: AttendeeBookingStatus
  /** UTC instant. Formatted in the studio's zone, never parsed from a display string. */
  readonly bookedAt: string
}

export type ClassDTO = {
  readonly id: string
  readonly name: string
  readonly discipline: ClassDiscipline
  readonly instructor: InstructorSummary
  /** UTC instants with offset. Never a naive local string. */
  readonly startsAt: string
  readonly endsAt: string
  /** IANA zone the class is scheduled in, carried alongside the instant. */
  readonly timeZone: string
  readonly room: string
  readonly booked: number
  readonly capacity: number
  readonly status: ClassStatus
  /** Present only when the request asked for `include=attendees` (inline children). */
  readonly attendees?: readonly AttendeeDTO[]
}
