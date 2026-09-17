import { defaultDividerProps } from './defaults'
import { normalizeDivider } from './normalize'
import { createDividerViewModel } from './viewModel'

export const dividerContract = {
  defaultProps: defaultDividerProps,
  schema: {
    properties: {
      thickness: { type: 'text', label: 'Thickness', default: '1px' },
      color: { type: 'color', label: 'Color', default: '#cccccc' },
      width: { type: 'text', label: 'Width', default: '100%' },
      margin: { type: 'text', label: 'Margin', default: '20px 0' },
    },
  },
  normalize: normalizeDivider,
  createViewModel: createDividerViewModel,
}
