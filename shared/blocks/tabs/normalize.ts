import { defaultTabsProps } from './defaults'
import type {
  CanonicalTabsAria,
  CanonicalTabsContent,
  CanonicalTabsResponsive,
  CanonicalTabsStyle,
  LegacyTabItem,
  LegacyTabsProps,
  TabItem,
  TabsAriaGroup,
  TabsBlock,
  TabsInput,
  TabsStyleGroup,
} from './types'

function asString(value: unknown, fallback: string): string {
  const normalized = String(value ?? '').trim()
  return normalized || fallback
}

function asStringOrUndefined(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined
  const str = String(value).trim()
  return str.length > 0 ? str : undefined
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
  const contentInput = (input as any).content && typeof (input as any).content === 'object' ? (input as any).content : {}
  const styleInput = (input as any).style && typeof (input as any).style === 'object' ? (input as any).style : {}
  const ariaInput = (input as any).aria && typeof (input as any).aria === 'object' ? (input as any).aria : {}
  const responsiveInput = (input as any).responsive && typeof (input as any).responsive === 'object' ? (input as any).responsive : {}

  const rawTabs = Array.isArray(contentInput.tabs)
    ? contentInput.tabs
    : Array.isArray(input.tabs)
      ? input.tabs
      : Array.isArray(legacy.tabs)
        ? legacy.tabs
        : undefined

  const sourceTabs = rawTabs !== undefined ? rawTabs : defaultTabsProps.tabs
  const tabs = sourceTabs.length
    ? sourceTabs.map((tab: any, index: number) => normalizeTabItem(tab, index))
    : defaultTabsProps.tabs.map((tab, index) => normalizeTabItem(tab, index))

  const rawActive = contentInput.activeTab ?? input.activeTab ?? legacy.activeTab
  const requestedActive = asNumber(rawActive, defaultTabsProps.activeTab)
  const safeActive = Math.max(0, Math.min(requestedActive, Math.max(tabs.length - 1, 0)))

  const content: CanonicalTabsContent = {}
  if (rawTabs !== undefined) content.tabs = tabs
  if (rawActive !== undefined) content.activeTab = safeActive

  const style: CanonicalTabsStyle = {}
  if (asStringOrUndefined(styleInput.width ?? legacy.width) !== undefined) style.width = asStringOrUndefined(styleInput.width ?? legacy.width)
  if (asStringOrUndefined(styleInput.tabGap ?? legacy.tabGap) !== undefined) style.tabGap = asStringOrUndefined(styleInput.tabGap ?? legacy.tabGap)
  if (asStringOrUndefined(styleInput.tabPadding ?? legacy.tabPadding) !== undefined) style.tabPadding = asStringOrUndefined(styleInput.tabPadding ?? legacy.tabPadding)
  if (asStringOrUndefined(styleInput.contentPadding ?? legacy.contentPadding) !== undefined) style.contentPadding = asStringOrUndefined(styleInput.contentPadding ?? legacy.contentPadding)
  if (asStringOrUndefined(styleInput.borderColor ?? legacy.borderColor) !== undefined) style.borderColor = asStringOrUndefined(styleInput.borderColor ?? legacy.borderColor)
  if (asStringOrUndefined(styleInput.activeBorderColor ?? legacy.activeBorderColor) !== undefined) style.activeBorderColor = asStringOrUndefined(styleInput.activeBorderColor ?? legacy.activeBorderColor)
  if (asStringOrUndefined(styleInput.activeTextColor ?? legacy.activeTextColor) !== undefined) style.activeTextColor = asStringOrUndefined(styleInput.activeTextColor ?? legacy.activeTextColor)
  if (asStringOrUndefined(styleInput.inactiveTextColor ?? legacy.inactiveTextColor) !== undefined) style.inactiveTextColor = asStringOrUndefined(styleInput.inactiveTextColor ?? legacy.inactiveTextColor)
  if (asStringOrUndefined(styleInput.activeFontWeight ?? legacy.activeFontWeight) !== undefined) style.activeFontWeight = asStringOrUndefined(styleInput.activeFontWeight ?? legacy.activeFontWeight)
  if (asStringOrUndefined(styleInput.inactiveFontWeight ?? legacy.inactiveFontWeight) !== undefined) style.inactiveFontWeight = asStringOrUndefined(styleInput.inactiveFontWeight ?? legacy.inactiveFontWeight)

  const aria: CanonicalTabsAria = {}
  if (asStringOrUndefined(ariaInput.label ?? legacy.label) !== undefined) aria.label = asStringOrUndefined(ariaInput.label ?? legacy.label)
  if (asStringOrUndefined(ariaInput.ariaLabel ?? legacy.ariaLabel ?? legacy.label) !== undefined) aria.ariaLabel = asStringOrUndefined(ariaInput.ariaLabel ?? legacy.ariaLabel ?? legacy.label)
  if (asStringOrUndefined(ariaInput.className ?? legacy.className) !== undefined) aria.className = asStringOrUndefined(ariaInput.className ?? legacy.className)
  if (asStringOrUndefined(ariaInput.customId ?? legacy.customId) !== undefined) aria.customId = asStringOrUndefined(ariaInput.customId ?? legacy.customId)

  const responsive: CanonicalTabsResponsive = {
    desktop: responsiveInput.desktop && typeof responsiveInput.desktop === 'object' ? responsiveInput.desktop : {},
    tablet: responsiveInput.tablet && typeof responsiveInput.tablet === 'object' ? responsiveInput.tablet : {},
    mobile: responsiveInput.mobile && typeof responsiveInput.mobile === 'object' ? responsiveInput.mobile : {},
  }

  const resolvedStyleGroup: TabsStyleGroup = {
    width: style.width ?? defaultTabsProps.style.width,
    tabGap: style.tabGap ?? defaultTabsProps.style.tabGap,
    tabPadding: style.tabPadding ?? defaultTabsProps.style.tabPadding,
    contentPadding: style.contentPadding ?? defaultTabsProps.style.contentPadding,
    borderColor: style.borderColor ?? defaultTabsProps.style.borderColor,
    activeBorderColor: style.activeBorderColor ?? defaultTabsProps.style.activeBorderColor,
    activeTextColor: style.activeTextColor ?? defaultTabsProps.style.activeTextColor,
    inactiveTextColor: style.inactiveTextColor ?? defaultTabsProps.style.inactiveTextColor,
    activeFontWeight: style.activeFontWeight ?? defaultTabsProps.style.activeFontWeight,
    inactiveFontWeight: style.inactiveFontWeight ?? defaultTabsProps.style.inactiveFontWeight,
  }

  const resolvedAriaGroup: TabsAriaGroup = {
    label: aria.label ?? defaultTabsProps.aria.label,
    ariaLabel: aria.ariaLabel ?? defaultTabsProps.aria.ariaLabel,
    className: aria.className ?? defaultTabsProps.aria.className,
    customId: aria.customId ?? defaultTabsProps.aria.customId,
  }

  return {
    type: 'tabs',
    schemaVersion: 1,
    version: 1,
    content,
    style: resolvedStyleGroup,
    aria: resolvedAriaGroup,
    responsive,
    tabs,
    activeTab: safeActive,
  }
}
