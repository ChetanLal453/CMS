export interface CanonicalIconContent {
  name?: string
  icon?: string
}

export interface CanonicalIconStyle {
  size?: string | number
  color?: string
  className?: string
}

export interface CanonicalIconResponsive {
  desktop?: Record<string, any>
  tablet?: Record<string, any>
  mobile?: Record<string, any>
}

export interface CanonicalIconProps {
  version?: number
  content?: CanonicalIconContent
  style?: CanonicalIconStyle
  responsive?: CanonicalIconResponsive
}

export type IconProps = Omit<CanonicalIconProps, 'content'> & {
  content?: CanonicalIconContent
  name?: string
  icon?: string
  size?: string | number
  color?: string
  className?: string
  [key: string]: any
}

export type IconViewModel = {
  iconName: string
  size: string | number
  numericSize: number
  color: string
  className: string
}
