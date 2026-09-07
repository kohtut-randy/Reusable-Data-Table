import type { ReactNode } from 'react'

export type PageHeaderProps = {
  title: string
  description?: string
  actions?: ReactNode
}

export const PageHeader = ({ title, description, actions }: PageHeaderProps) => (
  <div className='flex flex-wrap items-start justify-between gap-4'>
    <div className='flex min-w-0 flex-col gap-1'>
      <h1 className='text-xl font-semibold tracking-[-0.01em] text-ink'>{title}</h1>
      {description && <p className='max-w-[62ch] text-[0.8125rem] text-ink-muted'>{description}</p>}
    </div>
    {/* Full width on a phone so the actions get their own row and wrap inside it.
        `shrink-0` on a narrow viewport pushed the button past the right edge. */}
    {actions && <div className='flex w-full flex-wrap items-center gap-2 sm:w-auto sm:shrink-0'>{actions}</div>}
  </div>
)
