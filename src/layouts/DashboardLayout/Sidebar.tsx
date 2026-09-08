import { SidebarNav } from './SidebarNav'
import { Badge, Menu, useToast } from 'components'
import { ChevronDownSVG } from 'icons'

export type SidebarProps = { currentPath: string; onNavigate?: () => void }

const NO_OP = (): void => {}

const GYMS = [{ id: 'bristol', label: 'DT Bristol', zones: 'Six zones' }]

export const Sidebar = ({ currentPath, onNavigate = NO_OP }: SidebarProps) => {
  const notify = useToast()

  return (
    <div className='flex h-full flex-col gap-6 py-5'>
      <div className='flex items-center gap-2.5 px-6'>
        <span aria-hidden='true' className='grid size-8 shrink-0 place-items-center rounded-lg bg-surface-inverse'>
          <img src='/dynamic-table.svg' alt='Dynamic Table' className='size-8' />
        </span>
        <span className='font-display text-lg font-extrabold tracking-[-0.03em] text-ink'>DT</span>
        <Badge tone='neutral' className='ml-auto'>
          Staff
        </Badge>
      </div>

      <div className='px-6'>
        {/* A real menu. It was a disabled button, which looks like a broken control
            rather than a scoped one. The seeded dataset only covers one gym, so picking
            the other says so plainly instead of silently doing nothing. */}
        <Menu
          menuLabel='Select a gym'
          align='start'
          items={GYMS.map(gym => ({
            id: gym.id,
            label: gym.label,
            disabled: gym.id === 'bristol',
            onSelect: () => notify(`${gym.label} has no seeded data in this demo.`),
          }))}
          renderTrigger={props => (
            <button
              {...props}
              type='button'
              className='flex w-full items-center justify-between gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-left text-[0.8125rem] text-ink transition-colors duration-150 hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus'
            >
              <span className='flex min-w-0 flex-col'>
                <span className='truncate font-medium'>DTBristol</span>
                <span className='truncate text-xs text-ink-subtle'>Six zones</span>
              </span>
              <ChevronDownSVG aria-hidden='true' className='size-4 shrink-0 text-ink-subtle' />
            </button>
          )}
        />
      </div>

      <SidebarNav currentPath={currentPath} onNavigate={onNavigate} />

      <div className='mt-auto px-6 text-xs text-ink-subtle'>
        <p>Demo build. All data is seeded and local.</p>
      </div>
    </div>
  )
}
