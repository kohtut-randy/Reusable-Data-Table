import { Avatar, Badge, Meter, TruncatedText } from 'components'
import { createColumnHelper } from 'components/DataTable'
import type { DataTableColumn } from 'components/DataTable'
import { formatTimeRange, toInstant } from 'utils'
import { TIMETABLE_COLUMN_ID, TIMETABLE_COLUMN_WIDTH, TIMETABLE_STATUS_RANK } from '../constants'
import type { ClassDTO, ClassStatus } from '../timetable.types'

/* The column definitions are the domain knowledge: everything the table shows about a
 * class lives here, and the DataTable itself knows nothing about classes.
 *
 * Three columns display one value and sort on another:
 *
 *   Time        shows "10:00 AM to 11:00 AM", sorts the epoch instant
 *   Attendance  shows "12 / 15" and a meter, sorts the booked/capacity ratio
 *   Status      shows a badge, sorts a domain rank rather than alphabetically
 */

const STATUS_TONE: Readonly<Record<ClassStatus, 'success' | 'warning' | 'danger'>> = {
  scheduled: 'success',
  full: 'warning',
  cancelled: 'danger',
}

const STATUS_LABEL: Readonly<Record<ClassStatus, string>> = {
  scheduled: 'Scheduled',
  full: 'Full',
  cancelled: 'Cancelled',
}

const DISCIPLINE_LABEL: Readonly<Record<ClassDTO['discipline'], string>> = {
  bouldering: 'Boulder',
  lead: 'Lead',
  strength: 'Strength',
  youth: 'Youth',
}

const column = createColumnHelper<ClassDTO>()

export type CreateTimetableColumnsOptions = {
  /** Rendered into the Actions cell, so the module owns the menu, not the table. */
  readonly renderActions: (row: ClassDTO) => React.ReactNode
}

export const createTimetableColumns = ({ renderActions }: CreateTimetableColumnsOptions): readonly DataTableColumn<ClassDTO>[] => [
  column({
    field: 'name',
    id: TIMETABLE_COLUMN_ID.name,
    headerName: 'Class',
    sortable: true,
    minWidth: TIMETABLE_COLUMN_WIDTH.name,
    /* Sticky and the row header: the column that identifies the row is both the one
       worth keeping on screen and the one that should name the row to assistive tech. */
    sticky: 'left',
    isRowHeader: true,
    renderCell: row => (
      <span className='flex min-w-0 flex-col gap-1'>
        <TruncatedText className='font-medium text-ink'>{row.name}</TruncatedText>
        <Badge tone='neutral' className='w-fit'>
          {DISCIPLINE_LABEL[row.discipline]}
        </Badge>
      </span>
    ),
  }),

  column({
    field: 'instructor',
    id: TIMETABLE_COLUMN_ID.instructor,
    headerName: 'Instructor',
    sortable: true,
    sortValue: row => row.instructor.name,
    flex: 1.4,
    hideBelow: 'sm',
    renderCell: row => (
      <span className='flex min-w-0 items-center gap-2'>
        <Avatar name={row.instructor.name} />
        <TruncatedText>{row.instructor.name}</TruncatedText>
      </span>
    ),
  }),

  column({
    field: 'startsAt',
    id: TIMETABLE_COLUMN_ID.startsAt,
    headerName: 'Time',
    sortable: true,
    // Sorts the instant; renders the studio-zone range.
    sortValue: row => toInstant(row.startsAt),
    flex: 1.4,
    renderCell: row => (
      <TruncatedText className='[font-variant-numeric:tabular-nums]'>{formatTimeRange(row.startsAt, row.endsAt)}</TruncatedText>
    ),
  }),

  column({
    field: 'room',
    id: TIMETABLE_COLUMN_ID.room,
    headerName: 'Room',
    sortable: true,
    flex: 1,
    hideBelow: 'md',
    renderCell: row => <Badge tone='info'>{row.room}</Badge>,
  }),

  column({
    field: 'booked',
    id: TIMETABLE_COLUMN_ID.attendance,
    headerName: 'Attendance',
    sortable: true,
    // Sorts the ratio, so 9/10 outranks 12/20.
    sortValue: row => (row.capacity > 0 ? row.booked / row.capacity : 0),
    flex: 1.3,
    renderCell: row => (
      <span className='flex min-w-0 flex-col gap-1.5'>
        <span className='text-[0.8125rem] [font-variant-numeric:tabular-nums] text-ink'>
          {row.booked} / {row.capacity}
        </span>
        <Meter value={row.booked} max={row.capacity} label={`${row.booked} of ${row.capacity} places booked`} />
      </span>
    ),
  }),

  column({
    field: 'status',
    id: TIMETABLE_COLUMN_ID.status,
    headerName: 'Status',
    sortable: true,
    /* A row comparator: the order is a domain rule, and alphabetical would give
       cancelled, full, scheduled. */
    sortFn: (a, b) => (TIMETABLE_STATUS_RANK[a.status] ?? 0) - (TIMETABLE_STATUS_RANK[b.status] ?? 0),
    flex: 1,
    renderCell: row => (
      <Badge tone={STATUS_TONE[row.status]} dot>
        {STATUS_LABEL[row.status]}
      </Badge>
    ),
  }),

  column({
    field: 'id',
    id: TIMETABLE_COLUMN_ID.actions,
    headerName: '',
    headerLabel: 'Actions',
    minWidth: TIMETABLE_COLUMN_WIDTH.actions,
    // Right-sticky, so the row menu stays reachable without scrolling back.
    sticky: 'right',
    align: 'center',
    renderCell: renderActions,
  }),
]
