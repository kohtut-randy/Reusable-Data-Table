import { useState } from 'react'
import { useRouter } from 'next/router'
import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { IconButton, Sheet, ToastProvider } from 'components'
import { CloseSVG } from 'icons'

export type DashboardLayoutProps = { children: ReactNode }

const BREADCRUMB_BY_PATH: Record<string, string> = {
  '/': 'Timetable',
  '/payouts': 'Payouts',
  '/members': 'Members',
  '/demo': 'Component demo',
}

/* The shell, applied once in _app.tsx so no page composes it. Two structural choices:

   1. The main region owns its own scroll, so the sidebar never scrolls away on a long
      table the way it would if the document scrolled.
   2. Below `lg` the sidebar is the same `Sidebar` component inside a `<dialog>` sheet,
      so there is no second mobile nav implementation to keep in step. */
export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const router = useRouter()
  const [navOpen, setNavOpen] = useState(false)
  const breadcrumb = BREADCRUMB_BY_PATH[router.pathname] ?? 'Dashboard'

  return (
    <ToastProvider>
      <div className='flex h-dvh overflow-hidden bg-surface'>
        <aside className='hidden w-60 shrink-0 border-r border-line bg-surface-raised lg:block'>
          <Sidebar currentPath={router.pathname} />
        </aside>

        <Sheet open={navOpen} onClose={() => setNavOpen(false)} label='Navigation'>
          <div className='flex items-center justify-end px-3 pt-3'>
            <IconButton label='Close navigation' icon={<CloseSVG />} size='sm' onClick={() => setNavOpen(false)} />
          </div>
          <Sidebar currentPath={router.pathname} onNavigate={() => setNavOpen(false)} />
        </Sheet>

        <div className='flex min-w-0 flex-1 flex-col'>
          <Topbar breadcrumb={breadcrumb} onOpenNav={() => setNavOpen(true)} />

          <main id='main' className='flex-1 overflow-y-auto'>
            <div className='mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-6 lg:px-8 lg:py-8'>{children}</div>
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
