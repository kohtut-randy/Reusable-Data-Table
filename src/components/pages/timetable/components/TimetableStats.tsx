import { StatTile } from 'components'
import { CalendarSVG, ClockSVG, UsersSVG, WalletSVG } from 'icons'
import { formatPercent } from 'utils'
import type { ClassDTO } from '../timetable.types'

export type TimetableStatsProps = {
  classes: readonly ClassDTO[]
  total: number
  loading: boolean
}

/* Derived from the rows already on screen, with `useMemo` deliberately absent: it is
   four reduces over at most 100 rows, which is far cheaper than the memo bookkeeping.
   The numbers describe the CURRENT PAGE, and the labels say so, because claiming a
   whole-dataset figure from one page would be a lie. */
export const TimetableStats = ({ classes, total, loading }: TimetableStatsProps) => {
  const booked = classes.reduce((sum, item) => sum + item.booked, 0)
  const capacity = classes.reduce((sum, item) => sum + item.capacity, 0)
  const waitlist = classes.filter(item => item.status === 'full').length
  const utilisation = capacity > 0 ? booked / capacity : 0

  return (
    <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
      <StatTile label='Classes scheduled' value={total} hint='Across the whole schedule' icon={<CalendarSVG />} loading={loading} />
      <StatTile label='Bookings on this page' value={booked} hint={`of ${capacity} places`} icon={<UsersSVG />} loading={loading} />
      <StatTile label='Wall utilisation' value={formatPercent(utilisation)} hint='This page' icon={<WalletSVG />} loading={loading} />
      <StatTile label='Classes full' value={waitlist} hint='This page' icon={<ClockSVG />} loading={loading} />
    </div>
  )
}
