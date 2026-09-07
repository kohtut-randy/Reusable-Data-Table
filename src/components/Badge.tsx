import type { ReactNode } from 'react'
import { cn } from 'utils'

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'accent'

export type BadgeProps = {
  children: ReactNode
  tone?: BadgeTone
  /** A small leading dot, for status badges where colour alone would carry meaning. */
  dot?: boolean
  className?: string
}

/* Tones use `color-mix` against the semantic token rather than a hardcoded tint, so a
   badge survives the token being re-pointed by a theme.

   The 45% text mix is measured, not chosen by eye: at 78% every tone failed WCAG AA
   against the badge's own 16% tint (worst 2.64:1). At 45% the worst tone is 5.96:1. */
const TONE_CLASS: Record<BadgeTone, string> = {
  neutral: 'bg-surface-sunken text-ink-muted',
  brand: 'bg-[color-mix(in_oklab,var(--brand)_16%,transparent)] text-[color-mix(in_oklab,var(--brand)_45%,var(--ink))]',
  success: 'bg-[color-mix(in_oklab,var(--success)_16%,transparent)] text-[color-mix(in_oklab,var(--success)_45%,var(--ink))]',
  warning: 'bg-[color-mix(in_oklab,var(--warning)_16%,transparent)] text-[color-mix(in_oklab,var(--warning)_45%,var(--ink))]',
  danger: 'bg-[color-mix(in_oklab,var(--danger)_16%,transparent)] text-[color-mix(in_oklab,var(--danger)_45%,var(--ink))]',
  info: 'bg-[color-mix(in_oklab,var(--info)_16%,transparent)] text-[color-mix(in_oklab,var(--info)_45%,var(--ink))]',
  accent: 'bg-[color-mix(in_oklab,var(--accent)_16%,transparent)] text-[color-mix(in_oklab,var(--accent)_45%,var(--ink))]',
}

const DOT_CLASS: Record<BadgeTone, string> = {
  neutral: 'bg-ink-subtle',
  brand: 'bg-brand',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
  accent: 'bg-accent',
}

export const Badge = ({ children, tone = 'neutral', dot, className }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap',
      TONE_CLASS[tone],
      className,
    )}
  >
    {dot && <span aria-hidden='true' className={cn('size-1.5 shrink-0 rounded-full', DOT_CLASS[tone])} />}
    {children}
  </span>
)
