import { AlertSVG, RefreshSVG } from 'icons'
import { Button } from '../../Button'

export type TableErrorStateProps = {
  columnCount: number
  error: Error
  onRetry?: (() => void) | undefined
}

const FALLBACK_MESSAGE = 'Something went wrong loading this table.'

export const TableErrorState = ({ columnCount, error, onRetry }: TableErrorStateProps) => (
  <tr>
    <td colSpan={columnCount} className='px-4 py-14'>
      {/* `role='alert'` here, unlike the sr-only live region, because this panel is
          actionable: it owns the Retry control. */}
      <div role='alert' className='flex flex-col items-center gap-3 text-center'>
        <span className='grid size-10 place-items-center rounded-full bg-[color-mix(in_oklab,var(--danger)_14%,transparent)]'>
          <AlertSVG aria-hidden='true' className='size-5 text-danger' />
        </span>
        <p className='text-sm font-medium text-ink'>Could not load this table</p>
        <p className='max-w-[46ch] text-[0.8125rem] text-ink-muted'>{error.message || FALLBACK_MESSAGE}</p>
        {onRetry && (
          <Button tone='outline' size='sm' icon={<RefreshSVG />} onClick={onRetry} className='mt-1'>
            Try again
          </Button>
        )}
      </div>
    </td>
  </tr>
)
