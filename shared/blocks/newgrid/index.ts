import { defaultNewGridProps } from './defaults'
import { normalizeNewGrid } from './normalize'
import { createNewGridViewModel } from './viewModel'

export type { NewGrid, NewGridCell, NewGridInput, NewGridViewModel, LegacyNewGridProps } from './types'
export { createNewGridViewModel } from './viewModel'

export const newGridContract = {
  defaultProps: defaultNewGridProps,
  schema: {
    title: 'Grid',
    properties: {
      gridTestFromComponent: {
        type: 'text',
        label: 'Grid Test (FROM COMPONENT)',
        default: defaultNewGridProps.style.gridTestFromComponent,
        category: 'Advanced',
        description: 'This proves schema comes from shared contract.',
      },
      columns: { type: 'number', label: 'Columns', default: defaultNewGridProps.layout.columns, min: 1, max: 12, step: 1, category: 'Layout' },
      rows: { type: 'number', label: 'Rows', default: defaultNewGridProps.layout.rows, min: 1, max: 24, step: 1, category: 'Layout' },
      gap: { type: 'number', label: 'Gap (px)', default: defaultNewGridProps.layout.gap, min: 0, max: 100, step: 4, category: 'Layout' },
      padding: { type: 'number', label: 'Padding (px)', default: defaultNewGridProps.layout.padding, min: 0, max: 100, step: 4, category: 'Layout' },
      margin: { type: 'number', label: 'Margin (px)', default: defaultNewGridProps.layout.margin, min: 0, max: 100, step: 4, category: 'Layout' },
      backgroundColor: { type: 'color', label: 'Background Color', default: defaultNewGridProps.style.backgroundColor, category: 'Style' },
      border: { type: 'text', label: 'Border', default: defaultNewGridProps.style.border, category: 'Style', placeholder: '1px solid #e5e7eb' },
      borderRadius: { type: 'number', label: 'Border Radius (px)', default: defaultNewGridProps.style.borderRadius, min: 0, max: 50, step: 1, category: 'Style' },
      gridLineColor: { type: 'color', label: 'Grid Line Color', default: defaultNewGridProps.style.gridLineColor, category: 'Style' },
      justifyContent: {
        type: 'select',
        label: 'Justify Content',
        default: defaultNewGridProps.layout.justifyContent,
        options: [
          { value: 'stretch', label: 'Stretch' },
          { value: 'start', label: 'Start' },
          { value: 'center', label: 'Center' },
          { value: 'end', label: 'End' },
          { value: 'space-between', label: 'Space Between' },
          { value: 'space-around', label: 'Space Around' },
          { value: 'space-evenly', label: 'Space Evenly' },
        ],
        category: 'Alignment',
      },
      alignItems: {
        type: 'select',
        label: 'Align Items',
        default: defaultNewGridProps.layout.alignItems,
        options: [
          { value: 'stretch', label: 'Stretch' },
          { value: 'start', label: 'Start' },
          { value: 'center', label: 'Center' },
          { value: 'end', label: 'End' },
          { value: 'baseline', label: 'Baseline' },
        ],
        category: 'Alignment',
      },
      mobileColumns: { type: 'number', label: 'Mobile Columns', default: defaultNewGridProps.responsive.mobileColumns, min: 1, max: 4, step: 1, category: 'Responsive' },
      tabletColumns: { type: 'number', label: 'Tablet Columns', default: defaultNewGridProps.responsive.tabletColumns, min: 1, max: 6, step: 1, category: 'Responsive' },
      desktopColumns: { type: 'number', label: 'Desktop Columns', default: defaultNewGridProps.responsive.desktopColumns, min: 1, max: 12, step: 1, category: 'Responsive' },
      hideOnMobile: { type: 'toggle', label: 'Hide on Mobile', default: defaultNewGridProps.responsive.hideOnMobile, category: 'Responsive' },
      hideOnTablet: { type: 'toggle', label: 'Hide on Tablet', default: defaultNewGridProps.responsive.hideOnTablet, category: 'Responsive' },
      draggable: { type: 'toggle', label: 'Draggable Cells', default: defaultNewGridProps.behavior.draggable, category: 'Behavior' },
      resizable: { type: 'toggle', label: 'Resizable Cells', default: defaultNewGridProps.behavior.resizable, category: 'Behavior' },
      showGridLines: { type: 'toggle', label: 'Show Grid Lines', default: defaultNewGridProps.behavior.showGridLines, category: 'Behavior' },
      snapToGrid: { type: 'toggle', label: 'Snap to Grid', default: defaultNewGridProps.behavior.snapToGrid, category: 'Behavior' },
      visible: { type: 'toggle', label: 'Visible', default: defaultNewGridProps.behavior.visible, category: 'Behavior' },
      customCSS: { type: 'textarea', label: 'Custom CSS', default: defaultNewGridProps.style.customCSS, category: 'Advanced', placeholder: 'Enter custom CSS here...' },
      className: { type: 'text', label: 'CSS Class', default: defaultNewGridProps.style.className, category: 'Advanced' },
      id: { type: 'text', label: 'HTML ID', default: defaultNewGridProps.style.id, category: 'Advanced' },
      dataAttributes: {
        type: 'textarea',
        label: 'Data Attributes (JSON)',
        default: defaultNewGridProps.style.dataAttributes,
        category: 'Advanced',
        placeholder: '{\"data-custom\": \"value\"}',
      },
      cells: { type: 'grid-cells', label: 'Grid Cells', default: defaultNewGridProps.cells, category: 'Content', description: 'Manage components in grid cells' },
      components: { type: 'component-list', label: 'Components', default: defaultNewGridProps.components, category: 'Content', description: 'List of components in the grid' },
    },
  },
  normalize: normalizeNewGrid,
  createViewModel: createNewGridViewModel,
}
