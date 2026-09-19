export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning'
export type ButtonAlignment = 'left' | 'center' | 'right'
export type ButtonSize = 'small' | 'medium' | 'large'
export type ButtonFontWeight = '400' | '500' | '600' | '700' | '800'
export type ButtonTextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize'
export type ButtonHoverEffect = 'none' | 'scale' | 'lift' | 'glow' | 'color-shift'
export type ButtonAnimationType = 'none' | 'pulse' | 'bounce' | 'fade-in'
export type ButtonGradientType = 'linear' | 'radial'
export type ButtonShadow = 'none' | 'sm' | 'md' | 'lg' | 'xl'

export interface ButtonContentProps {
  text?: string
  link?: string
  openInNewTab?: boolean
  loadingText?: string
  ariaLabel?: string
}

export interface ButtonStyleProps {
  variant?: ButtonVariant
  size?: ButtonSize
  primaryColor?: string
  backgroundColor?: string
  textColor?: string
  hoverColor?: string
  activeColor?: string
  borderColor?: string
  useGradient?: boolean
  gradientColors?: string
  gradientDirection?: string
  gradientType?: ButtonGradientType
  borderRadius?: string
  borderWidth?: string
  shadow?: ButtonShadow
}

export interface ButtonLayoutProps {
  alignment?: ButtonAlignment
  fullWidth?: boolean
  width?: string
  margin?: string
  padding?: string
  marginTop?: string
  marginRight?: string
  marginBottom?: string
  marginLeft?: string
  paddingTop?: string
  paddingRight?: string
  paddingBottom?: string
  paddingLeft?: string
}

export interface ButtonTypographyProps {
  fontFamily?: string
  fontSize?: string
  fontWeight?: ButtonFontWeight | string
  letterSpacing?: string
  textTransform?: ButtonTextTransform
  lineHeight?: string
}

export interface ButtonIconProps {
  icon?: string
  iconPosition?: 'left' | 'right'
  iconSize?: string
  iconSpacing?: string
}

export interface ButtonStateProps {
  disabled?: boolean
  loading?: boolean
  hoverEffect?: ButtonHoverEffect
  hoverScale?: number
  hoverShadow?: ButtonShadow
  animationType?: ButtonAnimationType
  animationDuration?: string
}

export interface ButtonAdvancedProps {
  className?: string
  customClass?: string
  customId?: string
  onClick?: string
  dataTracking?: string
}

export interface ButtonResponsiveProps {
  mobileSize?: ButtonSize
  mobileFullWidth?: boolean
  hideOnMobile?: boolean
}

export type ButtonProps = ButtonContentProps &
  ButtonStyleProps &
  ButtonLayoutProps &
  ButtonTypographyProps &
  ButtonIconProps &
  ButtonStateProps &
  ButtonAdvancedProps &
  ButtonResponsiveProps & {
    [key: string]: any
  }

export type ButtonViewModel = ButtonProps & {
  hasLink: boolean
  target: '_blank' | '_self'
  rel?: string
  label: string
  resolvedClassName: string
  showIcon: boolean
  iconName: string
  iconStyle: Record<string, any>
  containerStyle: Record<string, any>
  buttonStyle: Record<string, any>
  hoverStyle: Record<string, any>
  activeStyle: Record<string, any>
  mobileStyle: Record<string, any>
}
