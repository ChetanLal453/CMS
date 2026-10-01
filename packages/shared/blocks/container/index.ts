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
      position: {
        type: 'select',
        label: 'Position',
        default: 'static',
        options: [
          { value: 'static', label: 'Static (Default)' },
          { value: 'relative', label: 'Relative' },
          { value: 'absolute', label: 'Absolute (Floating)' },
          { value: 'sticky', label: 'Sticky' },
        ],
        category: 'Layout',
      },
      children: { type: 'component-list', label: 'Children', default: [], category: 'Layout' },
      top: { type: 'text', label: 'Top Offset', default: '', category: 'Layout' },
      right: { type: 'text', label: 'Right Offset', default: '', category: 'Layout' },
      bottom: { type: 'text', label: 'Bottom Offset', default: '', category: 'Layout' },
      left: { type: 'text', label: 'Left Offset', default: '', category: 'Layout' },
      zIndex: { type: 'text', label: 'Z-Index', default: '', category: 'Layout' },
      mobilePosition: { type: 'select', label: 'Mobile Position', default: '', category: 'Layout' },
      mobileTop: { type: 'text', label: 'Mobile Top', default: '', category: 'Layout' },
      mobileRight: { type: 'text', label: 'Mobile Right', default: '', category: 'Layout' },
      mobileBottom: { type: 'text', label: 'Mobile Bottom', default: '', category: 'Layout' },
      mobileLeft: { type: 'text', label: 'Mobile Left', default: '', category: 'Layout' },
      overflow: {
        type: 'select',
        label: 'Overflow',
        default: 'visible',
        options: [
          { value: 'visible', label: 'Visible' },
          { value: 'hidden', label: 'Hidden' },
          { value: 'auto', label: 'Auto' },
        ],
        category: 'Layout',
      },
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
