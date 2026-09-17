import { defaultAdvancedAccordionProps } from './defaults'
import type {
  AdvancedAccordion,
  AdvancedAccordionAnimation,
  AdvancedAccordionBehavior,
  AdvancedAccordionIconPosition,
  AdvancedAccordionInput,
  AdvancedAccordionItem,
  LegacyAdvancedAccordionProps,
} from './types'

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
  const parsed = Number.parseFloat(String(value ?? '').trim())
  return Number.isFinite(parsed) ? parsed : fallback
}

function asBehavior(value: unknown, fallback: AdvancedAccordionBehavior): AdvancedAccordionBehavior {
  return value === 'single' || value === 'multiple' ? value : fallback
}

function asIconPosition(value: unknown, fallback: AdvancedAccordionIconPosition): AdvancedAccordionIconPosition {
  return value === 'left' || value === 'right' ? value : fallback
}

function asAnimation(value: unknown, fallback: AdvancedAccordionAnimation): AdvancedAccordionAnimation {
  return value === 'slide' || value === 'fade' || value === 'none' ? value : fallback
}

function normalizeItem(item: Partial<AdvancedAccordionItem> | undefined, index: number): AdvancedAccordionItem {
  const fallback = defaultAdvancedAccordionProps.items[index] || defaultAdvancedAccordionProps.items[0]
  return {
    id: asString(item?.id, `${index + 1}`),
    title: asString(item?.title, fallback?.title || `Accordion Item ${index + 1}`),
    content: asString(item?.content, fallback?.content || ''),
    visible: asBoolean(item?.visible, true),
  }
}

export function normalizeAdvancedAccordion(input: AdvancedAccordionInput = {}): AdvancedAccordion {
  const legacy = input as LegacyAdvancedAccordionProps
  const structuredStyle = input.style || {}
  const structuredInteraction = input.interaction || {}
  const sourceItems = Array.isArray(input.items) ? input.items : Array.isArray(legacy.items) ? legacy.items : defaultAdvancedAccordionProps.items
  const items = sourceItems.length ? sourceItems.map((item, index) => normalizeItem(item, index)) : defaultAdvancedAccordionProps.items.map(normalizeItem)

  return {
    type: 'advancedaccordion',
    schemaVersion: 1,
    items,
    style: {
      itemSpacing: asString(structuredStyle.itemSpacing ?? legacy.itemSpacing, defaultAdvancedAccordionProps.style.itemSpacing),
      padding: asString(structuredStyle.padding ?? legacy.padding, defaultAdvancedAccordionProps.style.padding),
      margin: asString(structuredStyle.margin ?? legacy.margin, defaultAdvancedAccordionProps.style.margin),
      titleFontSize: asString(structuredStyle.titleFontSize ?? legacy.titleFontSize, defaultAdvancedAccordionProps.style.titleFontSize),
      titleFontWeight: asString(structuredStyle.titleFontWeight ?? legacy.titleFontWeight, defaultAdvancedAccordionProps.style.titleFontWeight),
      contentFontSize: asString(structuredStyle.contentFontSize ?? legacy.contentFontSize, defaultAdvancedAccordionProps.style.contentFontSize),
      fontFamily: asString(structuredStyle.fontFamily ?? legacy.fontFamily, defaultAdvancedAccordionProps.style.fontFamily),
      lineHeight: asString(structuredStyle.lineHeight ?? legacy.lineHeight, defaultAdvancedAccordionProps.style.lineHeight),
      titleColor: asString(structuredStyle.titleColor ?? legacy.titleColor, defaultAdvancedAccordionProps.style.titleColor),
      titleBackground: asString(structuredStyle.titleBackground ?? legacy.titleBackground, defaultAdvancedAccordionProps.style.titleBackground),
      contentColor: asString(structuredStyle.contentColor ?? legacy.contentColor, defaultAdvancedAccordionProps.style.contentColor),
      contentBackground: asString(structuredStyle.contentBackground ?? legacy.contentBackground, defaultAdvancedAccordionProps.style.contentBackground),
      border: asString(structuredStyle.border ?? legacy.border, defaultAdvancedAccordionProps.style.border),
      borderRadius: asString(structuredStyle.borderRadius ?? legacy.borderRadius, defaultAdvancedAccordionProps.style.borderRadius),
      activeTitleColor: asString(structuredStyle.activeTitleColor ?? legacy.activeTitleColor, defaultAdvancedAccordionProps.style.activeTitleColor),
      activeTitleBackground: asString(structuredStyle.activeTitleBackground ?? legacy.activeTitleBackground, defaultAdvancedAccordionProps.style.activeTitleBackground),
    },
    interaction: {
      behavior: asBehavior(structuredInteraction.behavior ?? legacy.behavior, defaultAdvancedAccordionProps.interaction.behavior),
      allowAllClosed: asBoolean(structuredInteraction.allowAllClosed ?? legacy.allowAllClosed, defaultAdvancedAccordionProps.interaction.allowAllClosed),
      iconPosition: asIconPosition(structuredInteraction.iconPosition ?? legacy.iconPosition, defaultAdvancedAccordionProps.interaction.iconPosition),
      icon: asString(structuredInteraction.icon ?? legacy.icon, defaultAdvancedAccordionProps.interaction.icon),
      activeIcon: asString(structuredInteraction.activeIcon ?? legacy.activeIcon, defaultAdvancedAccordionProps.interaction.activeIcon),
      animation: asAnimation(structuredInteraction.animation ?? legacy.animation, defaultAdvancedAccordionProps.interaction.animation),
      animationDuration: asNumber(structuredInteraction.animationDuration ?? legacy.animationDuration, defaultAdvancedAccordionProps.interaction.animationDuration),
    },
  }
}
