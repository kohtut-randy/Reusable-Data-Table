import { PageHeader, PageMeta } from 'components'
import type { PageState, SortState } from 'components/DataTable'
import { PayoutsCard } from 'components/pages/payouts'
import type { PayoutsListResponse } from 'services/api'
import { DemoConfigMatrix, DemoMinimalTable } from './components'

export type DemoOverviewProps = {
  initialData: PayoutsListResponse
  initialSort: SortState
  initialPage: PageState
}

/* The reusability showcase the brief asks for, kept separate from the three product
   pages because a staff dashboard should not ship a page documenting its own component
   library. It composes the real cards rather than re-implementing them, so there is one
   implementation of each configuration and this page cannot drift from the product. */
export const DemoOverview = ({ initialData, initialSort, initialPage }: DemoOverviewProps) => (
  <>
    <PageMeta
      title='Component demo'
      description='The same DataTable across four configurations: client and server modes, inline and on-demand children, and none at all.'
    />

    <PageHeader
      title='Component demo'
      description='Everything on this page is the same DataTable component. It exists to show that the table is configured by its props rather than built around the timetable, and it is the only page here that is about the component instead of the gym.'
    />

    <div className='flex flex-col gap-6'>
      <DemoConfigMatrix />

      <DemoMinimalTable />

      <section className='flex flex-col gap-3'>
        <div className='flex flex-col gap-1'>
          <h2 className='text-[0.9375rem] font-semibold text-ink'>A differently shaped dataset, in server mode</h2>
          <p className='max-w-[70ch] text-[0.8125rem] text-ink-muted'>
            The same component over instructor payouts: currency in minor units, a date range, a nullable paid date that sorts
            last in both directions, a left-pinned identity column and a right-pinned total. Sorting and paging are emitted to
            the server, and expanding a row fetches its sessions on demand into a nested DataTable. Use{' '}
            <strong className='font-medium text-ink'>Simulate states</strong> to force the slow, failed, and empty cases.
          </p>
        </div>

        <PayoutsCard initialData={initialData} initialSort={initialSort} initialPage={initialPage} />
      </section>
    </div>
  </>
)
