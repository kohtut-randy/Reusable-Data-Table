import { useId } from 'react'
import { ChevronLeftSVG, ChevronRightSVG, ChevronsLeftSVG, ChevronsRightSVG } from 'icons'
import { IconButton } from '../../IconButton'

export type TablePaginationProps = {
  pageIndex: number
  pageSize: number
  pageCount: number
  total: number
  from: number
  to: number
  pageSizeOptions: readonly number[]
  noun: string
  onPageIndexChange: (next: number) => void
  onPageSizeChange: (next: number) => void
}

/* `pageIndex` is 0-based internally and 1-BASED here. This component is one of the two
   edges where the conversion happens (the other is the URL), and it is the only place
   `+ 1` should appear. */
export const TablePagination = ({
  pageIndex,
  pageSize,
  pageCount,
  total,
  from,
  to,
  pageSizeOptions,
  noun,
  onPageIndexChange,
  onPageSizeChange,
}: TablePaginationProps) => {
  const selectId = useId()
  const isFirst = pageIndex <= 0
  const isLast = pageIndex >= pageCount - 1

  /* A page size that arrived from a URL but is not in the list is rendered as an extra
     option rather than silently snapped, so a deep link does not break the Select or
     lose the user's setting. */
  const options = pageSizeOptions.includes(pageSize) ? pageSizeOptions : [...pageSizeOptions, pageSize].sort((a, b) => a - b)

  return (
    <nav aria-label='Pagination' className='flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3'>
      <p className='text-xs text-ink-muted [font-variant-numeric:tabular-nums]'>
        {total === 0 ? `No ${noun}` : `Showing ${from} to ${to} of ${total} ${noun}`}
      </p>

      <div className='flex flex-wrap items-center gap-4'>
        <div className='flex items-center gap-2'>
          <label htmlFor={selectId} className='text-xs text-ink-muted'>
            Rows
          </label>
          {/* A native <select> with a real <label>. Zero dependencies, and it beats any
              custom listbox on keyboard behaviour, mobile pickers and screen readers. */}
          <select
            id={selectId}
            value={pageSize}
            onChange={event => onPageSizeChange(Number(event.currentTarget.value))}
            className='h-8 rounded-lg border border-line bg-surface-raised px-2 text-xs text-ink outline-offset-2 focus-visible:outline-2 focus-visible:outline-focus'
          >
            {options.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className='flex items-center gap-1'>
          <IconButton label='First page' icon={<ChevronsLeftSVG />} size='sm' disabled={isFirst} onClick={() => onPageIndexChange(0)} />
          <IconButton
            label='Previous page'
            icon={<ChevronLeftSVG />}
            size='sm'
            disabled={isFirst}
            onClick={() => onPageIndexChange(pageIndex - 1)}
          />

          {/* aria-current='page' names the live position, which is what a screen reader
              needs; the visible text carries it for everyone else. */}
          <span aria-current='page' className='px-2 text-xs text-ink [font-variant-numeric:tabular-nums]'>
            Page {pageIndex + 1} of {pageCount}
          </span>

          <IconButton
            label='Next page'
            icon={<ChevronRightSVG />}
            size='sm'
            disabled={isLast}
            onClick={() => onPageIndexChange(pageIndex + 1)}
          />
          <IconButton
            label='Last page'
            icon={<ChevronsRightSVG />}
            size='sm'
            disabled={isLast}
            onClick={() => onPageIndexChange(pageCount - 1)}
          />
        </div>
      </div>
    </nav>
  )
}
