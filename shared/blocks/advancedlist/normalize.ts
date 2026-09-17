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
  LegacyAdvancedListProps,
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
  const style = input.style || {}
  const sourceItems = Array.isArray(input.items) ? input.items : Array.isArray(legacy.items) ? legacy.items : defaultAdvancedListProps.items

  return {
    type: 'advancedlist',
    schemaVersion: 1,
    items: (sourceItems.length ? sourceItems : defaultAdvancedListProps.items).map((item, index) => normalizeItem(item, index)),
    listType: asListType(input.listType ?? legacy.listType, defaultAdvancedListProps.listType),
    style: {
      columns: asColumns(style.columns ?? legacy.columns, defaultAdvancedListProps.style.columns),
      itemSpacing: asString(style.itemSpacing ?? legacy.itemSpacing, defaultAdvancedListProps.style.itemSpacing),
      gap: asString(style.gap ?? legacy.gap, defaultAdvancedListProps.style.gap),
      padding: asString(style.padding ?? legacy.padding, defaultAdvancedListProps.style.padding),
      margin: asString(style.margin ?? legacy.margin, defaultAdvancedListProps.style.margin),
      alignment: asAlignment(style.alignment ?? legacy.alignment, defaultAdvancedListProps.style.alignment),
      displayStyle: asDisplayStyle(style.displayStyle ?? legacy.displayStyle, defaultAdvancedListProps.style.displayStyle),
      defaultIcon: asString(style.defaultIcon ?? legacy.defaultIcon, defaultAdvancedListProps.style.defaultIcon),
      iconSize: asString(style.iconSize ?? legacy.iconSize, defaultAdvancedListProps.style.iconSize),
      iconPosition: asIconPosition(style.iconPosition ?? legacy.iconPosition, defaultAdvancedListProps.style.iconPosition),
      autoNumbering: asBoolean(style.autoNumbering ?? legacy.autoNumbering, defaultAdvancedListProps.style.autoNumbering),
      titleFontSize: asString(style.titleFontSize ?? legacy.titleFontSize, defaultAdvancedListProps.style.titleFontSize),
      titleFontWeight: asString(style.titleFontWeight ?? legacy.titleFontWeight, defaultAdvancedListProps.style.titleFontWeight),
      descriptionFontSize: asString(style.descriptionFontSize ?? legacy.descriptionFontSize, defaultAdvancedListProps.style.descriptionFontSize),
      fontFamily: asString(style.fontFamily ?? legacy.fontFamily, defaultAdvancedListProps.style.fontFamily),
      lineHeight: asString(style.lineHeight ?? legacy.lineHeight, defaultAdvancedListProps.style.lineHeight),
      titleColor: asString(style.titleColor ?? legacy.titleColor, defaultAdvancedListProps.style.titleColor),
      descriptionColor: asString(style.descriptionColor ?? legacy.descriptionColor, defaultAdvancedListProps.style.descriptionColor),
      iconColor: asString(style.iconColor ?? legacy.iconColor, defaultAdvancedListProps.style.iconColor),
      backgroundColor: asString(style.backgroundColor ?? legacy.backgroundColor, defaultAdvancedListProps.style.backgroundColor),
      border: asString(style.border ?? legacy.border, defaultAdvancedListProps.style.border),
      borderRadius: asString(style.borderRadius ?? legacy.borderRadius, defaultAdvancedListProps.style.borderRadius),
      itemBackground: asString(style.itemBackground ?? legacy.itemBackground, defaultAdvancedListProps.style.itemBackground),
      itemPadding: asString(style.itemPadding ?? legacy.itemPadding, defaultAdvancedListProps.style.itemPadding),
      boxShadow: asString(style.boxShadow ?? legacy.boxShadow, defaultAdvancedListProps.style.boxShadow),
      boxHoverShadow: asString(style.boxHoverShadow ?? legacy.boxHoverShadow, defaultAdvancedListProps.style.boxHoverShadow),
      boxBorderWidth: asString(style.boxBorderWidth ?? legacy.boxBorderWidth, defaultAdvancedListProps.style.boxBorderWidth),
      boxBorderColor: asString(style.boxBorderColor ?? legacy.boxBorderColor, defaultAdvancedListProps.style.boxBorderColor),
      fullBoxShadow: asString(style.fullBoxShadow ?? legacy.fullBoxShadow, defaultAdvancedListProps.style.fullBoxShadow),
      fullBoxPadding: asString(style.fullBoxPadding ?? legacy.fullBoxPadding, defaultAdvancedListProps.style.fullBoxPadding),
      fullBoxBackground: asString(style.fullBoxBackground ?? legacy.fullBoxBackground, defaultAdvancedListProps.style.fullBoxBackground),
      fullBoxBorder: asString(style.fullBoxBorder ?? legacy.fullBoxBorder, defaultAdvancedListProps.style.fullBoxBorder),
      fullBoxBorderRadius: asString(style.fullBoxBorderRadius ?? legacy.fullBoxBorderRadius, defaultAdvancedListProps.style.fullBoxBorderRadius),
    },
  }
}
