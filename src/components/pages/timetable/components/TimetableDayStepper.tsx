import { IconButton } from 'components'
import { ChevronLeftSVG, ChevronRightSVG } from 'icons'
import { formatWeekday } from 'utils'
import { TIMETABLE_DAY_RANGE } from '../constants'

export type TimetableDayStepperProps = {
  /** Studio-local calendar date, YYYY-MM-DD. */
  date: string
  onChange: (next: string) => void
}

const MS_PER_DAY = 86_400_000

const shiftDay = (date: string, days: number): string =>
  new Date(new Date(`${date}T00:00:00.000Z`).getTime() + days * MS_PER_DAY).toISOString().slice(0, 10)

/* The date stepper. It is the page's only refetch trigger, which makes the data
   boundary legible: stepping the day is a request, and everything else (sort, page,
   filter) is local. */
export const TimetableDayStepper = ({ date, onChange }: TimetableDayStepperProps) => {
  const isFirst = date <= TIMETABLE_DAY_RANGE.first
  const isLast = date >= TIMETABLE_DAY_RANGE.last

  return (
    <div className='flex flex-1 items-center gap-1.5 sm:flex-none'>
      <IconButton
        label='Previous day'
        icon={<ChevronLeftSVG />}
        size='sm'
        tone='outline'
        disabled={isFirst}
        onClick={() => onChange(shiftDay(date, -1))}
      />
      {/* aria-live so a screen reader hears the new day after stepping, since the
          heading itself does not change. */}
      {/* Grows to fill on a phone, fixed width from sm up so the label does not jump as
          the day name changes length. */}
      <p aria-live='polite' className='flex-1 text-center text-[0.8125rem] font-medium text-ink sm:min-w-[13rem] sm:flex-none'>
        {formatWeekday(`${date}T00:00:00.000Z`)}
      </p>
      <IconButton
        label='Next day'
        icon={<ChevronRightSVG />}
        size='sm'
        tone='outline'
        disabled={isLast}
        onClick={() => onChange(shiftDay(date, 1))}
      />
    </div>
  )
}
