import { normalizeAdvancedAccordion } from '../../../../shared/blocks/advancedaccordion/normalize'
import { createAdvancedAccordionViewModel } from '../../../../shared/blocks/advancedaccordion/viewModel'
import { migrateLayoutInput } from '../../../../shared/page/migrateLayoutInput'

describe('AdvancedAccordion Canonical Normalizer & ViewModel', () => {
  it('normalizes advancedaccordion with version: 1, structured content and interaction', () => {
    const normalized = normalizeAdvancedAccordion({
      content: {
        items: [
          { id: 'item-1', title: 'Question 1', content: 'Answer 1', visible: true },
          { id: 'item-2', title: 'Question 2', content: 'Answer 2', visible: true },
        ],
      },
      interaction: {
        behavior: 'multiple',
        allowAllClosed: false,
        iconPosition: 'left',
      },
      style: {
        titleColor: '#ff0000',
        borderRadius: '8px',
      },
    })

    expect(normalized.version).toBe(1)
    expect(normalized.type).toBe('advancedaccordion')
    expect(normalized.schemaVersion).toBe(1)
    expect(normalized.content?.items).toHaveLength(2)
    expect(normalized.content?.items?.[0]?.title).toBe('Question 1')
    expect(normalized.items).toHaveLength(2)
    expect(normalized.interaction.behavior).toBe('multiple')
    expect(normalized.interaction.allowAllClosed).toBe(false)
    expect(normalized.interaction.iconPosition).toBe('left')
    expect(normalized.style.titleColor).toBe('#ff0000')
    expect(normalized.style.borderRadius).toBe('8px')
  })

  it('normalizes legacy flat advancedaccordion props gracefully', () => {
    const normalized = normalizeAdvancedAccordion({
      items: [
        { id: 'acc-1', title: 'Old Q1', content: 'Old A1' },
      ],
      behavior: 'single',
      allowAllClosed: true,
      titleColor: '#00ff00',
      titleFontSize: '18px',
    } as any)

    expect(normalized.version).toBe(1)
    expect(normalized.items).toHaveLength(1)
    expect(normalized.items[0].title).toBe('Old Q1')
    expect(normalized.content?.items?.[0]?.title).toBe('Old Q1')
    expect(normalized.interaction.behavior).toBe('single')
    expect(normalized.interaction.allowAllClosed).toBe(true)
    expect(normalized.style.titleColor).toBe('#00ff00')
    expect(normalized.style.titleFontSize).toBe('18px')
  })

  it('creates view model from canonical input', () => {
    const vm = createAdvancedAccordionViewModel({
      content: {
        items: [
          { id: '1', title: 'First', content: 'First content', visible: true },
          { id: '2', title: 'Second', content: 'Hidden content', visible: false },
        ],
      },
      interaction: {
        behavior: 'multiple',
        iconPosition: 'right',
      },
      style: {
        titleColor: '#123456',
        borderRadius: '12px',
      },
    })

    expect(vm.items).toHaveLength(1)
    expect(vm.items[0].title).toBe('First')
    expect(vm.behavior).toBe('multiple')
    expect(vm.iconPosition).toBe('right')
    expect(vm.headerStyle.color).toBe('#123456')
    expect(vm.itemStyle.borderRadius).toBe('12px')
  })

  it('migrates legacy flat advancedaccordion props to canonical version 1', () => {
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
                      id: 'acc-1',
                      type: 'advancedaccordion',
                      props: {
                        items: [
                          { id: 'item-1', title: 'FAQ 1', content: 'FAQ 1 Answer' },
                        ],
                        behavior: 'multiple',
                        allowAllClosed: false,
                        iconPosition: 'left',
                        titleColor: '#ffffff',
                        titleBackground: '#222222',
                        borderRadius: '6px',
                        padding: '16px',
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

    const accBlock = (result.value as any).sections[0].rows[0].columns[0].components[0]
    expect(accBlock.props.version).toBe(1)
    expect(accBlock.props.content.items).toHaveLength(1)
    expect(accBlock.props.content.items[0].title).toBe('FAQ 1')
    expect(accBlock.props.interaction.behavior).toBe('multiple')
    expect(accBlock.props.interaction.allowAllClosed).toBe(false)
    expect(accBlock.props.interaction.iconPosition).toBe('left')
    expect(accBlock.props.style.titleColor).toBe('#ffffff')
    expect(accBlock.props.style.titleBackground).toBe('#222222')
    expect(accBlock.props.style.borderRadius).toBe('6px')
    expect(accBlock.props.style.padding).toBe('16px')

    const migrationEntry = result.migrations.find(
      (m: any) => m.migration === 'advancedaccordion_legacy_to_canonical',
    )
    expect(migrationEntry).toBeDefined()
  })
})
