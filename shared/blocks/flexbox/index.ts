import { defaultFlexboxProps } from './defaults'
import { normalizeFlexbox } from './normalize'
import { createFlexboxViewModel } from './viewModel'

export const flexboxContract = {
  defaultProps: defaultFlexboxProps,
  supportsChildren: true,
  schema: {
    categories: [
      { id: 'layout', label: 'Layout', expanded: true },
      { id: 'alignment', label: 'Alignment', expanded: false },
      { id: 'spacing', label: 'Spacing', expanded: false },
      { id: 'sizing', label: 'Sizing', expanded: false },
      { id: 'appearance', label: 'Appearance', expanded: false },
    ],
    properties: {
      direction: {
        type: 'select',
        label: 'Flex Direction',
        default: 'row',
        options: [
          { value: 'row', label: 'Row ->' },
          { value: 'row-reverse', label: 'Row Reverse <-' },
          { value: 'column', label: 'Column down' },
          { value: 'column-reverse', label: 'Column up' },
        ],
        category: 'Layout',
        description: 'Main axis direction for flex items',
      },
      wrap: {
        type: 'select',
        label: 'Flex Wrap',
        default: 'nowrap',
        options: [
          { value: 'nowrap', label: 'No Wrap' },
          { value: 'wrap', label: 'Wrap' },
          { value: 'wrap-reverse', label: 'Wrap Reverse' },
        ],
        category: 'Layout',
        description: 'Control how items wrap in the container',
      },
      justifyContent: {
        type: 'select',
        label: 'Justify Content',
        default: 'flex-start',
        options: [
          { value: 'flex-start', label: 'Start' },
          { value: 'flex-end', label: 'End' },
          { value: 'center', label: 'Center' },
          { value: 'space-between', label: 'Space Between' },
          { value: 'space-around', label: 'Space Around' },
          { value: 'space-evenly', label: 'Space Evenly' },
        ],
        category: 'Alignment',
        description: 'Alignment along the main axis',
      },
      alignItems: {
        type: 'select',
        label: 'Align Items',
        default: 'stretch',
        options: [
          { value: 'stretch', label: 'Stretch' },
          { value: 'flex-start', label: 'Start' },
          { value: 'flex-end', label: 'End' },
          { value: 'center', label: 'Center' },
          { value: 'baseline', label: 'Baseline' },
        ],
        category: 'Alignment',
        description: 'Alignment along the cross axis',
      },
      gap: {
        type: 'text',
        label: 'Gap',
        default: '16px',
        description: 'Space between all items',
        category: 'Spacing',
      },
      padding: {
        type: 'text',
        label: 'Padding',
        default: '16px',
        description: 'Inner spacing for the container',
        category: 'Spacing',
      },
      minHeight: {
        type: 'text',
        label: 'Min Height',
        default: 'auto',
        description: 'Minimum height for the flex container',
        category: 'Sizing',
      },
      backgroundColor: {
        type: 'color',
        label: 'Background Color',
        default: '#ffffff',
        description: 'Background color for the flex container',
        category: 'Appearance',
      },
    },
  },
  normalize: normalizeFlexbox,
  createViewModel: createFlexboxViewModel,
}
