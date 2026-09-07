import type { ReactNode } from 'react'
import { cn } from 'utils'

export type CardProps = {
  children: ReactNode
  className?: string
  /** Removes the padding, for a card whose child owns its own edges (a table). */
  flush?: boolean
}

export const Card = ({ children, className, flush }: CardProps) => (
  <section className={cn('rounded-xl border border-line bg-surface-raised', !flush && 'p-5', className)}>{children}</section>
)

export type CardHeaderProps = {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  className?: string
}

export const CardHeader = ({ title, description, actions, className }: CardHeaderProps) => (
  <header className={cn('flex flex-wrap items-start justify-between gap-4 border-b border-line px-5 py-4', className)}>
    <div className='flex min-w-0 flex-col gap-1'>
      <h2 className='text-[0.9375rem] font-semibold text-ink'>{title}</h2>
      {description && <p className='text-[0.8125rem] text-ink-muted'>{description}</p>}
    </div>
    {actions && <div className='flex shrink-0 items-center gap-2'>{actions}</div>}
  </header>
)
