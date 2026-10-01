import { defaultSpacerProps } from './defaults'
import { normalizeSpacer } from './normalize'
import { createSpacerViewModel } from './viewModel'

export const spacerContract = {
  defaultProps: defaultSpacerProps,
  schema: {
    categories: [
      { id: 'spacing', label: 'Spacing', expanded: true },
      { id: 'responsive', label: 'Responsive', expanded: false },
      { id: 'appearance', label: 'Appearance', expanded: false },
      { id: 'behavior', label: 'Behavior', expanded: false },
      { id: 'advanced', label: 'Advanced', expanded: false },
    ],
    properties: {
      height: {
        type: 'text',
        label: 'Height',
        default: '32px',
        description: 'Default height for desktop screens (px, rem, vh)',
        category: 'Spacing',
        placeholder: '32px',
      },
      mobileHeight: {
        type: 'text',
        label: 'Mobile Height',
        default: '24px',
        description: 'Height on mobile devices (< 768px)',
        category: 'Responsive',
        placeholder: '24px',
      },
      tabletHeight: {
        type: 'text',
        label: 'Tablet Height',
        default: '28px',
        description: 'Height on tablet devices (768px - 1024px)',
        category: 'Responsive',
        placeholder: '28px',
      },
      backgroundColor: {
        type: 'color',
        label: 'Background Color',
        default: '#ffffff',
        description: 'Background color for visual reference in editor',
        category: 'Appearance',
      },
      showInEditor: {
        type: 'toggle',
        label: 'Show in Editor',
        default: true,
        description: 'Display visual representation in page editor',
        category: 'Appearance',
      },
      visibility: {
        type: 'toggle',
        label: 'Visible on Page',
        default: true,
        description: 'Show or hide the spacer on published page',
        category: 'Behavior',
      },
      className: {
        type: 'text',
        label: 'CSS Class',
        default: '',
        description: 'Additional CSS classes for custom styling',
        category: 'Advanced',
      },
    },
  },
  normalize: normalizeSpacer,
  createViewModel: createSpacerViewModel,
}
