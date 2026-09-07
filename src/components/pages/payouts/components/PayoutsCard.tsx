import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { Card, CardHeader, IconButton, Menu, useToast } from 'components'
import { DataTable } from 'components/DataTable'
import type { PageState, RowId, SortState } from 'components/DataTable'
import { MoreSVG, SearchSVG } from 'icons'
import type { PayoutsListResponse } from 'services/api'
import { PayoutSessionsTable } from './PayoutSessionsTable'
import { PayoutsSimulateStates } from './PayoutsSimulateStates'
import { usePayoutSessionsFetcher, usePayoutsQuery } from '../hooks'
import { createPayoutsColumns } from '../utils/payoutsColumns'
import { PAYOUTS_CAPTION, PAYOUTS_QUERY_KEY, PAYOUTS_ROW_HEIGHT_PX } from '../constants'
import type { PayoutDTO, PayoutSessionDTO, PayoutsTestFlags } from '../payouts.types'

/* The server-mode page, and the on-demand children page. `sortMode` and `pageMode` are
   both `'server'`, so the table emits changes and this component supplies the rows: it
   never sorts or slices anything itself.

   Sort and page also go into the URL with shallow routing, which makes this the
   controlled-and-server corner of the ownership matrix. The timetable is the
   controlled-but-client corner. */

const DEFAULT_FLAGS: PayoutsTestFlags = {
  slow: false,
  delayMs: 2200,
  failList: false,
  failChildren: false,
  emptyList: false,
  emptyChildren: false,
}

export type PayoutsCardProps = {
  initialData: PayoutsListResponse
  initialSort: SortState
  initialPage: PageState
}

export const PayoutsCard = ({ initialData, initialSort, initialPage }: PayoutsCardProps) => {
  const router = useRouter()
  const notify = useToast()

  const [flags, setFlags] = useState<PayoutsTestFlags>(DEFAULT_FLAGS)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortState>(initialSort)
  const [page, setPage] = useState<PageState>(initialPage)

  /* Controlled expansion, so the row menu can open a row as well as the toggle. */
  const [expandedRowIds, setExpandedRowIds] = useState<ReadonlySet<RowId>>(new Set())

  const { response, isLoading, isFetching, error, refetch } = usePayoutsQuery({ page, sort, search, flags, initialData })
  const fetchSessions = usePayoutSessionsFetcher(flags)

  const toggleExpanded = useCallback((rowId: RowId) => {
    setExpandedRowIds(current => {
      const next = new Set(current)
      if (next.has(rowId)) next.delete(rowId)
      else next.add(rowId)
      return next
    })
  }, [])

  const copy = useCallback(
    (value: string, label: string) => {
      void navigator.clipboard
        .writeText(value)
        .then(() => notify(`Copied ${label} to the clipboard.`))
        .catch(() => notify('The browser blocked clipboard access.'))
    },
    [notify],
  )

  /* The URL has exactly one writer, which is why this is an effect and not a call in
     each handler: one header click fires both `onSortChange` and `onPageChange`, and two
     imperative pushes leave the address bar an interaction behind. Deriving the URL from
     committed state removes the race. `shallow` keeps getServerSideProps from re-running. */
  const targetQuery = useMemo(() => {
    const query: Record<string, string> = {
      [PAYOUTS_QUERY_KEY.page]: String(page.pageIndex + 1),
      [PAYOUTS_QUERY_KEY.pageSize]: String(page.pageSize),
    }
    if (sort) {
      query[PAYOUTS_QUERY_KEY.sortBy] = sort.columnId
      query[PAYOUTS_QUERY_KEY.sortDir] = sort.direction
    }
    return query
  }, [page.pageIndex, page.pageSize, sort])

  // One job: keep the address bar in step with the committed sort and page.
  useEffect(() => {
    const current = new URLSearchParams(window.location.search).toString()
    const next = new URLSearchParams(targetQuery).toString()
    // Guarded, so the effect cannot push on mount or loop on its own navigation.
    if (current === next) return
    void router.push({ pathname: router.pathname, query: targetQuery }, undefined, { shallow: true })
  }, [targetQuery, router])

  const columns = useMemo(
    () =>
      createPayoutsColumns({
        renderActions: row => (
          <Menu
            menuLabel={`Actions for ${row.reference}`}
            items={[
              {
                id: 'sessions',
                label: expandedRowIds.has(row.id) ? 'Hide sessions' : 'View sessions',
                onSelect: () => toggleExpanded(row.id),
              },
              { id: 'reference', label: 'Copy reference', onSelect: () => copy(row.reference, row.reference) },
              { id: 'instructor', label: 'Copy instructor name', onSelect: () => copy(row.instructor.name, row.instructor.name) },
            ]}
            renderTrigger={props => <IconButton {...props} label={`Actions for ${row.reference}`} icon={<MoreSVG />} size='sm' />}
          />
        ),
      }),
    [expandedRowIds, toggleExpanded, copy],
  )

  return (
    <Card flush>
      <CardHeader
        title='Payouts'
        description='Sorting and paging happen on the server. Expanding a row fetches its sessions on demand.'
        actions={
          <>
            <label className='relative flex items-center'>
              <span className='sr-only'>Search payouts</span>
              <SearchSVG aria-hidden='true' className='pointer-events-none absolute left-2.5 size-4 text-ink-subtle' />
              <input
                type='search'
                value={search}
                onChange={event => {
                  setSearch(event.currentTarget.value)
                  // A new search is a new server query, so it returns to page 1.
                  setPage(previous => ({ ...previous, pageIndex: 0 }))
                }}
                placeholder='Search all payouts'
                className='h-8 w-48 rounded-lg border border-line bg-surface pl-8 pr-2.5 text-[0.8125rem] text-ink placeholder:text-ink-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus'
              />
            </label>
            <PayoutsSimulateStates flags={flags} onChange={setFlags} />
          </>
        }
      />

      <DataTable<PayoutDTO, PayoutSessionDTO>
        caption={PAYOUTS_CAPTION}
        rowNoun='payouts'
        skeletonRowHeight={PAYOUTS_ROW_HEIGHT_PX}
        columns={columns}
        data={response?.data ?? []}
        getRowId={row => row.id}
        loading={isLoading}
        fetching={isFetching}
        error={error}
        onRetry={refetch}
        // The whole row expands; the toggle stays the keyboard path. See the timetable.
        onRowClick={row => toggleExpanded(row.id)}
        // Server owns the ordering and the slice; the table only emits intent.
        sortMode='server'
        sort={sort}
        onSortChange={setSort}
        pageMode='server'
        rowCount={response?.total ?? 0}
        pagination={page}
        onPageChange={setPage}
        expansion={{
          mode: 'lazy',
          fetchChildren: fetchSessions,
          expandedRowIds,
          onExpandedChange: setExpandedRowIds,
          getRowLabel: row => `${row.instructor.name}, ${row.reference}`,
          // The children are genuinely tabular, so they get a real nested table.
          renderContent: ({ row, children }) => <PayoutSessionsTable sessions={children} currency={row.currency} />,
          renderEmpty: ({ row }) => (
            <p className='px-4 py-3.5 text-[0.8125rem] text-ink-subtle'>No sessions recorded for {row.reference}.</p>
          ),
        }}
      />
    </Card>
  )
}
