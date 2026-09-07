import { cn } from 'utils'
import { initialsOf } from 'utils'

export type AvatarProps = {
  name: string
  size?: 'sm' | 'md'
  className?: string
}

/* Initials only, no image. That is deliberate rather than a shortcut: the dataset is
   seeded mock data, so an avatar URL would either 404 or add a per-row network request
   to a table whose whole point is render performance. Initials are deterministic,
   free, and never break the row's height. */
export const Avatar = ({ name, size = 'sm', className }: AvatarProps) => (
  <span
    aria-hidden='true'
    className={cn(
      'inline-grid shrink-0 place-items-center rounded-full bg-surface-sunken font-medium text-ink-muted select-none',
      size === 'sm' ? 'size-7 text-[0.6875rem]' : 'size-9 text-xs',
      className,
    )}
  >
    {initialsOf(name)}
  </span>
)
