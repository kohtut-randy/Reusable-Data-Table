import { useMemo } from 'react'
import { DataTable, createColumnHelper } from 'components/DataTable'
import type { DataTableColumn } from 'components/DataTable'
import { TruncatedText } from 'components'
import { formatCurrency, formatDate } from 'utils'
import { PAYOUTS_SESSIONS_CAPTION } from '../constants'
import type { PayoutSessionDTO } from '../payouts.types'

export type PayoutSessionsTableProps = {
  sessions: readonly PayoutSessionDTO[]
  currency: string
}

/* A DataTable nested inside an expanded row of a DataTable: different columns, a
   different row type, its own client-side sort, footer off.

   `pageMode: 'none'` because a payout has at most fourteen sessions, so a pager would be
   chrome around nothing. `.dt-detail-inner` carries `contain: layout paint style`, so
   this table's layout cannot invalidate its parent's. */
const column = createColumnHelper<PayoutSessionDTO>()

const createSessionColumns = (currency: string): readonly DataTableColumn<PayoutSessionDTO>[] => [
  column({
    field: 'className',
    headerName: 'Class',
    sortable: true,
    minWidth: '200px',
    flex: 1.6,
    isRowHeader: true,
    renderCell: row => <TruncatedText className='font-medium text-ink'>{row.className}</TruncatedText>,
  }),
  column({
    field: 'heldAt',
    headerName: 'Held',
    sortable: true,
    minWidth: '130px',
    // Sorts the instant, displays the studio-zone date.
    sortValue: row => Date.parse(row.heldAt),
    renderCell: row => <TruncatedText>{formatDate(row.heldAt)}</TruncatedText>,
  }),
  column({
    field: 'attendees',
    headerName: 'Attendees',
    sortable: true,
    minWidth: '110px',
    flex: 0.6,
    align: 'end',
    renderCell: row => <span className='[font-variant-numeric:tabular-nums]'>{row.attendees}</span>,
  }),
  column({
    field: 'earnedMinor',
    headerName: 'Earned',
    sortable: true,
    minWidth: '130px',
    flex: 0.7,
    align: 'end',
    renderCell: row => (
      <span className='font-medium [font-variant-numeric:tabular-nums] text-ink'>{formatCurrency(row.earnedMinor, currency)}</span>
    ),
  }),
]

export const PayoutSessionsTable = ({ sessions, currency }: PayoutSessionsTableProps) => {
  const columns = useMemo(() => createSessionColumns(currency), [currency])

  return (
    <div className='px-4 py-3.5'>
      <DataTable<PayoutSessionDTO>
        caption={PAYOUTS_SESSIONS_CAPTION}
        rowNoun='sessions'
        columns={columns}
        data={sessions}
        getRowId={row => row.id}
        density='compact'
        // No pager: at most fourteen sessions per payout.
        pageMode='none'
        stickyHeader={false}
        className='overflow-hidden rounded-lg border border-line bg-surface-raised'
      />
    </div>
  )
}
