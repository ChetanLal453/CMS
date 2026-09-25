export interface CanonicalContainerContent {
  content?: string
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
  content?: CanonicalContainerContent | string
  [key: string]: any
}

export type ContainerViewModel = ContainerProps
