import { defaultTabsProps } from './defaults'
import { normalizeTabs } from './normalize'
import { createTabsViewModel } from './viewModel'

export type { LegacyTabItem, LegacyTabsProps, TabItem, TabsBlock, TabsInput, TabsStyleGroup, TabsViewModel } from './types'

export { createTabsViewModel } from './viewModel'

export const tabsContract = {
  defaultProps: defaultTabsProps,
  schema: {
    title: 'Tabs',
    categories: [
      { id: 'content', label: 'Content', expanded: true },
      { id: 'advanced', label: 'Advanced', expanded: false },
    ],
    properties: {
      tabs: {
        type: 'list-items',
        label: 'Tabs',
        default: defaultTabsProps.tabs,
        category: 'Content',
      },
      activeTab: {
        type: 'number',
        label: 'Active Tab',
        default: defaultTabsProps.activeTab,
        min: 0,
        max: 20,
        category: 'Content',
      },
      ariaLabel: {
        type: 'text',
        label: 'ARIA Label',
        default: defaultTabsProps.aria.ariaLabel,
        category: 'Advanced',
      },
      className: {
        type: 'text',
        label: 'CSS Class',
        default: defaultTabsProps.aria.className,
        category: 'Advanced',
      },
      customId: {
        type: 'text',
        label: 'Custom ID',
        default: defaultTabsProps.aria.customId,
        category: 'Advanced',
      },
    },
  },
  normalize: normalizeTabs,
  createViewModel: createTabsViewModel,
}
