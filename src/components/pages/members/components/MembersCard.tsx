import { useCallback, useMemo, useState } from 'react'
import { Card, CardHeader, IconButton, Menu, useToast } from 'components'
import { DataTable } from 'components/DataTable'
import type { PageState, SortState } from 'components/DataTable'
import { MoreSVG, SearchSVG } from 'icons'
import { MembersSimulateStates } from './MembersSimulateStates'
import { useMembersQuery } from '../hooks'
import { createMembersColumns } from '../utils/membersColumns'
import { MEMBERS_CAPTION, MEMBERS_DEFAULT_PAGE_SIZE, MEMBERS_NOUN, MEMBERS_ROW_HEIGHT_PX } from '../constants'
import type { MemberDTO, MembersTestFlags } from '../members.types'

const DEFAULT_FLAGS: MembersTestFlags = { slow: false, delayMs: 2200, failList: false, emptyList: false }

/* The third configuration of the same table: server sort, server pagination, and NO
   `expansion` prop at all. Nothing else in the component changes. */
export const MembersCard = () => {
  const notify = useToast()

  const [flags, setFlags] = useState<MembersTestFlags>(DEFAULT_FLAGS)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortState>(null)
  const [page, setPage] = useState<PageState>({ pageIndex: 0, pageSize: MEMBERS_DEFAULT_PAGE_SIZE })

  const { response, isLoading, isFetching, error, refetch } = useMembersQuery({ page, sort, search, flags })

  /* Server mode: a new sort or a new search means a new page 1 from the server. Both
     resets live here rather than in the table, because the table cannot know that the
     result set changed underneath it. */
  const handleSortChange = useCallback((next: SortState) => {
    setSort(next)
    setPage(previous => ({ ...previous, pageIndex: 0 }))
  }, [])

  const copy = useCallback(
    (value: string) => {
      void navigator.clipboard
        .writeText(value)
        .then(() => notify(`Copied ${value} to the clipboard.`))
        .catch(() => notify('The browser blocked clipboard access.'))
    },
    [notify],
  )

  const columns = useMemo(
    () =>
      createMembersColumns({
        renderActions: row => (
          <Menu
            menuLabel={`Actions for ${row.name}`}
            items={[
              { id: 'reference', label: 'Copy reference', onSelect: () => copy(row.reference) },
              { id: 'name', label: 'Copy name', onSelect: () => copy(row.name) },
              {
                id: 'visits',
                label: 'Visit history',
                onSelect: () =>
                  notify(
                    row.lastVisitAt === null ? `${row.name} has not checked in yet.` : `${row.name} has ${row.visits} recorded visits.`,
                  ),
              },
            ]}
            renderTrigger={props => <IconButton {...props} label={`Actions for ${row.name}`} icon={<MoreSVG />} size='sm' />}
          />
        ),
      }),
    [copy, notify],
  )

  return (
    <Card flush>
      <CardHeader
        title='Members'
        description='Sorting, paging and search all happen on the server. This table has no expandable rows.'
        actions={
          <>
            <label className='relative flex items-center'>
              <span className='sr-only'>Search members</span>
              <SearchSVG aria-hidden='true' className='pointer-events-none absolute left-2.5 size-4 text-ink-subtle' />
              <input
                type='search'
                value={search}
                onChange={event => {
                  setSearch(event.currentTarget.value)
                  setPage(previous => ({ ...previous, pageIndex: 0 }))
                }}
                placeholder='Search all members'
                className='h-8 w-48 rounded-lg border border-line bg-surface pl-8 pr-2.5 text-[0.8125rem] text-ink placeholder:text-ink-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus'
              />
            </label>
            <MembersSimulateStates flags={flags} onChange={setFlags} />
          </>
        }
      />

      <DataTable<MemberDTO>
        caption={MEMBERS_CAPTION}
        rowNoun={MEMBERS_NOUN}
        skeletonRowHeight={MEMBERS_ROW_HEIGHT_PX}
        columns={columns}
        data={response?.data ?? []}
        getRowId={row => row.id}
        loading={isLoading}
        fetching={isFetching}
        error={error}
        onRetry={refetch}
        zebra
        sortMode='server'
        sort={sort}
        onSortChange={handleSortChange}
        pageMode='server'
        rowCount={response?.total ?? 0}
        pagination={page}
        onPageChange={setPage}
      />
    </Card>
  )
}
