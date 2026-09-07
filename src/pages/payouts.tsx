import type { GetServerSideProps } from 'next'
import { PayoutsOverview, readPayoutsServerProps } from 'components/pages/payouts'
import type { PayoutsOverviewProps } from 'components/pages/payouts'

/* Route file, so it default-exports. The server-side props are shared with /demo, which
   renders the same card. */
export const getServerSideProps: GetServerSideProps<PayoutsOverviewProps> = async context => ({
  props: await readPayoutsServerProps(context),
})

export default function PayoutsRoute(props: PayoutsOverviewProps) {
  return <PayoutsOverview {...props} />
}
