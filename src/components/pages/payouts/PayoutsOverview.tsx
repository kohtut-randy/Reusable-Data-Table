import { PageHeader, PageMeta } from 'components'
import type { PageState, SortState } from 'components/DataTable'
import type { PayoutsListResponse } from 'services/api'
import { PayoutsCard } from './components'

export type PayoutsOverviewProps = {
  initialData: PayoutsListResponse
  initialSort: SortState
  initialPage: PageState
}

/* Route-level composition. The props come from getServerSideProps, so the first page of
   rows is rendered on the server: that is what makes the "genuinely server-side" claim
   checkable by viewing source rather than trusting a label. */
export const PayoutsOverview = ({ initialData, initialSort, initialPage }: PayoutsOverviewProps) => (
  <>
    <PageMeta title='Payouts' description='Instructor payouts by pay period, sorted and paged on the server.' />

    <PageHeader
      title='Payouts'
      description='The same DataTable component over a differently shaped dataset, in server-sort and server-pagination mode, with session line items fetched on demand.'
    />

    <PayoutsCard initialData={initialData} initialSort={initialSort} initialPage={initialPage} />
  </>
)
