import { normalizeTabs } from './normalize'
import type { TabsInput, TabsViewModel } from './types'

export function createTabsViewModel(input: TabsInput = {}): TabsViewModel {
  const tabsBlock = normalizeTabs(input)
  const safeActiveIndex =
    tabsBlock.tabs.length > 0
      ? Math.max(0, Math.min(tabsBlock.activeTab, tabsBlock.tabs.length - 1))
      : 0
  const activeTab = tabsBlock.tabs.length > 0 ? tabsBlock.tabs[safeActiveIndex] : null

  return {
    tabs: tabsBlock.tabs,
    activeIndex: safeActiveIndex,
    activeTab,
    className: tabsBlock.aria.className,
    customId: tabsBlock.aria.customId,
    label: tabsBlock.aria.label,
    ariaLabel: tabsBlock.aria.ariaLabel,
    resolvedAriaLabel: tabsBlock.aria.ariaLabel || tabsBlock.aria.label,
    containerStyle: {
      width: tabsBlock.style.width,
    },
    tabListStyle: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: tabsBlock.style.tabGap,
      borderBottom: `1px solid ${tabsBlock.style.borderColor}`,
    },
    tabButtonStyle: {
      appearance: 'none',
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      padding: tabsBlock.style.tabPadding,
      borderBottom: '2px solid transparent',
      color: tabsBlock.style.inactiveTextColor,
      fontWeight: tabsBlock.style.inactiveFontWeight,
    },
    activeTabButtonStyle: {
      borderBottom: `2px solid ${tabsBlock.style.activeBorderColor}`,
      color: tabsBlock.style.activeTextColor,
      fontWeight: tabsBlock.style.activeFontWeight,
    },
    contentStyle: {
      padding: tabsBlock.style.contentPadding,
    },
  }
}
