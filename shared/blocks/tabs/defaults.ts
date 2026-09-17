import type { TabsBlock } from './types'

export const defaultTabsProps: TabsBlock = {
  type: 'tabs',
  schemaVersion: 1,
  tabs: [
    { id: 'tab-1', title: 'Tab 1', content: 'Content for tab 1', description: '', components: [], visible: true, disabled: false },
    { id: 'tab-2', title: 'Tab 2', content: 'Content for tab 2', description: '', components: [], visible: true, disabled: false },
  ],
  activeTab: 0,
  style: {
    width: '100%',
    tabGap: '8px',
    tabPadding: '12px 16px',
    contentPadding: '20px 0',
    borderColor: '#d1d5db',
    activeBorderColor: '#111827',
    activeTextColor: '#111827',
    inactiveTextColor: '#6b7280',
    activeFontWeight: '600',
    inactiveFontWeight: '500',
  },
  aria: {
    label: 'Tabs',
    ariaLabel: 'Tabs',
    className: '',
    customId: '',
  },
}
