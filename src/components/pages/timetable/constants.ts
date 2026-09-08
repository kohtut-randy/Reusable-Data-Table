export const TIMETABLE_CAPTION = 'Classes on the DT Bristol schedule'
export const TIMETABLE_NOUN = 'classes'

/** Column ids, referenced by the column definitions and by the default sort. */
export const TIMETABLE_COLUMN_ID = {
  name: 'name',
  instructor: 'instructor',
  startsAt: 'startsAt',
  room: 'room',
  attendance: 'attendance',
  status: 'status',
  actions: 'actions',
} as const

/* Sticky columns must be px, since sticky offsets are prefix sums of declared widths.
   The total is ~1176px, so the sticky column is exercised on a laptop, not only a phone. */
export const TIMETABLE_COLUMN_WIDTH = {
  name: '260px',
  actions: '56px',
} as const

/** Status ordering for the sort: scheduled, then full, then cancelled. */
export const TIMETABLE_STATUS_RANK: Readonly<Record<string, number>> = {
  scheduled: 0,
  full: 1,
  cancelled: 2,
}

export const TIMETABLE_DEFAULT_PAGE_SIZE = 25

/* Measured height of one real row (two-line Class cell plus the attendance meter).
   Handed to the table so its skeleton rows match, which is what keeps CLS at zero. */
export const TIMETABLE_ROW_HEIGHT_PX = 65

/* The seeded dataset spans 28 days from its reference date, so the stepper is bounded
   to that window: stepping past it would show a legitimately empty day, which is a
   worse demonstration than not offering the step. */
export const TIMETABLE_DEFAULT_DAY = '2026-09-03'
export const TIMETABLE_DAY_RANGE = { first: '2026-09-03', last: '2026-09-30' } as const
