import type { GetServerSideProps } from 'next'
import { DemoOverview } from 'components/pages/demo'
import type { DemoOverviewProps } from 'components/pages/demo'
import { readPayoutsServerProps } from 'components/pages/payouts'

/* Route file, so it default-exports. It server-renders the payouts page exactly as
   /payouts does, because the card embedded below is the same component in the same
   configuration. */
export const getServerSideProps: GetServerSideProps<DemoOverviewProps> = async context => ({
  props: await readPayoutsServerProps(context),
})

export default function DemoRoute(props: DemoOverviewProps) {
  return <DemoOverview {...props} />
}
