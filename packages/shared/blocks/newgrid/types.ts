import type { DeepPartial } from '../../utils/merge'
export type { DeepPartial }

export type NewGridType = 'newgrid'
export type NewGridJustifyContent = 'stretch' | 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly'
export type NewGridAlignItems = 'stretch' | 'start' | 'center' | 'end' | 'baseline'

export interface NewGridCell {
  component: any | null
}

export interface CanonicalNewGridContent {
  components?: Array<any | null>
  cells?: NewGridCell[][]
  [key: string]: any
}

export interface CanonicalNewGridLayout {
  columns?: number
  rows?: number
  gap?: number
  padding?: number
  margin?: number
  justifyContent?: NewGridJustifyContent
  alignItems?: NewGridAlignItems
  gridTemplateColumns?: string
  gridAutoRows?: string
  minHeight?: string
  [key: string]: any
}

export interface CanonicalNewGridResponsive {
  mobileColumns?: number
  tabletColumns?: number
  desktopColumns?: number
  hideOnMobile?: boolean
  hideOnTablet?: boolean
  desktop?: Record<string, any>
  tablet?: Record<string, any>
  mobile?: Record<string, any>
  [key: string]: any
}

export interface CanonicalNewGridStyle {
  backgroundColor?: string
  border?: string
  borderRadius?: number
  gridLineColor?: string
  customCSS?: string
  className?: string
  id?: string
  dataAttributes?: string
  [key: string]: any
}

export interface CanonicalNewGridBehavior {
  draggable?: boolean
  resizable?: boolean
  showGridLines?: boolean
  snapToGrid?: boolean
  visible?: boolean
  [key: string]: any
}

export interface CanonicalNewGridProps {
  version?: number
  content?: CanonicalNewGridContent
  layout?: CanonicalNewGridLayout
  responsive?: CanonicalNewGridResponsive
  style?: CanonicalNewGridStyle
  behavior?: CanonicalNewGridBehavior
}

export interface NewGridLayoutGroup extends CanonicalNewGridLayout {
  columns: number
  rows: number
  gap: number
  padding: number
  margin: number
  justifyContent: NewGridJustifyContent
  alignItems: NewGridAlignItems
  gridTemplateColumns: string
  gridAutoRows: string
  minHeight: string
}

export interface NewGridResponsiveGroup extends CanonicalNewGridResponsive {
  mobileColumns: number
  tabletColumns: number
  desktopColumns: number
  hideOnMobile: boolean
  hideOnTablet: boolean
}

export interface NewGridStyleGroup extends CanonicalNewGridStyle {
  backgroundColor: string
  border: string
  borderRadius: number
  gridLineColor: string
  customCSS: string
  className: string
  id: string
  dataAttributes: string
  gridTestFromComponent: string
}

export interface NewGridBehaviorGroup extends CanonicalNewGridBehavior {
  draggable: boolean
  resizable: boolean
  showGridLines: boolean
  snapToGrid: boolean
  visible: boolean
}

export interface NewGrid extends CanonicalNewGridProps {
  type: NewGridType
  schemaVersion: 1
  version?: number
  content?: CanonicalNewGridContent
  columns?: number
  rows?: number
  gap?: number
  padding?: number
  margin?: number
  backgroundColor?: string
  border?: string
  borderRadius?: number
  gridLineColor?: string
  justifyContent?: NewGridJustifyContent
  alignItems?: NewGridAlignItems
  gridTemplateColumns?: string
  gridAutoRows?: string
  minHeight?: string
  mobileColumns?: number
  tabletColumns?: number
  desktopColumns?: number
  hideOnMobile?: boolean
  hideOnTablet?: boolean
  draggable?: boolean
  resizable?: boolean
  showGridLines?: boolean
  snapToGrid?: boolean
  visible?: boolean
  customCSS?: string
  className?: string
  id?: string
  dataAttributes?: string
  layout: NewGridLayoutGroup
  responsive: NewGridResponsiveGroup
  style: NewGridStyleGroup
  behavior: NewGridBehaviorGroup
  cells: NewGridCell[][]
  components: Array<any | null>
  [key: string]: unknown
}

export interface LegacyNewGridProps {
  columns?: number
  rows?: number
  gap?: number | string
  padding?: number | string
  margin?: number | string
  backgroundColor?: string
  border?: string
  borderRadius?: number | string
  gridLineColor?: string
  justifyContent?: NewGridJustifyContent
  alignItems?: NewGridAlignItems
  gridTemplateColumns?: string
  gridAutoRows?: string
  minHeight?: string
  mobileColumns?: number | string
  tabletColumns?: number | string
  desktopColumns?: number | string
  hideOnMobile?: boolean | string
  hideOnTablet?: boolean | string
  draggable?: boolean | string
  resizable?: boolean | string
  showGridLines?: boolean | string
  snapToGrid?: boolean | string
  customCSS?: string
  className?: string
  id?: string
  dataAttributes?: string
  visible?: boolean | string
  gridTestFromComponent?: string
  cells?: any[]
  components?: Array<any | null>
  [key: string]: unknown
}

export type NewGridInput = DeepPartial<NewGrid> | LegacyNewGridProps | (DeepPartial<NewGrid> & LegacyNewGridProps)

export interface NewGridViewModel {
  type: NewGridType
  schemaVersion: 1
  columns: number
  rows: number
  gap: number
  padding: number
  margin: number
  backgroundColor: string
  border: string
  borderRadius: number
  gridLineColor: string
  justifyContent: NewGridJustifyContent
  alignItems: NewGridAlignItems
  gridTemplateColumns: string
  gridAutoRows: string
  minHeight: string
  mobileColumns: number
  tabletColumns: number
  desktopColumns: number
  hideOnMobile: boolean
  hideOnTablet: boolean
  draggable: boolean
  resizable: boolean
  showGridLines: boolean
  snapToGrid: boolean
  customCSS: string
  className: string
  id: string
  dataAttributes: string
  gridTestFromComponent: string
  dataAttributesObject: Record<string, string>
  visible: boolean
  cells: NewGridCell[][]
  components: Array<any | null>
  containerStyle: CSSProperties
  pageLayoutStyle: CSSProperties
  editorCellStyle: CSSProperties
  emptyCellStyle: CSSProperties
}

export type CSSProperties = Record<string, any>
