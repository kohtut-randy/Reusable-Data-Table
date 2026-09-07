import { useMemo } from 'react'
import { Card, CardHeader } from 'components'
import { DataTable, createColumnHelper } from 'components/DataTable'
import type { DataTableColumn } from 'components/DataTable'
import { formatDate } from 'utils'
import { DEMO_MINIMAL_CAPTION, DEMO_MINIMAL_SOURCE } from '../constants'
import { DEMO_ZONES } from '../utils/demoZones'
import type { DemoZone } from '../demo.types'

const column = createColumnHelper<DemoZone>()

const createZoneColumns = (): readonly DataTableColumn<DemoZone>[] => [
  column({ field: 'label', headerName: 'Zone', sortable: true, minWidth: '180px', isRowHeader: true }),
  column({ field: 'grade', headerName: 'Grade band', sortable: true, minWidth: '140px' }),
  column({ field: 'problems', headerName: 'Problems', sortable: true, minWidth: '120px', align: 'end' }),
  column({
    field: 'setOn',
    headerName: 'Last set',
    sortable: true,
    minWidth: '140px',
    valueFormatter: row => formatDate(row.setOn),
  }),
]

/* The smallest useful configuration: four columns, no expansion, no pagination, no
   controlled state. Everything on screen comes from the defaults, which is the clearest
   available evidence that nothing about the component is specific to a timetable. */
export const DemoMinimalTable = () => {
  const columns = useMemo(() => createZoneColumns(), [])

  return (
    <Card flush>
      <CardHeader
        title='The smallest configuration'
        description='Four column definitions and nothing else. The sort cycle, the caption, the live region and the empty state are all defaults.'
      />

      <DataTable
        caption={DEMO_MINIMAL_CAPTION}
        rowNoun='zones'
        columns={columns}
        data={DEMO_ZONES}
        getRowId={row => row.id}
        pageMode='none'
      />

      <div className='border-t border-line p-5'>
        <p className='mb-2 text-xs font-medium text-ink-muted'>The source for the table above, in full:</p>
        <pre
          tabIndex={0}
          role='region'
          aria-label='Source for the minimal table example'
          className='dt-focus-ring overflow-x-auto rounded-lg bg-surface-sunken p-4 text-[0.75rem] leading-relaxed text-ink-muted'
        >
          <code>{DEMO_MINIMAL_SOURCE}</code>
        </pre>
      </div>
    </Card>
  )
}
