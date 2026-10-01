import { defaultIconProps } from './defaults'
import { normalizeIcon } from './normalize'
import { createIconViewModel } from './viewModel'

export const iconContract = {
  defaultProps: defaultIconProps,
  schema: {
    properties: {
      name: {
        type: 'text',
        label: 'Icon Name',
        default: 'star',
      },
      size: {
        type: 'text',
        label: 'Size',
        default: '24px',
      },
      color: {
        type: 'color',
        label: 'Color',
        default: '#000000',
      },
    },
  },
  normalize: normalizeIcon,
  createViewModel: createIconViewModel,
}
