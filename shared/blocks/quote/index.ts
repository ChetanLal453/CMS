import { defaultQuoteProps } from './defaults'
import { normalizeQuote } from './normalize'
import { createQuoteViewModel } from './viewModel'

export const quoteContract = {
  defaultProps: defaultQuoteProps,
  schema: {
    properties: {
      text: {
        type: 'textarea',
        label: 'Quote Text',
        default: '"This is a quote or testimonial text."',
      },
      author: {
        type: 'text',
        label: 'Author',
        default: 'Author Name',
      },
      align: {
        type: 'select',
        label: 'Alignment',
        default: 'center',
        options: ['left', 'center', 'right'],
      },
      margin: {
        type: 'text',
        label: 'Margin',
        default: '20px 0',
      },
      color: {
        type: 'color',
        label: 'Text Color',
        default: '#374151',
      },
      fontSize: {
        type: 'text',
        label: 'Font Size',
        default: '18px',
      },
      lineHeight: {
        type: 'text',
        label: 'Line Height',
        default: '1.7',
      },
    },
  },
  normalize: normalizeQuote,
  createViewModel: createQuoteViewModel,
}
