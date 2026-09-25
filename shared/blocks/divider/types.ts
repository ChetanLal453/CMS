export interface CanonicalDividerContent {}

export interface CanonicalDividerStyle {
  thickness?: string
  color?: string
  width?: string
  margin?: string
  className?: string
}

export interface CanonicalDividerResponsive {
  desktop?: Record<string, any>
  tablet?: Record<string, any>
  mobile?: Record<string, any>
}

export interface CanonicalDividerProps {
  version?: number
  content?: CanonicalDividerContent
  style?: CanonicalDividerStyle
  responsive?: CanonicalDividerResponsive
}

export type DividerProps = CanonicalDividerProps & {
  thickness?: string
  color?: string
  width?: string
  margin?: string
  className?: string
  [key: string]: any
}

export type DividerViewModel = DividerProps & {
  thickness: string
  color: string
  width: string
  margin: string
  className: string
}
