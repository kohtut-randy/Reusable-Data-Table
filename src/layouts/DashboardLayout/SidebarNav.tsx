import Link from 'next/link'
import { NAV_ITEMS } from './navItems'
import { cn } from 'utils'

export type SidebarNavProps = {
  /** Current route, so the active item is decided by the caller, not by reading state here. */
  currentPath: string
  /** Called after a nav click, so the mobile sheet can close itself. */
  onNavigate?: () => void
}

/* Defaulted to a no-op rather than passed through as possibly-undefined:
   `exactOptionalPropertyTypes` correctly rejects handing an explicit `undefined` to a
   prop whose type does not include it. */
const NO_OP = (): void => {}

const isActive = (currentPath: string, href: string): boolean => (href === '/' ? currentPath === '/' : currentPath.startsWith(href))

export const SidebarNav = ({ currentPath, onNavigate = NO_OP }: SidebarNavProps) => (
  <nav aria-label='Main' className='flex flex-col gap-0.5 px-3'>
    {NAV_ITEMS.map(item => {
      const Icon = item.icon
      const active = isActive(currentPath, item.href)

      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          aria-current={active ? 'page' : undefined}
          className={cn(
            'flex items-center gap-2.5 rounded-lg px-3 py-2 text-[0.8125rem] font-medium transition-colors duration-150',
            active ? 'bg-surface-sunken text-ink' : 'text-ink-muted hover:bg-surface-hover hover:text-ink',
          )}
        >
          <Icon className='size-4 shrink-0' />
          {item.label}
        </Link>
      )
    })}
  </nav>
)
