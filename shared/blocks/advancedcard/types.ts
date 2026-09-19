export type AdvancedCardType = 'advancedCard'
export type AdvancedCardVariant = 'default' | 'feature' | 'blog' | 'flip'
export type AdvancedCardSchemaVersion = 2

export type CardAlignment = 'left' | 'center' | 'right'
export type CardDirection = 'vertical' | 'horizontal'
export type CardImagePosition = 'top' | 'left' | 'right' | 'background'
export type CardIconPosition = 'top' | 'left' | 'right' | 'background'
export type CardShadow = 'none' | 'sm' | 'md' | 'lg' | 'xl'
export type CardImageShadow = 'none' | 'sm' | 'md' | 'lg'
export type CardIconShape = 'circle' | 'square' | 'rounded'
export type CardBadgePosition = 'top-left' | 'top-right'
export type CardBadgeShape = 'pill' | 'rounded' | 'square'
export type CardButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'gradient'
  | 'glass'
  | '3d'
  | 'rounded-full'
export type CardButtonSize = 'sm' | 'md' | 'lg' | 'xl'
export type CardButtonAlignment = 'left' | 'center' | 'right' | 'full-width'
export type CardAnimationType = 'none' | 'fade-in' | 'slide-up' | 'zoom-in'
export type CardHoverAnimation = 'none' | 'glow' | 'pulse' | 'scale'
export type CardFlipTrigger = 'hover' | 'click'
export type CardFlipDirection = 'horizontal' | 'vertical'
export type CardImageObjectFit = 'cover' | 'contain' | 'fill' | 'none'
export type CardImageHoverEffect = 'none' | 'zoom' | 'fade' | 'grayscale' | 'brighten'
export type CardIconHoverEffect = 'none' | 'scale' | 'color' | 'bounce' | 'rotate'
export type CardTextHoverEffect = 'none' | 'color' | 'underline' | 'scale' | 'italic' | 'opacity'
export type CardBadgeHoverEffect = 'none' | 'scale' | 'glow'
export type CardButtonHoverEffect = 'none' | 'scale' | 'glow' | 'slide' | 'bounce' | 'shine'
export type CardHoverEffect = 'none' | 'shadow' | 'scale' | 'lift' | 'glow' | 'border-glow' | 'tilt'

export type CardContentOrderItem =
  | 'badge'
  | 'image'
  | 'icon'
  | 'title'
  | 'subtitle'
  | 'description'
  | 'button'
import type { DeepPartial } from '../../utils/merge'
export type { DeepPartial }

export interface AdvancedCardTextContent {
  text: string
  visible: boolean
}

export interface AdvancedCardImageContent {
  src: string
  alt: string
  visible: boolean
}

export interface AdvancedCardIconContent {
  name: string
  visible: boolean
}

export interface AdvancedCardBadgeContent {
  text: string
  visible: boolean
}

export interface AdvancedCardButtonContent {
  label: string
  href: string
  icon: string
  visible: boolean
}

export interface AdvancedCardContent {
  title: AdvancedCardTextContent
  subtitle: AdvancedCardTextContent
  description: AdvancedCardTextContent
  image: AdvancedCardImageContent
  icon: AdvancedCardIconContent
  badge: AdvancedCardBadgeContent
  button: AdvancedCardButtonContent
  extra: Record<string, unknown>
}

export interface AdvancedCardLayout {
  direction: CardDirection
  imagePosition: CardImagePosition
  iconPosition: CardIconPosition
  alignment: CardAlignment
  textAlignment: CardAlignment
  titleAlignment: CardAlignment
  subtitleAlignment: CardAlignment
  descriptionAlignment: CardAlignment
  buttonAlignment: CardButtonAlignment
  buttonFullWidth: boolean
  contentOrder: CardContentOrderItem[]
  gap: number
  padding: number
  margin: string
  width: string
  height: string
  imageHeight: number
  imageWidth: number
}

export interface AdvancedCardTextStyle {
  color: string
  fontSize: string
  fontFamily: string
}

export interface AdvancedCardStyle {
  backgroundColor: string
  opacity: number
  border: {
    color: string
    width: number
    radius: number
  }
  shadow: {
    card: CardShadow
    image: CardImageShadow
    icon: CardImageShadow
  }
  text: {
    fontFamily: string
    lineHeight: string
    letterSpacing: string
    title: AdvancedCardTextStyle
    subtitle: Omit<AdvancedCardTextStyle, 'fontFamily'> & { fontFamily?: string }
    description: Omit<AdvancedCardTextStyle, 'fontFamily'> & { fontFamily?: string }
  }
  image: {
    objectFit: CardImageObjectFit
    overlayColor: string
    overlayOpacity: number
    borderRadius: number
  }
  icon: {
    size: number
    color: string
    backgroundColor: string
    shape: CardIconShape
    borderRadius: number
    padding: number
  }
  badge: {
    color: string
    textColor: string
    position: CardBadgePosition
    shape: CardBadgeShape
  }
  button: {
    variant: CardButtonVariant
    color: string
    textColor: string
    size: CardButtonSize
    radius: number
  }
}

export interface AdvancedCardHoverImage {
  effect: CardImageHoverEffect
  zoom: number
  brightness: number
  grayscale: number
  duration: number
}

export interface AdvancedCardHoverIcon {
  effect: CardIconHoverEffect
  scale: number
  color: string
  backgroundColor: string
  duration: number
}

export interface AdvancedCardHoverText {
  title: CardTextHoverEffect
  subtitle: CardTextHoverEffect
  description: CardTextHoverEffect
}

export interface AdvancedCardHoverBadge {
  effect: CardBadgeHoverEffect
}

export interface AdvancedCardHoverButton {
  effect: CardButtonHoverEffect
  color: string
  textColor: string
}

export interface AdvancedCardHoverCard {
  effect: CardHoverEffect
  shadow: CardShadow
  scale: number
  tilt: number
  glowColor: string
  glowIntensity: number
  gradientFrom: string
  gradientTo: string
  duration: number
}

export interface AdvancedCardInteraction {
  hover: {
    card: AdvancedCardHoverCard
    image: AdvancedCardHoverImage
    icon: AdvancedCardHoverIcon
    text: AdvancedCardHoverText
    badge: AdvancedCardHoverBadge
    button: AdvancedCardHoverButton
  }
  click: {
    href?: string
    action: 'none' | 'link' | 'custom'
  }
  flip: {
    enabled: boolean
    trigger: CardFlipTrigger
    direction: CardFlipDirection
    duration: number
    perspective: number
  }
}

export interface AdvancedCardAnimation {
  entry: {
    type: CardAnimationType
    delay: number
    duration: number
    easing: string
  }
  hoverAnimation: CardHoverAnimation
  transitionDuration: number
}

export interface AdvancedCardResponsive {
  hideOnMobile: boolean
  hideOnTablet: boolean
  layoutOverrides: {
    mobile?: DeepPartial<AdvancedCardLayout>
    tablet?: DeepPartial<AdvancedCardLayout>
  }
  mobileStyles: DeepPartial<AdvancedCardStyle>
  tabletStyles: DeepPartial<AdvancedCardStyle>
}

export interface AdvancedCardSystem {
  visible: boolean
  customClass: string
  componentId: string
  editable: boolean
  legacyProps?: Record<string, unknown>
}

export interface AdvancedCardMeta {
  migratedFrom?: 'legacy-flat' | 'structured'
  notes?: string[]
}

export interface AdvancedCard {
  id: string
  type: AdvancedCardType
  variant: AdvancedCardVariant
  schemaVersion: AdvancedCardSchemaVersion
  content: AdvancedCardContent
  layout: AdvancedCardLayout
  style: AdvancedCardStyle
  interaction: AdvancedCardInteraction
  animation: AdvancedCardAnimation
  responsive: AdvancedCardResponsive
  system: AdvancedCardSystem
  meta: AdvancedCardMeta
}

export interface LegacyAdvancedCardProps {
  showImage?: boolean
  image?: string
  alt?: string
  imagePosition?: CardImagePosition
  imageHeight?: number
  imageWidth?: number
  objectFit?: CardImageObjectFit
  overlayColor?: string
  overlayOpacity?: number
  imageShadow?: CardImageShadow
  imageBorderRadius?: number

  imageHoverEffect?: CardImageHoverEffect
  imageHoverZoom?: number
  imageHoverBrightness?: number
  imageHoverGrayscale?: number
  imageHoverDuration?: number

  showIcon?: boolean
  icon?: string
  iconSize?: number
  iconColor?: string
  iconBackgroundColor?: string
  iconShape?: CardIconShape
  iconBorderRadius?: number
  iconPadding?: number
  iconShadow?: CardImageShadow
  iconPosition?: CardIconPosition

  iconHoverEffect?: CardIconHoverEffect
  iconHoverScale?: number
  iconHoverColor?: string
  iconBgHoverColor?: string
  iconHoverDuration?: number

  showTitle?: boolean
  title?: string
  titleColor?: string
  titleFontSize?: string
  titleFontFamily?: string
  titleAlignment?: CardAlignment
  titleHoverEffect?: Extract<CardTextHoverEffect, 'none' | 'color' | 'underline' | 'scale'>

  showSubtitle?: boolean
  subtitle?: string
  subtitleColor?: string
  subtitleFontSize?: string
  subtitleAlign?: CardAlignment
  subtitleHoverEffect?: Extract<CardTextHoverEffect, 'none' | 'color' | 'italic'>

  showDescription?: boolean
  description?: string
  descriptionColor?: string
  descriptionFontSize?: string
  descriptionAlign?: CardAlignment
  descriptionHoverEffect?: Extract<CardTextHoverEffect, 'none' | 'color' | 'opacity'>

  textAlignment?: CardAlignment
  lineHeight?: string
  textSpacing?: string
  fontFamily?: string

  showBadge?: boolean
  badgeText?: string
  badgeColor?: string
  badgeTextColor?: string
  badgePosition?: CardBadgePosition
  badgeShape?: CardBadgeShape
  badgeHoverEffect?: CardBadgeHoverEffect

  showButton?: boolean
  buttonText?: string
  buttonLink?: string
  buttonStyle?: CardButtonVariant
  buttonColor?: string
  buttonTextColor?: string
  buttonAlignment?: CardButtonAlignment
  buttonIcon?: string
  buttonSize?: CardButtonSize
  buttonRadius?: number
  buttonFullWidth?: boolean

  buttonHoverEffect?: CardButtonHoverEffect
  buttonHoverColor?: string
  buttonTextHoverColor?: string

  cardHoverEffect?: CardHoverEffect
  cardHoverShadow?: CardShadow
  cardHoverScale?: number
  cardHoverTilt?: number
  cardHoverGlowColor?: string
  cardHoverGlowIntensity?: number
  cardHoverGradientFrom?: string
  cardHoverGradientTo?: string
  cardHoverDuration?: number

  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
  borderRadius?: number
  shadow?: CardShadow
  padding?: number
  margin?: string
  width?: string
  height?: string

  animationType?: CardAnimationType
  animationDelay?: number
  hoverAnimation?: CardHoverAnimation
  transitionDuration?: number

  enableFlip?: boolean
  flipOn?: CardFlipTrigger
  flipDirection?: CardFlipDirection
  flipDuration?: number
  flipPerspective?: number

  visible?: boolean
  id?: string
  customClass?: string
  componentId?: string
  editable?: boolean

  onUpdate?: (...args: any[]) => void
  onSelect?: (...args: any[]) => void
  onComponentUpdate?: (...args: any[]) => void
  onClick?: (...args: any[]) => void
  onMouseEnter?: (...args: any[]) => void
  onMouseLeave?: (...args: any[]) => void

  [key: string]: unknown
}

export type AdvancedCardInput =
  | DeepPartial<AdvancedCard>
  | LegacyAdvancedCardProps
  | (DeepPartial<AdvancedCard> & LegacyAdvancedCardProps)
