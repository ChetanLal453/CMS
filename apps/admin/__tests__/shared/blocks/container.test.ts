import { normalizeContainer } from '@uadmin/shared/blocks/container/normalize'
import { createContainerViewModel } from '@uadmin/shared/blocks/container/viewModel'
import { migrateLayoutInput } from '@uadmin/shared/page/migrateLayoutInput'

describe('Container Canonical Normalizer & ViewModel', () => {
  it('normalizes container sparsely without eagerly injecting defaults into style overrides', () => {
    const normalized = normalizeContainer({
      style: { maxWidth: '1200px' },
    })

    expect(normalized.version).toBe(1)
    expect(normalized.style?.maxWidth).toBe('1200px')
    expect(normalized.style?.padding).toBeUndefined()
    expect(normalized.style?.margin).toBeUndefined()
    expect(normalized.style?.backgroundColor).toBeUndefined()
    expect(normalized.style?.borderRadius).toBeUndefined()
    expect(normalized.style?.border).toBeUndefined()
    expect(normalized.style?.shadow).toBeUndefined()
  })

  it('preserves explicit style overrides', () => {
    const normalized = normalizeContainer({
      style: {
        maxWidth: '800px',
        padding: '30px',
        margin: '10px auto',
        backgroundColor: '#1a1a2e',
        borderRadius: '12px',
        border: '1px solid #333',
      },
    })

    expect(normalized.style?.maxWidth).toBe('800px')
    expect(normalized.style?.padding).toBe('30px')
    expect(normalized.style?.margin).toBe('10px auto')
    expect(normalized.style?.backgroundColor).toBe('#1a1a2e')
    expect(normalized.style?.borderRadius).toBe('12px')
    expect(normalized.style?.border).toBe('1px solid #333')
  })

  it('viewModel resolves default display fallbacks when properties are sparse', () => {
    const vm = createContainerViewModel({
      style: { backgroundColor: '#ff0000' },
    })

    expect(vm.backgroundColor).toBe('#ff0000')
    expect(vm.maxWidth).toBe('960px') // default display fallback
    expect(vm.padding).toBe('20px') // default display fallback
    expect(vm.margin).toBe('0 auto') // default display fallback
    expect(vm.width).toBe('100%')
  })

  it('migrates legacy flat container props to canonical version 1 structure non-destructively', () => {
    const result = migrateLayoutInput({
      id: 'test-page',
      sections: [
        {
          id: 'sec-1',
          type: 'features',
          rows: [
            {
              id: 'row-1',
              columns: [
                {
                  id: 'col-1',
                  components: [
                    {
                      id: 'cont-1',
                      type: 'container',
                      props: {
                        maxWidth: '1024px',
                        padding: '16px',
                        backgroundColor: '#202030',
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
    expect(comp.props.style?.maxWidth).toBe('1024px')
    expect(comp.props.style?.padding).toBe('16px')
    expect(comp.props.style?.backgroundColor).toBe('#202030')
    // Legacy flat properties preserved non-destructively
    expect(comp.props.maxWidth).toBe('1024px')
    expect(comp.props.padding).toBe('16px')
    expect(comp.props.backgroundColor).toBe('#202030')
  })
})
