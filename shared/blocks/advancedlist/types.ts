import type { DeepPartial } from '../../utils/merge'
export type { DeepPartial }

export type AdvancedListType = 'advancedlist'
export type AdvancedListDisplayStyle = 'plain' | 'boxed' | 'bordered' | 'full-box'
export type AdvancedListKind = 'icon' | 'numbered' | 'bullet' | 'custom'
export type AdvancedListAlignment = 'left' | 'center' | 'right'
export type AdvancedListIconPosition = 'left' | 'right' | 'top'
export type AdvancedListIconType = 'emoji' | 'image' | 'number' | 'fontawesome'
export type AdvancedListColumns = 1 | 2 | 3 | 4

export interface AdvancedListItem {
  id: string
  title: string
  description: string
  visible: boolean
  iconType: AdvancedListIconType
  iconEmoji: string
  iconImage: string
  iconFontAwesome: string
  iconNumber: number
  order: number
}

export interface AdvancedListStyleGroup {
  columns: AdvancedListColumns
  itemSpacing: string
  gap: string
  padding: string
  margin: string
  alignment: AdvancedListAlignment
  displayStyle: AdvancedListDisplayStyle
  defaultIcon: string
  iconSize: string
  iconPosition: AdvancedListIconPosition
  autoNumbering: boolean
  titleFontSize: string
  titleFontWeight: string
  descriptionFontSize: string
  fontFamily: string
  lineHeight: string
  titleColor: string
  descriptionColor: string
  iconColor: string
  backgroundColor: string
  border: string
  borderRadius: string
  itemBackground: string
  itemPadding: string
  boxShadow: string
  boxHoverShadow: string
  boxBorderWidth: string
  boxBorderColor: string
  fullBoxShadow: string
  fullBoxPadding: string
  fullBoxBackground: string
  fullBoxBorder: string
  fullBoxBorderRadius: string
}

export interface AdvancedList {
  type: AdvancedListType
  schemaVersion: 1
  items: AdvancedListItem[]
  listType: AdvancedListKind
  style: AdvancedListStyleGroup
}

export interface LegacyAdvancedListProps {
  items?: Array<Partial<AdvancedListItem>>
  listType?: AdvancedListKind
  columns?: AdvancedListColumns
  itemSpacing?: string
  gap?: string
  padding?: string
  margin?: string
  alignment?: AdvancedListAlignment
  displayStyle?: AdvancedListDisplayStyle
  defaultIcon?: string
  iconSize?: string
  iconPosition?: AdvancedListIconPosition
  autoNumbering?: boolean
  titleFontSize?: string
  titleFontWeight?: string
  descriptionFontSize?: string
  fontFamily?: string
  lineHeight?: string
  titleColor?: string
  descriptionColor?: string
  iconColor?: string
  backgroundColor?: string
  border?: string
  borderRadius?: string
  itemBackground?: string
  itemPadding?: string
  boxShadow?: string
  boxHoverShadow?: string
  boxBorderWidth?: string
  boxBorderColor?: string
  fullBoxShadow?: string
  fullBoxPadding?: string
  fullBoxBackground?: string
  fullBoxBorder?: string
  fullBoxBorderRadius?: string
  [key: string]: unknown
}

export type AdvancedListInput =
  | DeepPartial<AdvancedList>
  | LegacyAdvancedListProps
  | (DeepPartial<AdvancedList> & LegacyAdvancedListProps)

export interface AdvancedListResolvedItem extends AdvancedListItem {
  resolvedIndex: number
  resolvedIconText: string
  resolvedIconComponentName: string
  resolvedIconImage: string
  contentStyle: CSSProperties
  titleStyle: CSSProperties
  descriptionStyle: CSSProperties
  baseItemStyle: CSSProperties
  hoveredItemStyle: CSSProperties
  iconStyle: CSSProperties
}

export interface AdvancedListViewModel {
  items: AdvancedListResolvedItem[]
  listType: AdvancedListKind
  style: AdvancedListStyleGroup
  containerStyle: CSSProperties
  hoveredContainerStyle: CSSProperties
  gridStyle: CSSProperties
  singleColumnStyle: CSSProperties
  emptyStateStyle: CSSProperties
  previewOverrides: Partial<AdvancedListStyleGroup>
}

export type CSSProperties = Record<string, any>
