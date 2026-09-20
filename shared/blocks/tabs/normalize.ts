import { defaultTabsProps } from './defaults'
import type { LegacyTabItem, LegacyTabsProps, TabItem, TabsBlock, TabsInput } from './types'

function asString(value: unknown, fallback: string): string {
  const normalized = String(value ?? '').trim()
  return normalized || fallback
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  if (value === undefined || value === null) return fallback
  if (typeof value === 'boolean') return value
  const normalized = String(value).trim().toLowerCase()
  if (['true', '1', 'yes', 'on'].includes(normalized)) return true
  if (['false', '0', 'no', 'off'].includes(normalized)) return false
  return fallback
}

function asNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const parsed = Number.parseInt(String(value ?? '').trim(), 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

function createTabId(index: number): string {
  return `tab-${index + 1}`
}

function normalizeTabItem(tab: TabItem | LegacyTabItem | undefined, index: number): TabItem {
  const fallback = defaultTabsProps.tabs[index] || defaultTabsProps.tabs[0]
  const title = asString(tab?.title, `Tab ${index + 1}`)
  return {
    id: asString(tab?.id, createTabId(index)),
    title,
    content: asString(tab?.content, fallback?.content || ''),
    description: asString(tab?.description, ''),
    components: Array.isArray(tab?.components) ? tab!.components! : [],
    visible: asBoolean(tab?.visible, true),
    disabled: asBoolean(tab?.disabled, false),
  }
}

export function normalizeTabs(input: TabsInput = {}): TabsBlock {
  const legacy = input as LegacyTabsProps
  const sourceTabs = Array.isArray(input.tabs) ? input.tabs : defaultTabsProps.tabs
  const tabs = sourceTabs.length ? sourceTabs.map((tab, index) => normalizeTabItem(tab, index)) : defaultTabsProps.tabs.map((tab, index) => normalizeTabItem(tab, index))

  const requestedActive = asNumber(input.activeTab ?? legacy.activeTab, defaultTabsProps.activeTab)
  const safeActive = Math.max(0, Math.min(requestedActive, Math.max(tabs.length - 1, 0)))

  return {
    type: 'tabs',
    schemaVersion: 1,
    tabs,
    activeTab: safeActive,
    style: {
      width: asString(input.style?.width ?? legacy.width, defaultTabsProps.style.width),
      tabGap: asString(input.style?.tabGap ?? legacy.tabGap, defaultTabsProps.style.tabGap),
      tabPadding: asString(input.style?.tabPadding ?? legacy.tabPadding, defaultTabsProps.style.tabPadding),
      contentPadding: asString(input.style?.contentPadding ?? legacy.contentPadding, defaultTabsProps.style.contentPadding),
      borderColor: asString(input.style?.borderColor ?? legacy.borderColor, defaultTabsProps.style.borderColor),
      activeBorderColor: asString(input.style?.activeBorderColor ?? legacy.activeBorderColor, defaultTabsProps.style.activeBorderColor),
      activeTextColor: asString(input.style?.activeTextColor ?? legacy.activeTextColor, defaultTabsProps.style.activeTextColor),
      inactiveTextColor: asString(input.style?.inactiveTextColor ?? legacy.inactiveTextColor, defaultTabsProps.style.inactiveTextColor),
      activeFontWeight: asString(input.style?.activeFontWeight ?? legacy.activeFontWeight, defaultTabsProps.style.activeFontWeight),
      inactiveFontWeight: asString(input.style?.inactiveFontWeight ?? legacy.inactiveFontWeight, defaultTabsProps.style.inactiveFontWeight),
    },
    aria: {
      label: asString(input.aria?.label ?? legacy.label, defaultTabsProps.aria.label),
      ariaLabel: asString(input.aria?.ariaLabel ?? legacy.ariaLabel ?? legacy.label, defaultTabsProps.aria.ariaLabel),
      className: asString(input.aria?.className ?? legacy.className, defaultTabsProps.aria.className),
      customId: asString(input.aria?.customId ?? legacy.customId, defaultTabsProps.aria.customId),
    },
  }
}
