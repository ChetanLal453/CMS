import { defaultNewGridProps } from './defaults'
import { normalizeNewGrid } from './normalize'
import { createNewGridViewModel } from './viewModel'

export type { NewGrid, NewGridCell, NewGridInput, NewGridViewModel, LegacyNewGridProps } from './types'
export { createNewGridViewModel } from './viewModel'

export const newGridContract = {
  defaultProps: defaultNewGridProps,
  schema: {
    title: 'Grid',
    categories: [
      { id: 'layout', label: '📐 Layout', expanded: true },
      { id: 'style', label: '🎨 Style', expanded: false },
      { id: 'alignment', label: '↔️ Alignment', expanded: false },
      { id: 'responsive', label: '📱 Responsive', expanded: false },
      { id: 'behavior', label: '⚙️ Behavior', expanded: false },
      { id: 'advanced', label: '🛠️ Advanced', expanded: false },
    ],
    properties: {
      columns: { type: 'number', label: 'Columns', default: defaultNewGridProps.layout.columns, min: 1, max: 12, step: 1, category: 'layout' },
      rows: { type: 'number', label: 'Rows', default: defaultNewGridProps.layout.rows, min: 1, max: 24, step: 1, category: 'layout' },
      gap: { type: 'number', label: 'Gap (px)', default: defaultNewGridProps.layout.gap, min: 0, max: 100, step: 4, category: 'layout' },
      padding: { type: 'number', label: 'Padding (px)', default: defaultNewGridProps.layout.padding, min: 0, max: 100, step: 4, category: 'layout' },
      margin: { type: 'number', label: 'Margin (px)', default: defaultNewGridProps.layout.margin, min: 0, max: 100, step: 4, category: 'layout' },
      backgroundColor: { type: 'color', label: 'Background Color', default: defaultNewGridProps.style.backgroundColor, category: 'style' },
      border: { type: 'text', label: 'Border', default: defaultNewGridProps.style.border, category: 'style', placeholder: '1px solid #e5e7eb' },
      borderRadius: { type: 'number', label: 'Border Radius (px)', default: defaultNewGridProps.style.borderRadius, min: 0, max: 50, step: 1, category: 'style' },
      gridLineColor: { type: 'color', label: 'Grid Line Color', default: defaultNewGridProps.style.gridLineColor, category: 'style' },
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
        category: 'alignment',
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
        category: 'alignment',
      },
      mobileColumns: { type: 'number', label: 'Mobile Columns', default: defaultNewGridProps.responsive.mobileColumns, min: 1, max: 4, step: 1, category: 'responsive' },
      tabletColumns: { type: 'number', label: 'Tablet Columns', default: defaultNewGridProps.responsive.tabletColumns, min: 1, max: 6, step: 1, category: 'responsive' },
      desktopColumns: { type: 'number', label: 'Desktop Columns', default: defaultNewGridProps.responsive.desktopColumns, min: 1, max: 12, step: 1, category: 'responsive' },
      hideOnMobile: { type: 'toggle', label: 'Hide on Mobile', default: defaultNewGridProps.responsive.hideOnMobile, category: 'responsive' },
      hideOnTablet: { type: 'toggle', label: 'Hide on Tablet', default: defaultNewGridProps.responsive.hideOnTablet, category: 'responsive' },
      draggable: { type: 'toggle', label: 'Draggable Cells', default: defaultNewGridProps.behavior.draggable, category: 'behavior' },
      resizable: { type: 'toggle', label: 'Resizable Cells', default: defaultNewGridProps.behavior.resizable, category: 'behavior' },
      showGridLines: { type: 'toggle', label: 'Show Grid Lines', default: defaultNewGridProps.behavior.showGridLines, category: 'behavior' },
      snapToGrid: { type: 'toggle', label: 'Snap to Grid', default: defaultNewGridProps.behavior.snapToGrid, category: 'behavior' },
      visible: { type: 'toggle', label: 'Visible', default: defaultNewGridProps.behavior.visible, category: 'behavior' },
      customCSS: { type: 'textarea', label: 'Custom CSS', default: defaultNewGridProps.style.customCSS, category: 'advanced', placeholder: 'Enter custom CSS here...' },
      className: { type: 'text', label: 'CSS Class', default: defaultNewGridProps.style.className, category: 'advanced' },
      id: { type: 'text', label: 'HTML ID', default: defaultNewGridProps.style.id, category: 'advanced' },
      dataAttributes: {
        type: 'textarea',
        label: 'Data Attributes (JSON)',
        default: defaultNewGridProps.style.dataAttributes,
        category: 'advanced',
        placeholder: '{\"data-custom\": \"value\"}',
      },
    },
  },
  normalize: normalizeNewGrid,
  createViewModel: createNewGridViewModel,
}
