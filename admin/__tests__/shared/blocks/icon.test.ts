import { normalizeIcon } from '../../../../shared/blocks/icon/normalize'
import { createIconViewModel } from '../../../../shared/blocks/icon/viewModel'
import { migrateLayoutInput } from '../../../../shared/page/migrateLayoutInput'

describe('Icon Canonical Normalizer & ViewModel', () => {
  it('normalizes icon sparsely without eager style defaults', () => {
    const normalized = normalizeIcon({
      content: { name: 'heart' },
    })

    expect(normalized.version).toBe(1)
    expect(normalized.content?.name).toBe('heart')
    expect(normalized.content?.icon).toBe('heart')
    expect(normalized.style?.color).toBeUndefined()
    expect(normalized.style?.size).toBeUndefined()
    expect(normalized.style?.className).toBeUndefined()
    expect(normalized.name).toBe('heart')
  })

  it('preserves explicitly configured content and style properties', () => {
    const normalized = normalizeIcon({
      content: { name: 'shield' },
      style: {
        size: '32px',
        color: '#ff5500',
        className: 'my-icon',
      },
    })

    expect(normalized.version).toBe(1)
    expect(normalized.content?.name).toBe('shield')
    expect(normalized.style?.size).toBe('32px')
    expect(normalized.style?.color).toBe('#ff5500')
    expect(normalized.style?.className).toBe('my-icon')
    expect(normalized.size).toBe('32px')
    expect(normalized.color).toBe('#ff5500')
  })

  it('provides runtime defaults in createIconViewModel without mutating sparse style', () => {
    const vm = createIconViewModel({
      content: { name: 'bell' },
    })

    expect(vm.iconName).toBe('bell')
    expect(vm.size).toBe('24px')
    expect(vm.numericSize).toBe(24)
    expect(vm.color).toBe('#000000')
  })

  it('migrates legacy flat icon props to canonical version 1 structure non-destructively', () => {
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
                      id: 'ic-1',
                      type: 'icon',
                      props: {
                        name: 'check-circle',
                        size: '40px',
                        color: '#3ecf8e',
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
    expect(comp.props.content?.name).toBe('check-circle')
    expect(comp.props.style?.size).toBe('40px')
    expect(comp.props.style?.color).toBe('#3ecf8e')
    expect(comp.props.name).toBe('check-circle')
    expect(comp.props.color).toBe('#3ecf8e')
  })
})
