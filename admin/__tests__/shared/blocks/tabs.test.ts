import { normalizeTabs } from '../../../../shared/blocks/tabs/normalize'
import { createTabsViewModel } from '../../../../shared/blocks/tabs/viewModel'
import { migrateLayoutInput } from '../../../../shared/page/migrateLayoutInput'

describe('Tabs Canonical Normalizer & ViewModel', () => {
  it('normalizes tabs with version: 1, structured content, style and aria', () => {
    const normalized = normalizeTabs({
      content: {
        tabs: [
          { id: 'tab-overview', title: 'Overview', content: 'Overview content', components: [], visible: true },
          { id: 'tab-specs', title: 'Specifications', content: 'Specs content', components: [], visible: true },
        ],
        activeTab: 1,
      },
      style: {
        width: '80%',
        tabGap: '16px',
        activeTextColor: '#3b82f6',
      },
      aria: {
        label: 'Product Details Tabs',
        className: 'custom-tabs-container',
      },
    })

    expect(normalized.version).toBe(1)
    expect(normalized.type).toBe('tabs')
    expect(normalized.schemaVersion).toBe(1)
    expect(normalized.content?.tabs).toHaveLength(2)
    expect(normalized.content?.tabs?.[0]?.title).toBe('Overview')
    expect(normalized.content?.activeTab).toBe(1)
    expect(normalized.tabs).toHaveLength(2)
    expect(normalized.activeTab).toBe(1)
    expect(normalized.style.width).toBe('80%')
    expect(normalized.style.tabGap).toBe('16px')
    expect(normalized.style.activeTextColor).toBe('#3b82f6')
    expect(normalized.aria.label).toBe('Product Details Tabs')
    expect(normalized.aria.className).toBe('custom-tabs-container')
  })

  it('normalizes legacy flat tabs props gracefully', () => {
    const normalized = normalizeTabs({
      tabs: [
        { id: 'old-1', title: 'Old Tab 1', content: 'Old Content' },
      ],
      activeTab: 0,
      width: '100%',
      activeTextColor: '#10b981',
      label: 'Legacy Tabs',
    } as any)

    expect(normalized.version).toBe(1)
    expect(normalized.tabs).toHaveLength(1)
    expect(normalized.tabs[0].title).toBe('Old Tab 1')
    expect(normalized.content?.tabs?.[0]?.title).toBe('Old Tab 1')
    expect(normalized.content?.activeTab).toBe(0)
    expect(normalized.style.width).toBe('100%')
    expect(normalized.style.activeTextColor).toBe('#10b981')
    expect(normalized.aria.label).toBe('Legacy Tabs')
  })

  it('creates view model from canonical input', () => {
    const vm = createTabsViewModel({
      content: {
        tabs: [
          { id: 'tab-1', title: 'Tab One', content: 'First' },
          { id: 'tab-2', title: 'Tab Two', content: 'Second' },
        ],
        activeTab: 1,
      },
      style: {
        width: '90%',
        tabGap: '12px',
        activeTextColor: '#ff0077',
      },
      aria: {
        ariaLabel: 'Accessible Tabs',
      },
    })

    expect(vm.tabs).toHaveLength(2)
    expect(vm.activeIndex).toBe(1)
    expect(vm.activeTab?.title).toBe('Tab Two')
    expect(vm.resolvedAriaLabel).toBe('Accessible Tabs')
    expect(vm.containerStyle.width).toBe('90%')
    expect(vm.activeTabButtonStyle.color).toBe('#ff0077')
  })

  it('migrates legacy flat tabs props to canonical version 1 and recursively migrates child components', () => {
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
                      id: 'tabs-1',
                      type: 'tabs',
                      props: {
                        tabs: [
                          {
                            id: 'tab-1',
                            title: 'Nested Blocks Tab',
                            content: '',
                            components: [
                              {
                                id: 'btn-nested',
                                type: 'button',
                                props: {
                                  label: 'Nested Button',
                                  variant: 'primary',
                                  href: '/explore',
                                },
                              },
                            ],
                          },
                        ],
                        activeTab: 0,
                        width: '75%',
                        tabGap: '14px',
                        activeTextColor: '#6366f1',
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

    const tabsBlock = (result.value as any).sections[0].rows[0].columns[0].components[0]
    expect(tabsBlock.props.version).toBe(1)
    expect(tabsBlock.props.content.tabs).toHaveLength(1)
    expect(tabsBlock.props.content.tabs[0].title).toBe('Nested Blocks Tab')
    expect(tabsBlock.props.content.activeTab).toBe(0)
    expect(tabsBlock.props.style.width).toBe('75%')
    expect(tabsBlock.props.style.tabGap).toBe('14px')
    expect(tabsBlock.props.style.activeTextColor).toBe('#6366f1')

    // Verify nested child block inside tab was recursively migrated
    const nestedChild = tabsBlock.props.content.tabs[0].components[0]
    expect(nestedChild.type).toBe('button')
    expect(nestedChild.props.version).toBe(1)
    expect(nestedChild.props.content.text).toBe('Nested Button')

    const migrationEntry = result.migrations.find(
      (m: any) => m.migration === 'tabs_legacy_to_canonical',
    )
    expect(migrationEntry).toBeDefined()
  })
})
