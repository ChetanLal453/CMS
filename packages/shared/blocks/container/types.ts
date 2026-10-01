export interface CanonicalContainerContent {
  content?: string
  children?: any[]
}

export interface CanonicalContainerStyle {
  maxWidth?: string
  width?: string
  minHeight?: string
  padding?: string
  margin?: string
  backgroundColor?: string
  borderRadius?: string
  border?: string
  borderColor?: string
  shadow?: string
  boxShadow?: string
  alignment?: string
  textAlign?: string
  className?: string
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky'
  top?: string
  right?: string
  bottom?: string
  left?: string
  zIndex?: number | string
  overflow?: string
}

export interface CanonicalContainerResponsive {
  desktop?: Record<string, any>
  tablet?: Record<string, any>
  mobile?: Record<string, any>
}

export interface CanonicalContainerProps {
  version?: number
  content?: CanonicalContainerContent
  style?: CanonicalContainerStyle
  responsive?: CanonicalContainerResponsive
}

export type ContainerProps = Omit<CanonicalContainerProps, 'content'> & {
  maxWidth?: string
  width?: string
  minHeight?: string
  padding?: string
  margin?: string
  backgroundColor?: string
  borderRadius?: string
  border?: string
  borderColor?: string
  shadow?: string
  boxShadow?: string
  alignment?: string
  textAlign?: string
  className?: string
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky'
  top?: string
  right?: string
  bottom?: string
  left?: string
  zIndex?: number | string
  overflow?: string
  mobilePosition?: string
  mobileTop?: string
  mobileRight?: string
  mobileBottom?: string
  mobileLeft?: string
  content?: CanonicalContainerContent | string
  [key: string]: any
}

export type ContainerViewModel = ContainerProps
