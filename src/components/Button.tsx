import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from 'utils'

export type ButtonTone = 'brand' | 'neutral' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: ButtonTone
  size?: ButtonSize
  /** Leading icon. Sized by the button, so pass a bare icon component. */
  icon?: ReactNode
  fullWidth?: boolean
}

/* Hand-rolled with a lookup rather than `cva`, which the landing-page repo uses. The
   difference is honest: there the primitive had two combining variant axes, here tone
   and size do not interact, so two flat maps are simpler than a dependency. */

const TONE_CLASS: Record<ButtonTone, string> = {
  brand: 'bg-brand text-brand-ink hover:bg-brand-hover',
  neutral: 'bg-surface-inverse text-ink-inverse hover:opacity-90',
  outline: 'border border-line-strong bg-surface-raised text-ink hover:bg-surface-hover',
  ghost: 'text-ink-muted hover:bg-surface-hover hover:text-ink',
  danger: 'bg-danger text-chalk-50 hover:opacity-90',
}

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 px-3 text-[0.8125rem]',
  md: 'h-10 gap-2 px-4 text-sm',
}

export const Button = ({ tone = 'brand', size = 'md', icon, fullWidth, className, type = 'button', children, ...rest }: ButtonProps) => (
  <button
    type={type}
    className={cn(
      'inline-flex shrink-0 items-center justify-center rounded-lg font-medium whitespace-nowrap',
      'transition-colors duration-150 outline-offset-2 focus-visible:outline-2 focus-visible:outline-focus',
      'disabled:pointer-events-none disabled:opacity-50',
      SIZE_CLASS[size],
      TONE_CLASS[tone],
      fullWidth && 'w-full',
      className,
    )}
    {...rest}
  >
    {icon && <span className='grid size-4 shrink-0 place-items-center [&>svg]:size-4'>{icon}</span>}
    {children}
  </button>
)
