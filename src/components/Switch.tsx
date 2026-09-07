import { useId } from 'react'
import { cn } from 'utils'

export type SwitchProps = {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
  description?: string
  className?: string
}

/* A real checkbox input, visually replaced. `role='switch'` on a native checkbox keeps
   the whole keyboard and form story for free (Space toggles, label click works, it
   participates in focus order) while reading as a switch to assistive tech. A div with
   handlers would mean re-implementing all of that. */
export const Switch = ({ checked, onChange, label, description, className }: SwitchProps) => {
  const id = useId()

  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <span className='flex min-w-0 flex-col'>
        <label htmlFor={id} className='cursor-pointer text-[0.8125rem] font-medium text-ink'>
          {label}
        </label>
        {description && <span className='text-xs text-ink-subtle'>{description}</span>}
      </span>

      <span className='relative inline-flex shrink-0'>
        <input
          id={id}
          type='checkbox'
          role='switch'
          checked={checked}
          onChange={event => onChange(event.currentTarget.checked)}
          className='peer size-full absolute inset-0 cursor-pointer opacity-0'
        />
        <span
          aria-hidden='true'
          className={cn(
            'pointer-events-none flex h-5 w-9 items-center rounded-full p-0.5 transition-colors duration-150',
            'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus',
            checked ? 'bg-brand' : 'bg-surface-sunken',
          )}
        >
          <span
            className={cn('size-4 rounded-full bg-surface-raised shadow-sm transition-transform duration-150', checked && 'translate-x-4')}
          />
        </span>
      </span>
    </div>
  )
}
