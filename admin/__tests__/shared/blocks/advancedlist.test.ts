import { normalizeAdvancedList } from '../../../../shared/blocks/advancedlist/normalize'
import { createAdvancedListViewModel } from '../../../../shared/blocks/advancedlist/viewModel'
import { migrateLayoutInput } from '../../../../shared/page/migrateLayoutInput'

describe('AdvancedList Canonical Normalizer & ViewModel', () => {
  it('normalizes advancedlist with version: 1, content, style and responsive', () => {
    const normalized = normalizeAdvancedList({
      content: {
        items: [
          {
            id: 'item-1',
            title: 'Feature A',
            description: 'Description A',
            visible: true,
            iconType: 'emoji',
            iconEmoji: '🚀',
            iconImage: '',
            iconFontAwesome: '',
            iconNumber: 1,
            order: 1,
          },
        ],
        listType: 'icon',
      },
      style: {
        columns: 2,
        titleColor: '#123456',
      },
    })

    expect(normalized.version).toBe(1)
    expect(normalized.content?.items?.[0]?.title).toBe('Feature A')
    expect(normalized.content?.listType).toBe('icon')
    expect(normalized.style.columns).toBe(2)
    expect(normalized.style.titleColor).toBe('#123456')
    expect(normalized.items[0].title).toBe('Feature A')
    expect(normalized.listType).toBe('icon')
  })

  it('preserves explicitly configured properties in content, style and responsive', () => {
    const normalized = normalizeAdvancedList({
      content: {
        items: [
          {
            id: 'it-1',
            title: 'Item 1',
            description: 'First item',
            visible: true,
            iconType: 'number',
            iconEmoji: '',
            iconImage: '',
            iconFontAwesome: '',
            iconNumber: 1,
            order: 1,
          },
          {
            id: 'it-2',
            title: 'Item 2',
            description: 'Second item',
            visible: true,
            iconType: 'number',
            iconEmoji: '',
            iconImage: '',
            iconFontAwesome: '',
            iconNumber: 2,
            order: 2,
          },
        ],
        listType: 'numbered',
      },
      style: {
        columns: 3,
        itemSpacing: '20px',
        gap: '24px',
        alignment: 'center',
        displayStyle: 'boxed',
        titleFontSize: '20px',
        titleColor: '#0055ff',
        descriptionColor: '#778899',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        boxShadow: 'md',
      },
      responsive: {
        desktop: { columns: 3 },
        mobile: { columns: 1 },
      },
    })

    expect(normalized.version).toBe(1)
    expect(normalized.content?.listType).toBe('numbered')
    expect(normalized.content?.items?.length).toBe(2)
    expect(normalized.style.columns).toBe(3)
    expect(normalized.style.itemSpacing).toBe('20px')
    expect(normalized.style.displayStyle).toBe('boxed')
    expect(normalized.style.titleFontSize).toBe('20px')
    expect(normalized.style.titleColor).toBe('#0055ff')
    expect(normalized.responsive?.mobile).toEqual({ columns: 1 })
  })

  it('resolves runtime viewModel properly', () => {
    const vm = createAdvancedListViewModel({
      content: {
        items: [
          {
            id: 'vm-1',
            title: 'Speed Boost',
            description: 'Super fast execution',
            visible: true,
            iconType: 'emoji',
            iconEmoji: '⚡',
            iconImage: '',
            iconFontAwesome: '',
            iconNumber: 1,
            order: 1,
          },
        ],
        listType: 'icon',
      },
      style: {
        columns: 1,
        displayStyle: 'bordered',
        titleColor: '#ff0055',
      },
    })

    expect(vm.items.length).toBe(1)
    expect(vm.items[0].title).toBe('Speed Boost')
    expect(vm.items[0].resolvedIconText).toBe('⚡')
    expect(vm.listType).toBe('icon')
    expect(vm.style.displayStyle).toBe('bordered')
    expect(vm.style.titleColor).toBe('#ff0055')
    expect(vm.gridStyle.gridTemplateColumns).toBe('repeat(1, 1fr)')
  })

  it('migrates legacy flat advancedlist props to canonical version 1', () => {
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
                      id: 'list-1',
                      type: 'advancedlist',
                      props: {
                        listType: 'bullet',
                        columns: 2,
                        itemSpacing: '18px',
                        displayStyle: 'boxed',
                        titleColor: '#223344',
                        items: [
                          {
                            id: 'old-1',
                            title: 'Legacy Item 1',
                            description: 'Legacy desc',
                            visible: true,
                            iconType: 'emoji',
                            iconEmoji: '⭐',
                            iconImage: '',
                            iconFontAwesome: '',
                            iconNumber: 1,
                            order: 1,
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

    const listBlock = (result.value as any).sections[0].rows[0].columns[0].components[0]
    expect(listBlock.props.version).toBe(1)
    expect(listBlock.props.content.listType).toBe('bullet')
    expect(listBlock.props.content.items[0].title).toBe('Legacy Item 1')
    expect(listBlock.props.style.columns).toBe(2)
    expect(listBlock.props.style.itemSpacing).toBe('18px')
    expect(listBlock.props.style.displayStyle).toBe('boxed')
    expect(listBlock.props.style.titleColor).toBe('#223344')

    const migrationEntry = result.migrations.find(
      (m: any) => m.migration === 'advancedlist_legacy_to_canonical',
    )
    expect(migrationEntry).toBeDefined()
  })
})
