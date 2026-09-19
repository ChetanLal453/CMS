import { defaultContainerProps } from './defaults'
import { normalizeContainer } from './normalize'
import { createContainerViewModel } from './viewModel'

export const containerContract = {
  defaultProps: defaultContainerProps,
  supportsChildren: true,
  schema: {
    categories: [
      { id: 'layout', label: 'Layout', expanded: true },
      { id: 'style', label: 'Style', expanded: false },
    ],
    properties: {
      maxWidth: { type: 'text', label: 'Max Width', default: '960px', category: 'Layout' },
      width: { type: 'text', label: 'Width', default: '100%', category: 'Layout' },
      minHeight: { type: 'text', label: 'Min Height', default: 'auto', category: 'Layout' },
      padding: { type: 'text', label: 'Padding', default: '20px', category: 'Layout' },
      margin: { type: 'text', label: 'Margin', default: '0 auto', category: 'Layout' },
      alignment: { type: 'select', label: 'Alignment', default: 'center', options: ['left', 'center', 'right'], category: 'Layout' },
      backgroundColor: { type: 'color', label: 'Background Color', default: 'transparent', category: 'Style' },
      borderRadius: { type: 'text', label: 'Border Radius', default: '0px', category: 'Style' },
      border: { type: 'text', label: 'Border', default: 'none', category: 'Style' },
      borderColor: { type: 'color', label: 'Border Color', default: 'transparent', category: 'Style' },
      shadow: { type: 'text', label: 'Shadow', default: 'none', category: 'Style' },
    },
  },
  normalize: normalizeContainer,
  createViewModel: createContainerViewModel,
}
