import { normalizeFlexbox } from '@uadmin/shared/blocks/flexbox/normalize'
import { createFlexboxViewModel } from '@uadmin/shared/blocks/flexbox/viewModel'
import { migrateLayoutInput } from '@uadmin/shared/page/migrateLayoutInput'

describe('Flexbox Canonical Normalizer & ViewModel', () => {
  it('normalizes flexbox sparsely without eager style defaults', () => {
    const normalized = normalizeFlexbox({
      style: {
        direction: 'column',
        gap: '24px',
      },
    })

    expect(normalized.version).toBe(1)
    expect(normalized.style?.direction).toBe('column')
    expect(normalized.style?.gap).toBe('24px')
    expect(normalized.style?.justifyContent).toBeUndefined()
    expect(normalized.style?.alignItems).toBeUndefined()
    expect(normalized.style?.padding).toBeUndefined()
    expect(normalized.style?.backgroundColor).toBeUndefined()
    expect(normalized.style?.borderRadius).toBeUndefined()
    expect(normalized.style?.border).toBeUndefined()
    expect(normalized.style?.shadow).toBeUndefined()
    expect(normalized.style?.width).toBeUndefined()
    expect(normalized.style?.maxWidth).toBeUndefined()
    expect(normalized.style?.className).toBeUndefined()
  })

  it('preserves explicitly configured properties, preset and children', () => {
    const customChildren = [
      { id: 'child-1', type: 'button', props: { text: 'Click' } },
      { id: 'child-2', type: 'image', props: { src: '/img.png' } },
    ]

    const normalized = normalizeFlexbox({
      content: {
        children: customChildren,
        preset: 'navbar',
      },
      style: {
        direction: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px',
        backgroundColor: '#112233',
        borderRadius: '12px',
        shadow: 'md',
      },
      responsive: {
        stackOnMobile: false,
        directionMobile: 'row',
        mobileGap: '8px',
      },
    })

    expect(normalized.version).toBe(1)
    expect(normalized.content?.children).toHaveLength(2)
    expect(normalized.content?.preset).toBe('navbar')
    expect(normalized.style?.direction).toBe('row')
    expect(normalized.style?.justifyContent).toBe('space-between')
    expect(normalized.style?.padding).toBe('20px')
    expect(normalized.style?.backgroundColor).toBe('#112233')
    expect(normalized.style?.borderRadius).toBe('12px')
    expect(normalized.style?.shadow).toBe('md')
    expect(normalized.responsive?.stackOnMobile).toBe(false)
    expect(normalized.responsive?.directionMobile).toBe('row')
    expect(normalized.responsive?.mobileGap).toBe('8px')

    // Top-level compatibility properties
    expect(normalized.direction).toBe('row')
    expect(normalized.justifyContent).toBe('space-between')
    expect(normalized.children).toHaveLength(2)
  })

  it('resolves runtime viewModel with shadow mapping and transparent default bg', () => {
    const vm = createFlexboxViewModel({
      style: {
        shadow: 'lg',
        borderRadius: '16px',
        border: '1px solid #ffffff',
        maxWidth: '1200px',
      },
    })

    expect(vm.boxShadow).toBe('0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)')
    expect(vm.borderRadius).toBe('16px')
    expect(vm.border).toBe('1px solid #ffffff')
    expect(vm.maxWidth).toBe('1200px')
    expect(vm.backgroundColor).toBe('transparent')
  })

  it('migrates legacy flexbox props and recursively migrates nested children', () => {
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
                      id: 'flex-1',
                      type: 'flexbox',
                      props: {
                        direction: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '20px',
                        padding: '30px',
                        stackOnMobile: true,
                        children: [
                          {
                            id: 'btn-nested',
                            type: 'button',
                            props: {
                              text: 'Explore',
                              variant: 'secondary',
                              link: '/explore',
                            },
                          },
                        ],
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

    const flexComp = (result.value as any).sections[0].rows[0].columns[0].components[0]
    expect(flexComp.props.version).toBe(1)
    expect(flexComp.props.style?.direction).toBe('column')
    expect(flexComp.props.style?.justifyContent).toBe('center')
    expect(flexComp.props.style?.alignItems).toBe('center')
    expect(flexComp.props.style?.gap).toBe('20px')
    expect(flexComp.props.style?.padding).toBe('30px')
    expect(flexComp.props.responsive?.stackOnMobile).toBe(true)

    // Verify nested child block was recursively migrated
    const nestedBtn = flexComp.props.content?.children?.[0]
    expect(nestedBtn).toBeDefined()
    expect(nestedBtn.props.version).toBe(1)
    expect(nestedBtn.props.content?.text).toBe('Explore')
    expect(nestedBtn.props.content?.link).toBe('/explore')
    expect(nestedBtn.props.style?.variant).toBe('secondary')
  })
})
