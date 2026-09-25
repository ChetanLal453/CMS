export interface CanonicalFlexboxContent {
  children?: any[]
  preset?: 'custom' | 'navbar' | 'center-hero' | 'button-group' | 'feature-row' | string
}

export interface CanonicalFlexboxStyle {
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse' | string
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly' | string
  alignItems?: 'stretch' | 'flex-start' | 'center' | 'flex-end' | 'baseline' | string
  alignContent?: 'stretch' | 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly' | string
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse' | string
  gap?: string
  rowGap?: string
  columnGap?: string
  padding?: string
  minHeight?: string
  backgroundColor?: string
  borderRadius?: string
  border?: string
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | string
  width?: string
  maxWidth?: string
  className?: string
}

export interface CanonicalFlexboxResponsive {
  stackOnMobile?: boolean
  directionMobile?: 'column' | 'column-reverse' | 'row' | string
  mobileGap?: string
  desktop?: Record<string, any>
  tablet?: Record<string, any>
  mobile?: Record<string, any>
}

export interface CanonicalFlexboxProps {
  version?: number
  content?: CanonicalFlexboxContent
  style?: CanonicalFlexboxStyle
  responsive?: CanonicalFlexboxResponsive
}

export type FlexboxProps = CanonicalFlexboxProps & {
  direction: 'row' | 'row-reverse' | 'column' | 'column-reverse' | string
  justifyContent: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly' | string
  alignItems: 'stretch' | 'flex-start' | 'center' | 'flex-end' | 'baseline' | string
  alignContent: 'stretch' | 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly' | string
  wrap: 'nowrap' | 'wrap' | 'wrap-reverse' | string
  gap: string
  rowGap: string
  columnGap: string
  padding: string
  minHeight: string
  backgroundColor: string
  stackOnMobile: boolean
  directionMobile: 'column' | 'column-reverse' | 'row' | string
  mobileGap: string
  borderRadius: string
  border: string
  shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl' | string
  width: string
  maxWidth: string
  preset: 'custom' | 'navbar' | 'center-hero' | 'button-group' | 'feature-row' | string
  className?: string
  children: any[]
  [key: string]: any
}

export type FlexboxInput = Partial<FlexboxProps> & Record<string, any>
