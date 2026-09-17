import { defaultTabsProps } from './defaults'
import { normalizeTabs } from './normalize'
import { createTabsViewModel } from './viewModel'

export type { LegacyTabItem, LegacyTabsProps, TabItem, TabsBlock, TabsInput, TabsStyleGroup, TabsViewModel } from './types'

export { createTabsViewModel } from './viewModel'

export const tabsContract = {
  defaultProps: defaultTabsProps,
  schema: {
    title: 'Tabs',
    properties: {
      tabs: {
        type: 'list-items',
        label: 'Tabs',
        default: defaultTabsProps.tabs,
      },
      activeTab: {
        type: 'number',
        label: 'Active Tab',
        default: defaultTabsProps.activeTab,
        min: 0,
        max: 20,
      },
      ariaLabel: {
        type: 'text',
        label: 'ARIA Label',
        default: defaultTabsProps.aria.ariaLabel,
      },
      className: {
        type: 'text',
        label: 'CSS Class',
        default: defaultTabsProps.aria.className,
      },
      customId: {
        type: 'text',
        label: 'Custom ID',
        default: defaultTabsProps.aria.customId,
      },
    },
  },
  normalize: normalizeTabs,
  createViewModel: createTabsViewModel,
}
