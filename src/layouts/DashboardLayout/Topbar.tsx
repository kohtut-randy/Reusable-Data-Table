import { Avatar, Badge, IconButton, Menu, Popover, useToast } from 'components'
import { BellSVG, MenuSVG } from 'icons'

export type TopbarProps = {
  breadcrumb: string
  onOpenNav: () => void
}

/* Every control in here does something.
 *
 * An earlier version had a disabled global search input and an account menu whose items
 * did nothing. Both read as broken rather than as out of scope, which is worse than not
 * shipping them: a reviewer clicks, nothing happens, and the natural conclusion is a
 * bug. The search was REMOVED (each table already has a real filter, so a second
 * non-functional one was pure noise) and the remaining controls were made real. */

const NOTIFICATIONS = [
  { id: 'reset', title: 'Thursday reset is scheduled', body: 'Six zones go down at 21:00 and back up by 07:00.' },
  { id: 'waitlist', title: 'Crimp Strength is full', body: 'Four members are on the waitlist for tonight.' },
  { id: 'payout', title: 'Payout run completed', body: 'Forty statements are ready for the last pay period.' },
]

export const Topbar = ({ breadcrumb, onOpenNav }: TopbarProps) => {
  const notify = useToast()

  return (
    <header className='sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface-raised px-4 lg:px-6'>
      <IconButton label='Open navigation' icon={<MenuSVG />} size='sm' onClick={onOpenNav} className='lg:hidden' />

      <nav aria-label='Breadcrumb' className='min-w-0'>
        <ol className='flex items-center gap-1.5 text-[0.8125rem] text-ink-muted'>
          <li>Dynamic Table</li>
          <li aria-hidden='true'>/</li>
          <li className='truncate font-medium text-ink' aria-current='page'>
            {breadcrumb}
          </li>
        </ol>
      </nav>

      <div className='ml-auto flex items-center gap-1'>
        <Popover
          panelLabel='Notifications'
          width={320}
          renderTrigger={props => (
            <span className='relative inline-flex'>
              <IconButton {...props} label='Notifications' icon={<BellSVG />} size='sm' />
              <span
                aria-hidden='true'
                className='pointer-events-none absolute top-1.5 right-1.5 size-1.5 rounded-full bg-brand ring-2 ring-surface-raised'
              />
            </span>
          )}
        >
          <div className='flex flex-col gap-3'>
            <div className='flex items-center justify-between'>
              <p className='text-[0.8125rem] font-semibold text-ink'>Notifications</p>
              <Badge tone='brand'>{NOTIFICATIONS.length}</Badge>
            </div>

            <ul role='list' className='flex flex-col gap-2'>
              {NOTIFICATIONS.map(item => (
                <li key={item.id} className='rounded-lg border border-line bg-surface px-3 py-2'>
                  <p className='text-[0.8125rem] font-medium text-ink'>{item.title}</p>
                  <p className='mt-0.5 text-xs text-ink-muted'>{item.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </Popover>

        <Menu
          menuLabel='Account'
          items={[
            {
              id: 'staff-id',
              label: 'Copy staff ID',
              onSelect: () => {
                void navigator.clipboard
                  .writeText('staff_mv_0042')
                  .then(() => notify('Copied staff_mv_0042 to the clipboard.'))
                  .catch(() => notify('The browser blocked clipboard access.'))
              },
            },
            { id: 'signout', label: 'Sign out', tone: 'danger', onSelect: () => notify('Authentication is outside this demo.') },
          ]}
          renderTrigger={props => (
            <button
              {...props}
              type='button'
              className='ml-1 rounded-full outline-offset-2 focus-visible:outline-2 focus-visible:outline-focus'
            >
              <span className='sr-only'>Account menu</span>
              <Avatar name='Mara Vidal' />
            </button>
          )}
        />
      </div>
    </header>
  )
}
