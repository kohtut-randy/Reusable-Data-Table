import { PageHeader, PageMeta } from 'components'
import { MembersCard } from './components'

/* Route-level composition, named `<Module>Overview` to match the reference codebase's
   standard module shape. */
export const MembersOverview = () => (
  <>
    <PageMeta title='Members' description='The CRUX Bristol membership roster.' />

    <PageHeader
      title='Members'
      description='The same DataTable again, over a third differently shaped dataset, in server mode and with no expandable rows.'
    />

    <MembersCard />
  </>
)
