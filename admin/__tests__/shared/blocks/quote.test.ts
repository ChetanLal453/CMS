import { normalizeQuote } from '../../../../shared/blocks/quote/normalize'
import { createQuoteViewModel } from '../../../../shared/blocks/quote/viewModel'
import { migrateLayoutInput } from '../../../../shared/page/migrateLayoutInput'

describe('Quote Canonical Normalizer & ViewModel', () => {
  it('normalizes quote sparsely without eager style defaults', () => {
    const normalized = normalizeQuote({
      content: { text: 'Simplicity is prerequisite for reliability.' },
    })

    expect(normalized.version).toBe(1)
    expect(normalized.content?.text).toBe('Simplicity is prerequisite for reliability.')
    expect(normalized.content?.author).toBeUndefined()
    expect(normalized.style?.color).toBeUndefined()
    expect(normalized.style?.fontSize).toBeUndefined()
    expect(normalized.style?.align).toBeUndefined()
    expect(normalized.style?.margin).toBeUndefined()
  })

  it('preserves explicitly configured content and style properties', () => {
    const normalized = normalizeQuote({
      content: {
        text: 'The only way to do great work is to love what you do.',
        author: 'Steve Jobs',
      },
      style: {
        align: 'right',
        color: '#111827',
        fontSize: '20px',
        margin: '32px 0',
      },
    })

    expect(normalized.version).toBe(1)
    expect(normalized.content?.text).toBe('The only way to do great work is to love what you do.')
    expect(normalized.content?.author).toBe('Steve Jobs')
    expect(normalized.style?.align).toBe('right')
    expect(normalized.style?.color).toBe('#111827')
    expect(normalized.style?.fontSize).toBe('20px')
    expect(normalized.style?.margin).toBe('32px 0')
    expect(normalized.text).toBe('The only way to do great work is to love what you do.')
    expect(normalized.author).toBe('Steve Jobs')
    expect(normalized.align).toBe('right')
  })

  it('provides runtime defaults in createQuoteViewModel without mutating sparse style', () => {
    const vm = createQuoteViewModel({
      content: { text: 'Test quote' },
    })

    expect(vm.text).toBe('Test quote')
    expect(vm.author).toBe('Author Name')
    expect(vm.align).toBe('center')
    expect(vm.margin).toBe('20px 0')
    expect(vm.color).toBe('#374151')
    expect(vm.fontSize).toBe('18px')
    expect(vm.hasText).toBe(true)
    expect(vm.hasAuthor).toBe(true)
  })

  it('migrates legacy flat quote props to canonical version 1 structure non-destructively', () => {
    const result = migrateLayoutInput({
      id: 'test-page',
      sections: [
        {
          id: 'sec-1',
          type: 'hero',
          rows: [
            {
              id: 'row-1',
              columns: [
                {
                  id: 'col-1',
                  components: [
                    {
                      id: 'qt-1',
                      type: 'quote',
                      props: {
                        text: 'Stay hungry, stay foolish.',
                        author: 'Steve Jobs',
                        align: 'center',
                        color: '#4f46e5',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    })

    const comp = (result.value as any).sections[0].rows[0].columns[0].components[0]
    expect(comp.props.version).toBe(1)
    expect(comp.props.content?.text).toBe('Stay hungry, stay foolish.')
    expect(comp.props.content?.author).toBe('Steve Jobs')
    expect(comp.props.style?.align).toBe('center')
    expect(comp.props.style?.color).toBe('#4f46e5')
    expect(comp.props.text).toBe('Stay hungry, stay foolish.')
    expect(comp.props.author).toBe('Steve Jobs')
  })
})
