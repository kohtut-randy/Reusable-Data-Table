import { memo } from 'react'
import type { ExpandConfig, RowDetail as RowDetailState, RowId } from '../DataTable.types'
import { RowDetailEmpty, RowDetailError, RowDetailLoading } from './RowDetailStates'

export type RowDetailProps<T, C> = {
  row: T
  rowId: RowId
  detail: RowDetailState<C>
  config: ExpandConfig<T, C>
  detailId: string
  rowHeaderId: string
  columnCount: number
  isExpanded: boolean
  hasMounted: boolean
  onCollapse: (rowId: RowId) => void
  onRetry: (rowId: RowId, row: T) => void
}

const DEFAULT_EMPTY_MESSAGE = 'Nothing to show here yet.'
const DEFAULT_ERROR_MESSAGE = 'Could not load this row.'

const renderState = <T, C>(props: RowDetailProps<T, C>) => {
  const { detail, config, row, rowId, onCollapse, onRetry } = props

  /* ONE state machine, and it has no idea whether the mode is inline or lazy. Inline
     resolves synchronously into `success`, so both modes converge here. That is what
     `RowDetail` being the unifying seam actually buys. */
  switch (detail.status) {
    case 'idle':
      return null

    case 'loading':
      return config.mode === 'lazy' && config.renderLoading ? config.renderLoading({ row }) : <RowDetailLoading />

    case 'error': {
      const retry = () => onRetry(rowId, row)
      if (config.mode === 'lazy' && config.renderError) return config.renderError({ row, error: detail.error, retry })
      return <RowDetailError message={detail.error.message || DEFAULT_ERROR_MESSAGE} onRetry={retry} />
    }

    case 'success':
      if (detail.data.length === 0)
        return config.renderEmpty ? config.renderEmpty({ row }) : <RowDetailEmpty message={DEFAULT_EMPTY_MESSAGE} />

      return config.renderContent({ row, rowId, children: detail.data, collapse: () => onCollapse(rowId) })

    default:
      return null
  }
}

const RowDetailInner = <T, C>(props: RowDetailProps<T, C>) => {
  const { detailId, rowHeaderId, columnCount, isExpanded, hasMounted, detail, config, row } = props
  const isEmpty =
    config.mode === 'inline' ? (config.getChildren(row)?.length ?? 0) === 0 : detail.status === 'success' && detail.data.length === 0

  return (
    /* The animation shell is always mounted and only the CHILDREN are lazy, which is what
       makes the first expand animate like every later one. A node inserted into the DOM
       already matching the open selector has no previous value to interpolate from, so
       gating the animated element itself on `hasMounted` would skip its transition
       exactly once, on first expand. Mounting the empty region also gives the toggle's
       `aria-controls` a real target before it is ever opened. Cost is five nodes per
       visible row, four of them empty until first use. */
    <tr className='dt-detail-row' aria-hidden={!isExpanded || undefined}>
      <td colSpan={columnCount} className='dt-detail-cell'>
        <div className='dt-detail-grid' data-state={isExpanded ? 'open' : 'closed'} data-empty={isEmpty || undefined}>
          {/* `inert` keeps a zero-height, overflow-hidden region out of the tab order
              and out of the accessibility tree, so Tab does not stop inside a
              collapsed row. */}
          <div className='dt-detail-inner' inert={!isExpanded}>
            <div
              role='region'
              id={detailId}
              aria-labelledby={rowHeaderId}
              aria-busy={detail.status === 'loading'}
              className='dt-detail-content'
            >
              {hasMounted && renderState(props)}
            </div>
          </div>
        </div>
      </td>
    </tr>
  )
}

/* Memoised on the detail state, so expanding row 7 does not re-render row 3's cached,
   still-mounted detail content. */
export const RowDetail = memo(RowDetailInner) as typeof RowDetailInner
