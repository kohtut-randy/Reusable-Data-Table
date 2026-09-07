import { useCallback, useDeferredValue, useMemo, useState } from 'react'
import { Card, CardHeader, IconButton, Menu, useToast } from 'components'
import { DataTable } from 'components/DataTable'
import type { PageState, RowId, SortState } from 'components/DataTable'
import { MoreSVG, SearchSVG } from 'icons'
import { TimetableAttendeeList } from './TimetableAttendeeList'
import { TimetableSimulateStates } from './TimetableSimulateStates'
import { TimetableStats } from './TimetableStats'
import { useTimetableAttendeesFetcher, useTimetableClassesQuery } from '../hooks'
import { createTimetableColumns } from '../utils/timetableColumns'
import { TIMETABLE_CAPTION, TIMETABLE_DEFAULT_PAGE_SIZE, TIMETABLE_NOUN, TIMETABLE_ROW_HEIGHT_PX } from '../constants'
import type { AttendeeDTO, ClassDTO, ClassStatus, TimetableTestFlags } from '../timetable.types'

/* The business component: it owns this page's state and wiring, and is the only thing
   that knows both "class" and "DataTable". Client sort and client pagination come from
   one `/api/classes` request; attendees are fetched on demand, one row at a time, from
   `/api/classes/:classId/attendees` when a row is expanded. */

const DEFAULT_FLAGS: TimetableTestFlags = {
  slow: false,
  delayMs: 2600,
  failList: false,
  failChildren: false,
  emptyList: false,
  emptyChildren: false,
}

export type TimetableClassesCardProps = {
  /** Studio-local calendar date. The card fetches this whole day as its working set. */
  date: string
}

export const TimetableClassesCard = ({ date }: TimetableClassesCardProps) => {
  const notify = useToast()

  const [flags, setFlags] = useState<TimetableTestFlags>(DEFAULT_FLAGS)
  const [search, setSearch] = useState('')
  /* Sort and page are held here rather than inside the table, even though this page
     applies both client-side: ownership and mode are orthogonal, so the parent can sync
     them to a URL later while the table still does the sorting and slicing. */
  const [sort, setSort] = useState<SortState>(null)
  const [page, setPage] = useState<PageState>({ pageIndex: 0, pageSize: TIMETABLE_DEFAULT_PAGE_SIZE })

  /* Expansion is controlled here because the row menu opens rows too, and two writers
     to one piece of state is when it has to be lifted. */
  const [expandedRowIds, setExpandedRowIds] = useState<ReadonlySet<RowId>>(new Set())

  /* An optimistic local override for the row menu, and nothing more: there is no write
     endpoint here. A real one would POST and then invalidate the query. */
  const [statusOverrides, setStatusOverrides] = useState<ReadonlyMap<string, ClassStatus>>(new Map())

  const { response, isLoading, isFetching, error, refetch } = useTimetableClassesQuery({ date, flags })
  const fetchAttendees = useTimetableAttendeesFetcher(flags)

  /* useDeferredValue so filtering never blocks a keystroke. The filter runs over the
     fetched day, so typing does not refetch. */
  const deferredSearch = useDeferredValue(search)

  const rows = useMemo(() => {
    const all = response?.data ?? []
    const withOverrides =
      statusOverrides.size === 0
        ? all
        : all.map(row => {
            const override = statusOverrides.get(row.id)
            return override === undefined ? row : { ...row, status: override }
          })

    const term = deferredSearch.trim().toLowerCase()
    if (!term) return withOverrides

    return withOverrides.filter(
      row =>
        row.name.toLowerCase().includes(term) || row.instructor.name.toLowerCase().includes(term) || row.room.toLowerCase().includes(term),
    )
  }, [response?.data, deferredSearch, statusOverrides])

  const toggleExpanded = useCallback((rowId: RowId) => {
    setExpandedRowIds(current => {
      const next = new Set(current)
      if (next.has(rowId)) next.delete(rowId)
      else next.add(rowId)
      return next
    })
  }, [])

  const setStatus = useCallback(
    (row: ClassDTO, status: ClassStatus, message: string) => {
      setStatusOverrides(current => {
        const next = new Map(current)
        next.set(row.id, status)
        return next
      })
      notify(message)
    },
    [notify],
  )

  const columns = useMemo(
    () =>
      createTimetableColumns({
        renderActions: row => (
          <Menu
            menuLabel={`Actions for ${row.name}`}
            items={[
              {
                id: 'bookings',
                label: expandedRowIds.has(row.id) ? 'Hide bookings' : 'View bookings',
                onSelect: () => toggleExpanded(row.id),
              },
              {
                id: 'copy',
                label: 'Copy class ID',
                onSelect: () => {
                  void navigator.clipboard
                    .writeText(row.id)
                    .then(() => notify(`Copied ${row.id} to the clipboard.`))
                    // Clipboard access can be denied, and a silent no-op would look broken.
                    .catch(() => notify('The browser blocked clipboard access.'))
                },
              },
              row.status === 'cancelled'
                ? {
                    id: 'restore',
                    label: 'Restore class',
                    onSelect: () =>
                      setStatus(row, row.booked >= row.capacity ? 'full' : 'scheduled', `${row.name} is back on the schedule.`),
                  }
                : {
                    id: 'cancel',
                    label: 'Cancel class',
                    tone: 'danger' as const,
                    onSelect: () => setStatus(row, 'cancelled', `${row.name} is cancelled. Local to this demo.`),
                  },
            ]}
            renderTrigger={props => <IconButton {...props} label={`Actions for ${row.name}`} icon={<MoreSVG />} size='sm' />}
          />
        ),
      }),
    [expandedRowIds, toggleExpanded, notify, setStatus],
  )

  return (
    <div className='flex flex-col gap-6'>
      <TimetableStats classes={response?.data ?? []} total={response?.total ?? 0} loading={isLoading} />

      <Card flush>
        <CardHeader
          title='Classes'
          description='Expand a row to see its bookings. Sorting and paging run in the browser here.'
          actions={
            <>
              <label className='relative flex items-center'>
                <span className='sr-only'>Filter classes</span>
                <SearchSVG aria-hidden='true' className='pointer-events-none absolute left-2.5 size-4 text-ink-subtle' />
                <input
                  type='search'
                  value={search}
                  onChange={event => setSearch(event.currentTarget.value)}
                  placeholder='Filter this day'
                  className='h-8 w-44 rounded-lg border border-line bg-surface pl-8 pr-2.5 text-[0.8125rem] text-ink placeholder:text-ink-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus'
                />
              </label>
              <TimetableSimulateStates flags={flags} onChange={setFlags} />
            </>
          }
        />

        <DataTable<ClassDTO, AttendeeDTO>
          caption={TIMETABLE_CAPTION}
          rowNoun={TIMETABLE_NOUN}
          skeletonRowHeight={TIMETABLE_ROW_HEIGHT_PX}
          columns={columns}
          data={rows}
          getRowId={row => row.id}
          loading={isLoading}
          fetching={isFetching}
          error={error}
          onRetry={refetch}
          zebra
          /* The whole row expands, with the toggle button as the keyboard path: a <tr>
             cannot be focused, and making it focusable would nest interactive elements
             inside an interactive row. Both drive the same state. */
          onRowClick={row => toggleExpanded(row.id)}
          // Client sort and client pagination: the whole day of rows is local.
          sortMode='client'
          pageMode='client'
          sort={sort}
          onSortChange={setSort}
          pagination={page}
          onPageChange={setPage}
          expansion={{
            mode: 'lazy',
            // On-demand children: one request per row, made the first time it's expanded.
            fetchChildren: fetchAttendees,
            getRowLabel: row => row.name,
            expandedRowIds,
            onExpandedChange: setExpandedRowIds,
            renderContent: ({ row, children }) => <TimetableAttendeeList attendees={children} className={row.name} />,
            // Loading and error states fall back to the table's default renderers.
            renderEmpty: ({ row }) => <p className='px-4 py-3.5 text-[0.8125rem] text-ink-subtle'>No bookings yet for {row.name}.</p>,
          }}
        />
      </Card>
    </div>
  )
}
