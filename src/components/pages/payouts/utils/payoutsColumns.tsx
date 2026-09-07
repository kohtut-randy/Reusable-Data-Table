import type { ReactNode } from 'react'
import { Avatar, Badge, TruncatedText } from 'components'
import { createColumnHelper } from 'components/DataTable'
import type { DataTableColumn } from 'components/DataTable'
import { formatCurrency, formatDate, formatDateRange } from 'utils'
import { PAYOUTS_COLUMN_ID, PAYOUTS_COLUMN_WIDTH } from '../constants'
import type { PayoutDTO, PayoutStatus } from '../payouts.types'

/* The second dataset, deliberately a different shape rather than another list of
   strings: currency in minor units, right-aligned numerics, a date range and a nullable
   date, an identity cell, and a right-sticky total that exercises the mirrored scroll
   shadow.

   Note what is absent next to timetableColumns: no `sortValue`, no `sortFn`. This table
   runs in server mode, so the columns only name the sort key to send. */

const STATUS_TONE: Readonly<Record<PayoutStatus, 'success' | 'info' | 'warning' | 'danger'>> = {
  paid: 'success',
  processing: 'info',
  pending: 'warning',
  failed: 'danger',
}

const STATUS_LABEL: Readonly<Record<PayoutStatus, string>> = {
  paid: 'Paid',
  processing: 'Processing',
  pending: 'Pending',
  failed: 'Failed',
}

const TIER_LABEL: Readonly<Record<PayoutDTO['instructor']['tier'], string>> = {
  coach: 'Coach',
  senior: 'Senior coach',
  lead: 'Lead coach',
}

const column = createColumnHelper<PayoutDTO>()

/* Written out rather than shown as a dash glyph: "Not paid" is unambiguous to a
   screen reader, where a bare dash is announced as punctuation or skipped entirely. */
const NOT_PAID_LABEL = 'Not paid'

export type CreatePayoutsColumnsOptions = {
  readonly renderActions: (row: PayoutDTO) => ReactNode
}

export const createPayoutsColumns = ({ renderActions }: CreatePayoutsColumnsOptions): readonly DataTableColumn<PayoutDTO>[] => [
  column({
    field: 'instructor',
    id: PAYOUTS_COLUMN_ID.instructor,
    headerName: 'Instructor',
    sortable: true,
    minWidth: PAYOUTS_COLUMN_WIDTH.instructor,
    sticky: 'left',
    isRowHeader: true,
    renderCell: row => (
      <span className='flex min-w-0 items-center gap-2.5'>
        <Avatar name={row.instructor.name} size='md' />
        <span className='flex min-w-0 flex-col'>
          <TruncatedText className='font-medium text-ink'>{row.instructor.name}</TruncatedText>
          <span className='truncate text-xs text-ink-subtle'>{TIER_LABEL[row.instructor.tier]}</span>
        </span>
      </span>
    ),
  }),

  column({
    field: 'reference',
    id: PAYOUTS_COLUMN_ID.reference,
    headerName: 'Reference',
    sortable: true,
    minWidth: '140px',
    flex: 0.8,
    renderCell: row => <TruncatedText className='font-mono text-xs text-ink'>{row.reference}</TruncatedText>,
  }),

  column({
    field: 'periodStart',
    id: PAYOUTS_COLUMN_ID.period,
    headerName: 'Pay period',
    sortable: true,
    minWidth: '200px',
    flex: 1.3,
    renderCell: row => <TruncatedText>{formatDateRange(row.periodStart, row.periodEnd)}</TruncatedText>,
  }),

  column({
    field: 'sessionCount',
    id: PAYOUTS_COLUMN_ID.sessions,
    headerName: 'Sessions',
    sortable: true,
    minWidth: '100px',
    flex: 0.6,
    align: 'end',
    renderCell: row => <span className='[font-variant-numeric:tabular-nums]'>{row.sessionCount}</span>,
  }),

  column({
    field: 'grossMinor',
    id: PAYOUTS_COLUMN_ID.gross,
    headerName: 'Gross',
    sortable: true,
    minWidth: '130px',
    flex: 0.8,
    align: 'end',
    renderCell: row => <span className='[font-variant-numeric:tabular-nums]'>{formatCurrency(row.grossMinor, row.currency)}</span>,
  }),

  column({
    field: 'feesMinor',
    id: PAYOUTS_COLUMN_ID.fees,
    headerName: 'Fees',
    sortable: true,
    minWidth: '130px',
    flex: 0.8,
    align: 'end',
    renderCell: row => (
      <span className='[font-variant-numeric:tabular-nums] text-danger'>-{formatCurrency(row.feesMinor, row.currency)}</span>
    ),
  }),

  column({
    field: 'status',
    id: PAYOUTS_COLUMN_ID.status,
    headerName: 'Status',
    sortable: true,
    minWidth: '130px',
    flex: 0.8,
    renderCell: row => (
      <Badge tone={STATUS_TONE[row.status]} dot>
        {STATUS_LABEL[row.status]}
      </Badge>
    ),
  }),

  column({
    field: 'paidAt',
    id: PAYOUTS_COLUMN_ID.paid,
    headerName: 'Paid',
    sortable: true,
    minWidth: '140px',
    flex: 0.9,
    /* Null while unpaid. Nulls sort last in both directions, so descending shows the
       most recent payment first rather than forty pending rows. */
    renderCell: row => (
      <TruncatedText className='[font-variant-numeric:tabular-nums]'>
        {row.paidAt === null ? <span className='text-ink-subtle'>{NOT_PAID_LABEL}</span> : formatDate(row.paidAt)}
      </TruncatedText>
    ),
  }),

  column({
    field: 'netMinor',
    id: PAYOUTS_COLUMN_ID.net,
    headerName: 'Net',
    sortable: true,
    minWidth: PAYOUTS_COLUMN_WIDTH.net,
    /* Right-sticky: Net is the number a manager scans for, so it stays visible while the
       wide middle scrolls under it. It has to sit at the end of the column order, or the
       non-sticky columns to its right would scroll underneath it. */
    sticky: 'right',
    align: 'end',
    renderCell: row => (
      <span className='font-semibold [font-variant-numeric:tabular-nums] text-ink'>{formatCurrency(row.netMinor, row.currency)}</span>
    ),
  }),

  column({
    field: 'id',
    id: 'actions',
    headerName: '',
    headerLabel: 'Actions',
    minWidth: '56px',
    /* Also right-sticky, necessarily: everything after a right-sticky column must be
       sticky too, or it slides under. The suffix sums put Actions at 0 and Net at 56. */
    sticky: 'right',
    align: 'center',
    renderCell: renderActions,
  }),
]
