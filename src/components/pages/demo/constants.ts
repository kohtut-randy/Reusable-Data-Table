export const DEMO_MINIMAL_CAPTION = 'Problems by wall zone'

/* The whole point of the minimal example is that it is short, so the source below is the
   literal source above. Keeping it as a string rather than reading the file keeps the
   demo free of a build-time plugin. */
export const DEMO_MINIMAL_SOURCE = `const column = createColumnHelper<Zone>()

const columns = [
  column({ field: 'label', headerName: 'Zone', sortable: true, minWidth: '180px', isRowHeader: true }),
  column({ field: 'grade', headerName: 'Grade band', sortable: true, minWidth: '140px' }),
  column({ field: 'problems', headerName: 'Problems', sortable: true, minWidth: '120px', align: 'end' }),
  column({ field: 'setOn', headerName: 'Last set', sortable: true, minWidth: '140px',
           valueFormatter: row => formatDate(row.setOn) }),
]

<DataTable
  caption='Problems by wall zone'
  rowNoun='zones'
  columns={columns}
  data={zones}
  getRowId={row => row.id}
  pageMode='none'
/>`
