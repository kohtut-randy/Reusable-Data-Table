import { Avatar, Badge } from 'components'
import { formatDateShort, formatTime } from 'utils'
import type { AttendeeBookingStatus, AttendeeDTO, AttendeePaymentType } from '../timetable.types'

export type TimetableAttendeeListProps = {
  attendees: readonly AttendeeDTO[]
  className: string
}

const PAYMENT_LABEL: Readonly<Record<AttendeePaymentType, string>> = {
  membership: 'Membership',
  'drop-in': 'Drop in',
  'class-pass': 'Class pass',
  comp: 'Comp',
}

const BOOKING_TONE: Readonly<Record<AttendeeBookingStatus, 'success' | 'info' | 'warning' | 'danger'>> = {
  booked: 'info',
  'checked-in': 'success',
  waitlist: 'warning',
  'no-show': 'danger',
}

const BOOKING_LABEL: Readonly<Record<AttendeeBookingStatus, string>> = {
  booked: 'Booked',
  'checked-in': 'Checked in',
  waitlist: 'Waitlist',
  'no-show': 'No show',
}

/* The expanded content for a class row. A plain list rather than a nested table,
   because attendees are a flat roster of five short fields: a table would add a header
   row and column machinery for no gain. The payouts page nests a real DataTable, where
   the children genuinely are tabular, which is the contrast worth having. */
export const TimetableAttendeeList = ({ attendees, className }: TimetableAttendeeListProps) => (
  <div className='px-4 py-3.5'>
    <p className='mb-3 text-xs font-medium text-ink-muted'>
      {attendees.length} {attendees.length === 1 ? 'booking' : 'bookings'} for {className}
    </p>

    <ul role='list' className='flex flex-col gap-1.5'>
      {attendees.map(attendee => (
        <li key={attendee.id} className='flex flex-wrap items-center gap-3 rounded-lg border border-line bg-surface-raised px-3 py-2'>
          <Avatar name={attendee.name} />
          <span className='min-w-0 flex-1 truncate text-[0.8125rem] font-medium text-ink'>{attendee.name}</span>

          <Badge tone='neutral'>{PAYMENT_LABEL[attendee.paymentType]}</Badge>
          <Badge tone={BOOKING_TONE[attendee.bookingStatus]} dot>
            {BOOKING_LABEL[attendee.bookingStatus]}
          </Badge>

          {/* Formatted in the studio zone through the central formatter, never with a
              bare new Date(). */}
          <span className='text-xs [font-variant-numeric:tabular-nums] text-ink-subtle'>
            {formatDateShort(attendee.bookedAt)}, {formatTime(attendee.bookedAt)}
          </span>
        </li>
      ))}
    </ul>
  </div>
)
