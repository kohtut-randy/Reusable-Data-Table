import type { ReactNode } from 'react'
import { Avatar, Badge, TruncatedText } from 'components'
import { createColumnHelper } from 'components/DataTable'
import type { DataTableColumn } from 'components/DataTable'
import { formatDate, formatNumber } from 'utils'
import { MEMBERS_COLUMN_ID, MEMBERS_COLUMN_WIDTH } from '../constants'
import type { MemberDTO, MemberStatus, MemberTier } from '../members.types'

/* The third dataset and a third configuration: server sort, server pagination, and no
   expansion at all, which is the case where the toggle column, the detail row and the
   async machine have to disappear cleanly rather than render empty scaffolding. */

const STATUS_TONE: Readonly<Record<MemberStatus, 'success' | 'warning' | 'danger'>> = {
  active: 'success',
  paused: 'warning',
  expired: 'danger',
}

const STATUS_LABEL: Readonly<Record<MemberStatus, string>> = {
  active: 'Active',
  paused: 'Paused',
  expired: 'Expired',
}

const TIER_LABEL: Readonly<Record<MemberTier, string>> = {
  casual: 'Casual',
  monthly: 'Monthly',
  annual: 'Annual',
  student: 'Student',
}

/* Written out rather than shown as a dash glyph: a screen reader announces a bare dash
   as punctuation or skips it entirely. */
const NEVER_VISITED = 'Never'
const NO_GRADE = 'Not logged'

const column = createColumnHelper<MemberDTO>()

export type CreateMembersColumnsOptions = {
  readonly renderActions: (row: MemberDTO) => ReactNode
}

export const createMembersColumns = ({ renderActions }: CreateMembersColumnsOptions): readonly DataTableColumn<MemberDTO>[] => [
  column({
    field: 'name',
    id: MEMBERS_COLUMN_ID.name,
    headerName: 'Member',
    sortable: true,
    minWidth: MEMBERS_COLUMN_WIDTH.name,
    sticky: 'left',
    isRowHeader: true,
    renderCell: row => (
      <span className='flex min-w-0 items-center gap-2.5'>
        <Avatar name={row.name} size='md' />
        <span className='flex min-w-0 flex-col'>
          <TruncatedText className='font-medium text-ink'>{row.name}</TruncatedText>
          <span className='truncate font-mono text-xs text-ink-subtle'>{row.reference}</span>
        </span>
      </span>
    ),
  }),

  column({
    field: 'tier',
    id: MEMBERS_COLUMN_ID.tier,
    headerName: 'Membership',
    sortable: true,
    minWidth: '140px',
    renderCell: row => <Badge tone='info'>{TIER_LABEL[row.tier]}</Badge>,
  }),

  column({
    field: 'homeZone',
    id: MEMBERS_COLUMN_ID.homeZone,
    headerName: 'Home zone',
    sortable: true,
    minWidth: '130px',
    hideBelow: 'md',
    renderCell: row => <Badge tone='neutral'>{row.homeZone}</Badge>,
  }),

  column({
    field: 'visits',
    id: MEMBERS_COLUMN_ID.visits,
    headerName: 'Visits',
    sortable: true,
    minWidth: '110px',
    align: 'end',
    renderCell: row => <span className='[font-variant-numeric:tabular-nums]'>{formatNumber(row.visits)}</span>,
  }),

  column({
    field: 'bestGrade',
    id: 'bestGrade',
    headerName: 'Best send',
    minWidth: '120px',
    hideBelow: 'sm',
    renderCell: row =>
      row.bestGrade === null ? <span className='text-ink-subtle'>{NO_GRADE}</span> : <Badge tone='brand'>{row.bestGrade}</Badge>,
  }),

  column({
    field: 'lastVisitAt',
    id: MEMBERS_COLUMN_ID.lastVisitAt,
    headerName: 'Last visit',
    sortable: true,
    minWidth: '140px',
    // Null for a member who has never checked in, and nulls sort last in both directions.
    renderCell: row =>
      row.lastVisitAt === null ? (
        <span className='text-ink-subtle'>{NEVER_VISITED}</span>
      ) : (
        <TruncatedText className='[font-variant-numeric:tabular-nums]'>{formatDate(row.lastVisitAt)}</TruncatedText>
      ),
  }),

  column({
    field: 'joinedAt',
    id: MEMBERS_COLUMN_ID.joinedAt,
    headerName: 'Joined',
    sortable: true,
    minWidth: '140px',
    hideBelow: 'lg',
    renderCell: row => <TruncatedText className='[font-variant-numeric:tabular-nums]'>{formatDate(row.joinedAt)}</TruncatedText>,
  }),

  column({
    field: 'status',
    id: MEMBERS_COLUMN_ID.status,
    headerName: 'Status',
    sortable: true,
    minWidth: MEMBERS_COLUMN_WIDTH.status,
    sticky: 'right',
    renderCell: row => (
      <Badge tone={STATUS_TONE[row.status]} dot>
        {STATUS_LABEL[row.status]}
      </Badge>
    ),
  }),

  column({
    field: 'id',
    id: 'actions',
    headerName: '',
    headerLabel: 'Actions',
    minWidth: '56px',
    // Right-sticky with Status, because a right-sticky column only works when it and
    // everything after it are sticky too.
    sticky: 'right',
    align: 'center',
    renderCell: renderActions,
  }),
]
