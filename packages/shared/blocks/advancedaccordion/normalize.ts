import { defaultAdvancedAccordionProps } from './defaults'
import type {
  AdvancedAccordion,
  AdvancedAccordionAnimation,
  AdvancedAccordionBehavior,
  AdvancedAccordionIconPosition,
  AdvancedAccordionInput,
  AdvancedAccordionInteractionGroup,
  AdvancedAccordionItem,
  AdvancedAccordionStyleGroup,
  CanonicalAdvancedAccordionContent,
  CanonicalAdvancedAccordionInteraction,
  CanonicalAdvancedAccordionResponsive,
  CanonicalAdvancedAccordionStyle,
  LegacyAdvancedAccordionProps,
} from './types'
import { asString, asBoolean, asNumber, isPlainObject } from '../../utils/merge'

function asStringOrUndefined(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined
  const str = String(value).trim()
  return str.length > 0 ? str : undefined
}

function asBooleanOrUndefined(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') return undefined
  return Boolean(value)
}

function asNumberOrUndefined(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined
  const num = Number(value)
  return Number.isNaN(num) ? undefined : num
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
  const contentInput = isPlainObject(input.content) ? input.content : {}
  const structuredStyle = (isPlainObject(input.style) ? input.style : {}) as Partial<AdvancedAccordionStyleGroup>
  const structuredInteraction = (isPlainObject(input.interaction) ? input.interaction : {}) as Partial<AdvancedAccordionInteractionGroup>
  const responsiveInput = isPlainObject(input.responsive) ? input.responsive : {}

  const rawItems = Array.isArray(contentInput.items)
    ? contentInput.items
    : Array.isArray(input.items)
      ? input.items
      : Array.isArray(legacy.items)
        ? legacy.items
        : undefined

  const sourceItems = rawItems !== undefined ? rawItems : defaultAdvancedAccordionProps.items
  const items = sourceItems.length
    ? sourceItems.map((item, index) => normalizeItem(item, index))
    : defaultAdvancedAccordionProps.items.map(normalizeItem)

  const content: CanonicalAdvancedAccordionContent = {}
  if (rawItems !== undefined) content.items = items

  const style: CanonicalAdvancedAccordionStyle = {}
  if (asStringOrUndefined(structuredStyle.itemSpacing ?? legacy.itemSpacing) !== undefined) style.itemSpacing = asStringOrUndefined(structuredStyle.itemSpacing ?? legacy.itemSpacing)
  if (asStringOrUndefined(structuredStyle.padding ?? legacy.padding) !== undefined) style.padding = asStringOrUndefined(structuredStyle.padding ?? legacy.padding)
  if (asStringOrUndefined(structuredStyle.margin ?? legacy.margin) !== undefined) style.margin = asStringOrUndefined(structuredStyle.margin ?? legacy.margin)
  if (asStringOrUndefined(structuredStyle.titleFontSize ?? legacy.titleFontSize) !== undefined) style.titleFontSize = asStringOrUndefined(structuredStyle.titleFontSize ?? legacy.titleFontSize)
  if (asStringOrUndefined(structuredStyle.titleFontWeight ?? legacy.titleFontWeight) !== undefined) style.titleFontWeight = asStringOrUndefined(structuredStyle.titleFontWeight ?? legacy.titleFontWeight)
  if (asStringOrUndefined(structuredStyle.contentFontSize ?? legacy.contentFontSize) !== undefined) style.contentFontSize = asStringOrUndefined(structuredStyle.contentFontSize ?? legacy.contentFontSize)
  if (asStringOrUndefined(structuredStyle.fontFamily ?? legacy.fontFamily) !== undefined) style.fontFamily = asStringOrUndefined(structuredStyle.fontFamily ?? legacy.fontFamily)
  if (asStringOrUndefined(structuredStyle.lineHeight ?? legacy.lineHeight) !== undefined) style.lineHeight = asStringOrUndefined(structuredStyle.lineHeight ?? legacy.lineHeight)
  if (asStringOrUndefined(structuredStyle.titleColor ?? legacy.titleColor) !== undefined) style.titleColor = asStringOrUndefined(structuredStyle.titleColor ?? legacy.titleColor)
  if (asStringOrUndefined(structuredStyle.titleBackground ?? legacy.titleBackground) !== undefined) style.titleBackground = asStringOrUndefined(structuredStyle.titleBackground ?? legacy.titleBackground)
  if (asStringOrUndefined(structuredStyle.contentColor ?? legacy.contentColor) !== undefined) style.contentColor = asStringOrUndefined(structuredStyle.contentColor ?? legacy.contentColor)
  if (asStringOrUndefined(structuredStyle.contentBackground ?? legacy.contentBackground) !== undefined) style.contentBackground = asStringOrUndefined(structuredStyle.contentBackground ?? legacy.contentBackground)
  if (asStringOrUndefined(structuredStyle.border ?? legacy.border) !== undefined) style.border = asStringOrUndefined(structuredStyle.border ?? legacy.border)
  if (asStringOrUndefined(structuredStyle.borderRadius ?? legacy.borderRadius) !== undefined) style.borderRadius = asStringOrUndefined(structuredStyle.borderRadius ?? legacy.borderRadius)
  if (asStringOrUndefined(structuredStyle.activeTitleColor ?? legacy.activeTitleColor) !== undefined) style.activeTitleColor = asStringOrUndefined(structuredStyle.activeTitleColor ?? legacy.activeTitleColor)
  if (asStringOrUndefined(structuredStyle.activeTitleBackground ?? legacy.activeTitleBackground) !== undefined) style.activeTitleBackground = asStringOrUndefined(structuredStyle.activeTitleBackground ?? legacy.activeTitleBackground)

  const interaction: CanonicalAdvancedAccordionInteraction = {}
  if (structuredInteraction.behavior !== undefined || legacy.behavior !== undefined) interaction.behavior = asBehavior(structuredInteraction.behavior ?? legacy.behavior, defaultAdvancedAccordionProps.interaction.behavior)
  if (asBooleanOrUndefined(structuredInteraction.allowAllClosed ?? legacy.allowAllClosed) !== undefined) interaction.allowAllClosed = asBooleanOrUndefined(structuredInteraction.allowAllClosed ?? legacy.allowAllClosed)
  if (structuredInteraction.iconPosition !== undefined || legacy.iconPosition !== undefined) interaction.iconPosition = asIconPosition(structuredInteraction.iconPosition ?? legacy.iconPosition, defaultAdvancedAccordionProps.interaction.iconPosition)
  if (asStringOrUndefined(structuredInteraction.icon ?? legacy.icon) !== undefined) interaction.icon = asStringOrUndefined(structuredInteraction.icon ?? legacy.icon)
  if (asStringOrUndefined(structuredInteraction.activeIcon ?? legacy.activeIcon) !== undefined) interaction.activeIcon = asStringOrUndefined(structuredInteraction.activeIcon ?? legacy.activeIcon)
  if (structuredInteraction.animation !== undefined || legacy.animation !== undefined) interaction.animation = asAnimation(structuredInteraction.animation ?? legacy.animation, defaultAdvancedAccordionProps.interaction.animation)
  if (asNumberOrUndefined(structuredInteraction.animationDuration ?? legacy.animationDuration) !== undefined) interaction.animationDuration = asNumberOrUndefined(structuredInteraction.animationDuration ?? legacy.animationDuration)

  const responsive: CanonicalAdvancedAccordionResponsive = {
    desktop: responsiveInput.desktop && typeof responsiveInput.desktop === 'object' ? responsiveInput.desktop : {},
    tablet: responsiveInput.tablet && typeof responsiveInput.tablet === 'object' ? responsiveInput.tablet : {},
    mobile: responsiveInput.mobile && typeof responsiveInput.mobile === 'object' ? responsiveInput.mobile : {},
  }

  const resolvedStyleGroup: AdvancedAccordionStyleGroup = {
    itemSpacing: style.itemSpacing ?? defaultAdvancedAccordionProps.style.itemSpacing,
    padding: style.padding ?? defaultAdvancedAccordionProps.style.padding,
    margin: style.margin ?? defaultAdvancedAccordionProps.style.margin,
    titleFontSize: style.titleFontSize ?? defaultAdvancedAccordionProps.style.titleFontSize,
    titleFontWeight: style.titleFontWeight ?? defaultAdvancedAccordionProps.style.titleFontWeight,
    contentFontSize: style.contentFontSize ?? defaultAdvancedAccordionProps.style.contentFontSize,
    fontFamily: style.fontFamily ?? defaultAdvancedAccordionProps.style.fontFamily,
    lineHeight: style.lineHeight ?? defaultAdvancedAccordionProps.style.lineHeight,
    titleColor: style.titleColor ?? defaultAdvancedAccordionProps.style.titleColor,
    titleBackground: style.titleBackground ?? defaultAdvancedAccordionProps.style.titleBackground,
    contentColor: style.contentColor ?? defaultAdvancedAccordionProps.style.contentColor,
    contentBackground: style.contentBackground ?? defaultAdvancedAccordionProps.style.contentBackground,
    border: style.border ?? defaultAdvancedAccordionProps.style.border,
    borderRadius: style.borderRadius ?? defaultAdvancedAccordionProps.style.borderRadius,
    activeTitleColor: style.activeTitleColor ?? defaultAdvancedAccordionProps.style.activeTitleColor,
    activeTitleBackground: style.activeTitleBackground ?? defaultAdvancedAccordionProps.style.activeTitleBackground,
  }

  const resolvedInteractionGroup: AdvancedAccordionInteractionGroup = {
    behavior: interaction.behavior ?? defaultAdvancedAccordionProps.interaction.behavior,
    allowAllClosed: interaction.allowAllClosed ?? defaultAdvancedAccordionProps.interaction.allowAllClosed,
    iconPosition: interaction.iconPosition ?? defaultAdvancedAccordionProps.interaction.iconPosition,
    icon: interaction.icon ?? defaultAdvancedAccordionProps.interaction.icon,
    activeIcon: interaction.activeIcon ?? defaultAdvancedAccordionProps.interaction.activeIcon,
    animation: interaction.animation ?? defaultAdvancedAccordionProps.interaction.animation,
    animationDuration: interaction.animationDuration ?? defaultAdvancedAccordionProps.interaction.animationDuration,
  }

  return {
    type: 'advancedaccordion',
    schemaVersion: 1,
    version: 1,
    content,
    style: resolvedStyleGroup,
    interaction: resolvedInteractionGroup,
    responsive,
    items,
  }
}
