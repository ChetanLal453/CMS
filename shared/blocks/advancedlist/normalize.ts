import { defaultAdvancedListProps } from './defaults'
import type {
  AdvancedList,
  AdvancedListAlignment,
  AdvancedListColumns,
  AdvancedListDisplayStyle,
  AdvancedListIconPosition,
  AdvancedListIconType,
  AdvancedListInput,
  AdvancedListItem,
  AdvancedListKind,
  AdvancedListStyleGroup,
  CanonicalAdvancedListContent,
  CanonicalAdvancedListResponsive,
  CanonicalAdvancedListStyle,
  LegacyAdvancedListProps,
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

function asColumns(value: unknown, fallback: AdvancedListColumns): AdvancedListColumns {
  const normalized = asNumber(value, fallback)
  return normalized === 1 || normalized === 2 || normalized === 3 || normalized === 4 ? normalized : fallback
}

function asListType(value: unknown, fallback: AdvancedListKind): AdvancedListKind {
  return value === 'icon' || value === 'numbered' || value === 'bullet' || value === 'custom' ? value : fallback
}

function asAlignment(value: unknown, fallback: AdvancedListAlignment): AdvancedListAlignment {
  return value === 'left' || value === 'center' || value === 'right' ? value : fallback
}

function asDisplayStyle(value: unknown, fallback: AdvancedListDisplayStyle): AdvancedListDisplayStyle {
  return value === 'plain' || value === 'boxed' || value === 'bordered' || value === 'full-box' ? value : fallback
}

function asIconPosition(value: unknown, fallback: AdvancedListIconPosition): AdvancedListIconPosition {
  return value === 'left' || value === 'right' || value === 'top' ? value : fallback
}

function asIconType(value: unknown, fallback: AdvancedListIconType): AdvancedListIconType {
  return value === 'emoji' || value === 'image' || value === 'number' || value === 'fontawesome' ? value : fallback
}

function normalizeItem(item: Partial<AdvancedListItem> | undefined, index: number): AdvancedListItem {
  const fallback = defaultAdvancedListProps.items[index] || defaultAdvancedListProps.items[0]
  return {
    id: asString(item?.id, `${index + 1}`),
    title: asString(item?.title, fallback?.title || `Item ${index + 1}`),
    description: asString(item?.description, fallback?.description || ''),
    visible: asBoolean(item?.visible, true),
    iconType: asIconType(item?.iconType, fallback?.iconType || 'emoji'),
    iconEmoji: asString(item?.iconEmoji, fallback?.iconEmoji || ''),
    iconImage: asString(item?.iconImage, fallback?.iconImage || ''),
    iconFontAwesome: asString(item?.iconFontAwesome, fallback?.iconFontAwesome || ''),
    iconNumber: asNumber(item?.iconNumber, fallback?.iconNumber || index + 1),
    order: asNumber(item?.order, fallback?.order || index + 1),
  }
}

export function normalizeAdvancedList(input: AdvancedListInput = {}): AdvancedList {
  const legacy = input as LegacyAdvancedListProps
  const contentInput = isPlainObject(input.content) ? input.content : {}
  const styleInput = (isPlainObject(input.style) ? input.style : {}) as Partial<AdvancedListStyleGroup>
  const responsiveInput = isPlainObject(input.responsive) ? input.responsive : {}

  const rawItems = Array.isArray(contentInput.items)
    ? contentInput.items
    : Array.isArray(input.items)
      ? input.items
      : Array.isArray(legacy.items)
        ? legacy.items
        : undefined

  const sourceItems = rawItems !== undefined ? rawItems : defaultAdvancedListProps.items
  const normalizedItems = (sourceItems.length ? sourceItems : defaultAdvancedListProps.items).map((item, index) =>
    normalizeItem(item, index),
  )

  const rawListType = contentInput.listType ?? input.listType ?? legacy.listType
  const resolvedListType = asListType(rawListType, defaultAdvancedListProps.listType)

  const content: CanonicalAdvancedListContent = {}
  if (rawItems !== undefined) content.items = normalizedItems
  if (rawListType !== undefined) content.listType = resolvedListType

  const style: CanonicalAdvancedListStyle = {}
  const rawColumns = styleInput.columns ?? legacy.columns
  if (rawColumns !== undefined) style.columns = asColumns(rawColumns, defaultAdvancedListProps.style.columns)
  if (asStringOrUndefined(styleInput.itemSpacing ?? legacy.itemSpacing) !== undefined) style.itemSpacing = asStringOrUndefined(styleInput.itemSpacing ?? legacy.itemSpacing)
  if (asStringOrUndefined(styleInput.gap ?? legacy.gap) !== undefined) style.gap = asStringOrUndefined(styleInput.gap ?? legacy.gap)
  if (asStringOrUndefined(styleInput.padding ?? legacy.padding) !== undefined) style.padding = asStringOrUndefined(styleInput.padding ?? legacy.padding)
  if (asStringOrUndefined(styleInput.margin ?? legacy.margin) !== undefined) style.margin = asStringOrUndefined(styleInput.margin ?? legacy.margin)
  if (styleInput.alignment !== undefined || legacy.alignment !== undefined) style.alignment = asAlignment(styleInput.alignment ?? legacy.alignment, defaultAdvancedListProps.style.alignment)
  if (styleInput.displayStyle !== undefined || legacy.displayStyle !== undefined) style.displayStyle = asDisplayStyle(styleInput.displayStyle ?? legacy.displayStyle, defaultAdvancedListProps.style.displayStyle)
  if (asStringOrUndefined(styleInput.defaultIcon ?? legacy.defaultIcon) !== undefined) style.defaultIcon = asStringOrUndefined(styleInput.defaultIcon ?? legacy.defaultIcon)
  if (asStringOrUndefined(styleInput.iconSize ?? legacy.iconSize) !== undefined) style.iconSize = asStringOrUndefined(styleInput.iconSize ?? legacy.iconSize)
  if (styleInput.iconPosition !== undefined || legacy.iconPosition !== undefined) style.iconPosition = asIconPosition(styleInput.iconPosition ?? legacy.iconPosition, defaultAdvancedListProps.style.iconPosition)
  if (asBooleanOrUndefined(styleInput.autoNumbering ?? legacy.autoNumbering) !== undefined) style.autoNumbering = asBooleanOrUndefined(styleInput.autoNumbering ?? legacy.autoNumbering)
  if (asStringOrUndefined(styleInput.titleFontSize ?? legacy.titleFontSize) !== undefined) style.titleFontSize = asStringOrUndefined(styleInput.titleFontSize ?? legacy.titleFontSize)
  if (asStringOrUndefined(styleInput.titleFontWeight ?? legacy.titleFontWeight) !== undefined) style.titleFontWeight = asStringOrUndefined(styleInput.titleFontWeight ?? legacy.titleFontWeight)
  if (asStringOrUndefined(styleInput.descriptionFontSize ?? legacy.descriptionFontSize) !== undefined) style.descriptionFontSize = asStringOrUndefined(styleInput.descriptionFontSize ?? legacy.descriptionFontSize)
  if (asStringOrUndefined(styleInput.fontFamily ?? legacy.fontFamily) !== undefined) style.fontFamily = asStringOrUndefined(styleInput.fontFamily ?? legacy.fontFamily)
  if (asStringOrUndefined(styleInput.lineHeight ?? legacy.lineHeight) !== undefined) style.lineHeight = asStringOrUndefined(styleInput.lineHeight ?? legacy.lineHeight)
  if (asStringOrUndefined(styleInput.titleColor ?? legacy.titleColor) !== undefined) style.titleColor = asStringOrUndefined(styleInput.titleColor ?? legacy.titleColor)
  if (asStringOrUndefined(styleInput.descriptionColor ?? legacy.descriptionColor) !== undefined) style.descriptionColor = asStringOrUndefined(styleInput.descriptionColor ?? legacy.descriptionColor)
  if (asStringOrUndefined(styleInput.iconColor ?? legacy.iconColor) !== undefined) style.iconColor = asStringOrUndefined(styleInput.iconColor ?? legacy.iconColor)
  if (asStringOrUndefined(styleInput.backgroundColor ?? legacy.backgroundColor) !== undefined) style.backgroundColor = asStringOrUndefined(styleInput.backgroundColor ?? legacy.backgroundColor)
  if (asStringOrUndefined(styleInput.border ?? legacy.border) !== undefined) style.border = asStringOrUndefined(styleInput.border ?? legacy.border)
  if (asStringOrUndefined(styleInput.borderRadius ?? legacy.borderRadius) !== undefined) style.borderRadius = asStringOrUndefined(styleInput.borderRadius ?? legacy.borderRadius)
  if (asStringOrUndefined(styleInput.itemBackground ?? legacy.itemBackground) !== undefined) style.itemBackground = asStringOrUndefined(styleInput.itemBackground ?? legacy.itemBackground)
  if (asStringOrUndefined(styleInput.itemPadding ?? legacy.itemPadding) !== undefined) style.itemPadding = asStringOrUndefined(styleInput.itemPadding ?? legacy.itemPadding)
  if (asStringOrUndefined(styleInput.boxShadow ?? legacy.boxShadow) !== undefined) style.boxShadow = asStringOrUndefined(styleInput.boxShadow ?? legacy.boxShadow)
  if (asStringOrUndefined(styleInput.boxHoverShadow ?? legacy.boxHoverShadow) !== undefined) style.boxHoverShadow = asStringOrUndefined(styleInput.boxHoverShadow ?? legacy.boxHoverShadow)
  if (asStringOrUndefined(styleInput.boxBorderWidth ?? legacy.boxBorderWidth) !== undefined) style.boxBorderWidth = asStringOrUndefined(styleInput.boxBorderWidth ?? legacy.boxBorderWidth)
  if (asStringOrUndefined(styleInput.boxBorderColor ?? legacy.boxBorderColor) !== undefined) style.boxBorderColor = asStringOrUndefined(styleInput.boxBorderColor ?? legacy.boxBorderColor)
  if (asStringOrUndefined(styleInput.fullBoxShadow ?? legacy.fullBoxShadow) !== undefined) style.fullBoxShadow = asStringOrUndefined(styleInput.fullBoxShadow ?? legacy.fullBoxShadow)
  if (asStringOrUndefined(styleInput.fullBoxPadding ?? legacy.fullBoxPadding) !== undefined) style.fullBoxPadding = asStringOrUndefined(styleInput.fullBoxPadding ?? legacy.fullBoxPadding)
  if (asStringOrUndefined(styleInput.fullBoxBackground ?? legacy.fullBoxBackground) !== undefined) style.fullBoxBackground = asStringOrUndefined(styleInput.fullBoxBackground ?? legacy.fullBoxBackground)
  if (asStringOrUndefined(styleInput.fullBoxBorder ?? legacy.fullBoxBorder) !== undefined) style.fullBoxBorder = asStringOrUndefined(styleInput.fullBoxBorder ?? legacy.fullBoxBorder)
  if (asStringOrUndefined(styleInput.fullBoxBorderRadius ?? legacy.fullBoxBorderRadius) !== undefined) style.fullBoxBorderRadius = asStringOrUndefined(styleInput.fullBoxBorderRadius ?? legacy.fullBoxBorderRadius)

  const responsive: CanonicalAdvancedListResponsive = {
    desktop: responsiveInput.desktop && typeof responsiveInput.desktop === 'object' ? responsiveInput.desktop : {},
    tablet: responsiveInput.tablet && typeof responsiveInput.tablet === 'object' ? responsiveInput.tablet : {},
    mobile: responsiveInput.mobile && typeof responsiveInput.mobile === 'object' ? responsiveInput.mobile : {},
  }

  const resolvedStyleGroup: AdvancedListStyleGroup = {
    columns: style.columns ?? defaultAdvancedListProps.style.columns,
    itemSpacing: style.itemSpacing ?? defaultAdvancedListProps.style.itemSpacing,
    gap: style.gap ?? defaultAdvancedListProps.style.gap,
    padding: style.padding ?? defaultAdvancedListProps.style.padding,
    margin: style.margin ?? defaultAdvancedListProps.style.margin,
    alignment: style.alignment ?? defaultAdvancedListProps.style.alignment,
    displayStyle: style.displayStyle ?? defaultAdvancedListProps.style.displayStyle,
    defaultIcon: style.defaultIcon ?? defaultAdvancedListProps.style.defaultIcon,
    iconSize: style.iconSize ?? defaultAdvancedListProps.style.iconSize,
    iconPosition: style.iconPosition ?? defaultAdvancedListProps.style.iconPosition,
    autoNumbering: style.autoNumbering ?? defaultAdvancedListProps.style.autoNumbering,
    titleFontSize: style.titleFontSize ?? defaultAdvancedListProps.style.titleFontSize,
    titleFontWeight: style.titleFontWeight ?? defaultAdvancedListProps.style.titleFontWeight,
    descriptionFontSize: style.descriptionFontSize ?? defaultAdvancedListProps.style.descriptionFontSize,
    fontFamily: style.fontFamily ?? defaultAdvancedListProps.style.fontFamily,
    lineHeight: style.lineHeight ?? defaultAdvancedListProps.style.lineHeight,
    titleColor: style.titleColor ?? defaultAdvancedListProps.style.titleColor,
    descriptionColor: style.descriptionColor ?? defaultAdvancedListProps.style.descriptionColor,
    iconColor: style.iconColor ?? defaultAdvancedListProps.style.iconColor,
    backgroundColor: style.backgroundColor ?? defaultAdvancedListProps.style.backgroundColor,
    border: style.border ?? defaultAdvancedListProps.style.border,
    borderRadius: style.borderRadius ?? defaultAdvancedListProps.style.borderRadius,
    itemBackground: style.itemBackground ?? defaultAdvancedListProps.style.itemBackground,
    itemPadding: style.itemPadding ?? defaultAdvancedListProps.style.itemPadding,
    boxShadow: style.boxShadow ?? defaultAdvancedListProps.style.boxShadow,
    boxHoverShadow: style.boxHoverShadow ?? defaultAdvancedListProps.style.boxHoverShadow,
    boxBorderWidth: style.boxBorderWidth ?? defaultAdvancedListProps.style.boxBorderWidth,
    boxBorderColor: style.boxBorderColor ?? defaultAdvancedListProps.style.boxBorderColor,
    fullBoxShadow: style.fullBoxShadow ?? defaultAdvancedListProps.style.fullBoxShadow,
    fullBoxPadding: style.fullBoxPadding ?? defaultAdvancedListProps.style.fullBoxPadding,
    fullBoxBackground: style.fullBoxBackground ?? defaultAdvancedListProps.style.fullBoxBackground,
    fullBoxBorder: style.fullBoxBorder ?? defaultAdvancedListProps.style.fullBoxBorder,
    fullBoxBorderRadius: style.fullBoxBorderRadius ?? defaultAdvancedListProps.style.fullBoxBorderRadius,
  }

  return {
    type: 'advancedlist',
    schemaVersion: 1,
    version: 1,
    content,
    style: resolvedStyleGroup,
    responsive,
    items: normalizedItems,
    listType: resolvedListType,
  }
}
