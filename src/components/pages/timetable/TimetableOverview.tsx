import { useState } from 'react'
import { Button, useToast } from 'components'
import { PageHeader, PageMeta } from 'components'
import { PlusSVG } from 'icons'
import { TIMETABLE_DEFAULT_DAY } from './constants'
import { TimetableClassesCard, TimetableDayStepper } from './components'

/* Route-level composition; the thin route file in src/pages renders this and nothing
   else. The selected day lives here because two children need it (the stepper writes,
   the card reads). Sort, page and filter stay inside the card. */
export const TimetableOverview = () => {
  const [date, setDate] = useState(TIMETABLE_DEFAULT_DAY)
  const notify = useToast()

  return (
    <>
      <PageMeta title='Timetable' description='Every class on one studio day, with bookings, attendance and status.' />

      <PageHeader
        title='Timetable'
        description='Every class on one studio day. That whole day is fetched in a single request, then sorted, filtered and paged entirely in the browser.'
        actions={
          <>
            <TimetableDayStepper date={date} onChange={setDate} />
            {/* Says what it does rather than doing nothing. There is no write endpoint
                in a seeded demo, and a silent CTA reads as a bug. */}
            <Button
              tone='brand'
              size='sm'
              icon={<PlusSVG />}
              onClick={() => notify('Creating classes needs a write endpoint, which is outside this demo.')}
            >
              Schedule class
            </Button>
          </>
        }
      />

      <TimetableClassesCard date={date} />
    </>
  )
}
