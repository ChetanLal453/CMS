import type { CSSProperties } from 'react'

export type NewGridType = 'newgrid'
export type NewGridJustifyContent = 'stretch' | 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly'
export type NewGridAlignItems = 'stretch' | 'start' | 'center' | 'end' | 'baseline'

export interface NewGridCell {
  component: any | null
}

export interface NewGridLayoutGroup {
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

export interface NewGridResponsiveGroup {
  mobileColumns: number
  tabletColumns: number
  desktopColumns: number
  hideOnMobile: boolean
  hideOnTablet: boolean
}

export interface NewGridStyleGroup {
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

export interface NewGridBehaviorGroup {
  draggable: boolean
  resizable: boolean
  showGridLines: boolean
  snapToGrid: boolean
  visible: boolean
}

export interface NewGrid {
  type: NewGridType
  schemaVersion: 1
  layout: NewGridLayoutGroup
  responsive: NewGridResponsiveGroup
  style: NewGridStyleGroup
  behavior: NewGridBehaviorGroup
  cells: NewGridCell[][]
  components: Array<any | null>
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

export type NewGridInput = Partial<NewGrid> | LegacyNewGridProps | (Partial<NewGrid> & LegacyNewGridProps)

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
