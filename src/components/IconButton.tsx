import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from 'utils'

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Required: an icon-only control has no text to name it. */
  label: string
  icon: ReactNode
  size?: 'sm' | 'md'
  tone?: 'ghost' | 'outline'
}

/* `label` is a required prop rather than an optional `aria-label`, so an unnamed
   icon-only button is a compile error instead of an audit finding. */
export const IconButton = ({ label, icon, size = 'md', tone = 'ghost', className, type = 'button', ...rest }: IconButtonProps) => (
  <button
    type={type}
    aria-label={label}
    title={label}
    className={cn(
      'inline-grid shrink-0 place-items-center rounded-lg text-ink-muted transition-colors duration-150',
      'outline-offset-2 hover:bg-surface-hover hover:text-ink focus-visible:outline-2 focus-visible:outline-focus',
      'disabled:pointer-events-none disabled:opacity-40',
      size === 'sm' ? 'size-8 [&>svg]:size-4' : 'size-10 [&>svg]:size-[1.125rem]',
      tone === 'outline' && 'border border-line-strong bg-surface-raised',
      className,
    )}
    {...rest}
  >
    {icon}
  </button>
)
