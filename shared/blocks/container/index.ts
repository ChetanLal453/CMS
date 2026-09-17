import { defaultContainerProps } from './defaults'
import { normalizeContainer } from './normalize'
import { createContainerViewModel } from './viewModel'

export const containerContract = {
  defaultProps: defaultContainerProps,
  supportsChildren: true,
  schema: {
    properties: {
      maxWidth: { type: 'text', label: 'Max Width', default: '960px' },
      padding: { type: 'text', label: 'Padding', default: '20px' },
      margin: { type: 'text', label: 'Margin', default: '0 auto' },
      backgroundColor: { type: 'color', label: 'Background Color', default: 'transparent' },
    },
  },
  normalize: normalizeContainer,
  createViewModel: createContainerViewModel,
}
