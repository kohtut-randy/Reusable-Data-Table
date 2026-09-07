import { ChevronRightSVG } from 'icons'
import { cn } from 'utils'

export type ExpandToggleProps = {
  expanded: boolean
  /** Full sentence, built from the caller's `getRowLabel`, so it names the row. */
  label: string
  controls: string
  onToggle: () => void
  disabled?: boolean
}

export const ExpandToggle = ({ expanded, label, controls, onToggle, disabled }: ExpandToggleProps) => (
  <button
    type='button'
    onClick={onToggle}
    disabled={disabled}
    aria-expanded={expanded}
    aria-controls={controls}
    className='dt-focus-ring grid size-7 cursor-pointer place-items-center rounded-md text-ink-subtle transition-colors duration-100 hover:bg-surface-sunken hover:text-ink disabled:pointer-events-none disabled:opacity-30'
  >
    <span className='sr-only'>{label}</span>
    {/* Rotation only: a transform, so it composites and never affects layout. The curve
        matches the row's opening ease, so the chevron and the row settle together. */}
    <ChevronRightSVG
      aria-hidden='true'
      className={cn(
        'size-4 transition-transform duration-200 ease-[cubic-bezier(0.22,0.61,0.36,1)] motion-reduce:transition-none',
        expanded && 'rotate-90',
      )}
    />
  </button>
)
