import { defaultQuoteProps } from './defaults'
import { normalizeQuote } from './normalize'
import { createQuoteViewModel } from './viewModel'

export const quoteContract = {
  defaultProps: defaultQuoteProps,
  schema: {
    categories: [
      { id: 'content', label: 'Content', expanded: true },
      { id: 'typography', label: 'Typography', expanded: false },
      { id: 'layout', label: 'Layout', expanded: false },
    ],
    properties: {
      text: {
        type: 'textarea',
        label: 'Quote Text',
        default: '"This is a quote or testimonial text."',
        category: 'Content',
      },
      author: {
        type: 'text',
        label: 'Author',
        default: 'Author Name',
        category: 'Content',
      },
      color: {
        type: 'color',
        label: 'Text Color',
        default: '#374151',
        category: 'Typography',
      },
      fontSize: {
        type: 'text',
        label: 'Font Size',
        default: '18px',
        category: 'Typography',
      },
      lineHeight: {
        type: 'text',
        label: 'Line Height',
        default: '1.7',
        category: 'Typography',
      },
      alignment: {
        type: 'select',
        label: 'Alignment',
        default: 'center',
        options: ['left', 'center', 'right'],
        category: 'Layout',
      },
      margin: {
        type: 'text',
        label: 'Margin',
        default: '20px 0',
        category: 'Layout',
      },
    },
  },
  normalize: normalizeQuote,
  createViewModel: createQuoteViewModel,
}
