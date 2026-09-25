import type { NewGrid } from './types'

const emptyRow = (columns: number) => Array.from({ length: columns }, () => ({ component: null }))

export const defaultNewGridProps: NewGrid = {
  version: 1,
  type: 'newgrid',
  schemaVersion: 1,
  content: {
    cells: [emptyRow(3), emptyRow(3)],
    components: [null, null, null, null, null, null],
  },
  layout: {
    columns: 3,
    rows: 2,
    gap: 10,
    padding: 24,
    margin: 0,
    justifyContent: 'stretch',
    alignItems: 'stretch',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridAutoRows: 'minmax(100px, auto)',
    minHeight: '150px',
  },
  responsive: {
    mobileColumns: 1,
    tabletColumns: 2,
    desktopColumns: 3,
    hideOnMobile: false,
    hideOnTablet: false,
  },
  style: {
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: 0,
    gridLineColor: '#e5e7eb',
    customCSS: '',
    className: '',
    id: '',
    dataAttributes: '{}',
    gridTestFromComponent: 'YES FROM NEWGRID COMPONENT FILE',
  },
  behavior: {
    draggable: true,
    resizable: false,
    showGridLines: true,
    snapToGrid: true,
    visible: true,
  },
  cells: [emptyRow(3), emptyRow(3)],
  components: [null, null, null, null, null, null],
}
