import Link from 'next/link'
import { Card, CardHeader } from 'components'

type ConfigRow = {
  readonly where: string
  readonly href: string
  readonly dataset: string
  readonly sort: string
  readonly pagination: string
  readonly expansion: string
}

const CONFIGS: readonly ConfigRow[] = [
  {
    where: 'Timetable',
    href: '/',
    dataset: 'Classes, one studio day',
    sort: 'client',
    pagination: 'client',
    expansion: 'inline children',
  },
  {
    where: 'Payouts',
    href: '/payouts',
    dataset: 'Instructor payouts',
    sort: 'server',
    pagination: 'server',
    expansion: 'on demand, nested table',
  },
  {
    where: 'Members',
    href: '/members',
    dataset: 'Member roster',
    sort: 'server',
    pagination: 'server',
    expansion: 'none',
  },
  {
    where: 'Below',
    href: '/demo',
    dataset: 'Wall zones',
    sort: 'client',
    pagination: 'none',
    expansion: 'none',
  },
]

const HEAD_CLASS = 'px-4 py-2.5 text-left text-xs font-medium text-ink-muted'
const CELL_CLASS = 'px-4 py-2.5 text-[0.8125rem] text-ink-muted'

/* The reusability claim in one screen: four configurations of one component, and the
   only thing that differs between them is the props each caller passes. */
export const DemoConfigMatrix = () => (
  <Card flush>
    <CardHeader
      title='One component, four configurations'
      description='Every row below renders the same DataTable. Nothing in the component changes between them.'
    />

    <div className='overflow-x-auto'>
      <table className='w-full border-collapse'>
        <caption className='sr-only'>How each page configures the DataTable</caption>
        <thead>
          <tr className='border-b border-line'>
            <th scope='col' className={HEAD_CLASS}>
              Where
            </th>
            <th scope='col' className={HEAD_CLASS}>
              Dataset
            </th>
            <th scope='col' className={HEAD_CLASS}>
              Sort
            </th>
            <th scope='col' className={HEAD_CLASS}>
              Pagination
            </th>
            <th scope='col' className={HEAD_CLASS}>
              Expansion
            </th>
          </tr>
        </thead>
        <tbody>
          {CONFIGS.map(config => (
            <tr key={config.where} className='border-b border-line last:border-b-0'>
              <th scope='row' className='px-4 py-2.5 text-left text-[0.8125rem] font-medium text-ink'>
                {config.href === '/demo' ? (
                  config.where
                ) : (
                  <Link href={config.href} className='dt-focus-ring rounded underline-offset-2 hover:underline'>
                    {config.where}
                  </Link>
                )}
              </th>
              <td className={CELL_CLASS}>{config.dataset}</td>
              <td className={CELL_CLASS}>{config.sort}</td>
              <td className={CELL_CLASS}>{config.pagination}</td>
              <td className={CELL_CLASS}>{config.expansion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
)
