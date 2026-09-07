import { AlertSVG, RefreshSVG } from 'icons'
import { Button, Skeleton } from '../../index'

export type RowDetailLoadingProps = { rows?: number }

const DEFAULT_LOADING_ROWS = 3

/* Default renderers for the three non-success detail states. A caller can replace any
   of them through `renderLoading` / `renderError` / `renderEmpty`, but the defaults are
   complete enough that a caller who supplies none still gets a real experience. */

export const RowDetailLoading = ({ rows = DEFAULT_LOADING_ROWS }: RowDetailLoadingProps) => (
  <div className='flex flex-col gap-2.5 px-4 py-3.5'>
    {/* A skeleton shaped like the content, not a spinner: it holds the eventual layout,
        so the region does not jump when the real rows land mid-transition. */}
    {Array.from({ length: rows }, (_, index) => (
      <div key={index} className='flex items-center gap-3'>
        <Skeleton className='size-7 shrink-0 rounded-full' />
        <Skeleton width='30%' />
        <Skeleton width='18%' />
        <Skeleton width='14%' className='ml-auto' />
      </div>
    ))}
  </div>
)

export type RowDetailErrorProps = { message: string; onRetry: () => void }

export const RowDetailError = ({ message, onRetry }: RowDetailErrorProps) => (
  /* `role='alert'` because it is actionable and appears after a user gesture. Scoped to
     the row: a failed child fetch never takes down the parent table. */
  <div role='alert' className='flex flex-wrap items-center gap-3 px-4 py-3.5'>
    <AlertSVG aria-hidden='true' className='size-4 shrink-0 text-danger' />
    <p className='text-[0.8125rem] text-ink'>{message}</p>
    <Button tone='outline' size='sm' icon={<RefreshSVG />} onClick={onRetry} className='ml-auto'>
      Try again
    </Button>
  </div>
)

export type RowDetailEmptyProps = { message: string }

export const RowDetailEmpty = ({ message }: RowDetailEmptyProps) => (
  /* An empty child list is a SUCCESS, never an error and never a permanent spinner. */
  <p className='px-4 py-3.5 text-[0.8125rem] text-ink-subtle'>{message}</p>
)
