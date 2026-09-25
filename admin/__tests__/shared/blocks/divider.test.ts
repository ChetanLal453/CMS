import { normalizeDivider } from '../../../../shared/blocks/divider/normalize'
import { createDividerViewModel } from '../../../../shared/blocks/divider/viewModel'
import { migrateLayoutInput } from '../../../../shared/page/migrateLayoutInput'

describe('Divider Canonical Normalizer & ViewModel', () => {
  it('normalizes divider sparsely without eager style defaults', () => {
    const normalized = normalizeDivider({})

    expect(normalized.version).toBe(1)
    expect(normalized.style?.thickness).toBeUndefined()
    expect(normalized.style?.color).toBeUndefined()
    expect(normalized.style?.width).toBeUndefined()
    expect(normalized.style?.margin).toBeUndefined()
    expect(normalized.style?.className).toBeUndefined()
  })

  it('preserves explicitly configured style properties', () => {
    const normalized = normalizeDivider({
      style: {
        thickness: '2px',
        color: '#ff0000',
        width: '80%',
        margin: '30px auto',
      },
    })

    expect(normalized.version).toBe(1)
    expect(normalized.style?.thickness).toBe('2px')
    expect(normalized.style?.color).toBe('#ff0000')
    expect(normalized.style?.width).toBe('80%')
    expect(normalized.style?.margin).toBe('30px auto')
    expect(normalized.thickness).toBe('2px')
    expect(normalized.color).toBe('#ff0000')
    expect(normalized.width).toBe('80%')
    expect(normalized.margin).toBe('30px auto')
  })

  it('provides runtime defaults in createDividerViewModel without mutating sparse style', () => {
    const vm = createDividerViewModel({})

    expect(vm.thickness).toBe('1px')
    expect(vm.color).toBe('#cccccc')
    expect(vm.width).toBe('100%')
    expect(vm.margin).toBe('20px 0')
  })

  it('migrates legacy flat divider props to canonical version 1 structure non-destructively', () => {
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
                      id: 'div-1',
                      type: 'divider',
                      props: {
                        thickness: '3px',
                        color: '#4f46e5',
                        width: '50%',
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
    expect(comp.props.style?.thickness).toBe('3px')
    expect(comp.props.style?.color).toBe('#4f46e5')
    expect(comp.props.style?.width).toBe('50%')
    expect(comp.props.thickness).toBe('3px')
    expect(comp.props.color).toBe('#4f46e5')
    expect(comp.props.width).toBe('50%')
  })
})
