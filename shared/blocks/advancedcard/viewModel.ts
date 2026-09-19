import type { AdvancedCard, LegacyAdvancedCardProps } from './types'
import { normalizeAdvancedCard } from './normalize'

export interface AdvancedCardComponentProps extends LegacyAdvancedCardProps {
  onUpdate?: (props: any) => void
  onSelect?: () => void
  onComponentUpdate?: (props: any) => void
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  componentId?: string
  editable?: boolean
  [key: string]: unknown
}

export interface AdvancedCardViewModel {
  id: string
  variant: AdvancedCard['variant']
  resolvedImage: string
  showImage: boolean
  image: string
  alt: string
  imagePosition: LegacyAdvancedCardProps['imagePosition']
  imageHeight: number
  imageWidth: number
  objectFit: LegacyAdvancedCardProps['objectFit']
  overlayColor: string
  overlayOpacity: number
  imageShadow: LegacyAdvancedCardProps['imageShadow']
  imageBorderRadius: number
  imageHoverEffect: LegacyAdvancedCardProps['imageHoverEffect']
  imageHoverZoom: number
  imageHoverBrightness: number
  imageHoverGrayscale: number
  imageHoverDuration: number
  showIcon: boolean
  icon: string
  iconSize: number
  iconColor: string
  iconBackgroundColor: string
  iconShape: LegacyAdvancedCardProps['iconShape']
  iconBorderRadius: number
  iconPadding: number
  iconShadow: LegacyAdvancedCardProps['iconShadow']
  iconPosition: LegacyAdvancedCardProps['iconPosition']
  iconHoverEffect: LegacyAdvancedCardProps['iconHoverEffect']
  iconHoverScale: number
  iconHoverColor: string
  iconBgHoverColor: string
  iconHoverDuration: number
  showTitle: boolean
  title: string
  titleColor: string
  titleFontSize: string
  titleFontFamily: string
  titleAlignment: LegacyAdvancedCardProps['titleAlignment']
  titleHoverEffect: LegacyAdvancedCardProps['titleHoverEffect']
  showSubtitle: boolean
  subtitle: string
  subtitleColor: string
  subtitleFontSize: string
  subtitleAlign: LegacyAdvancedCardProps['subtitleAlign']
  subtitleHoverEffect: LegacyAdvancedCardProps['subtitleHoverEffect']
  showDescription: boolean
  description: string
  descriptionColor: string
  descriptionFontSize: string
  descriptionAlign: LegacyAdvancedCardProps['descriptionAlign']
  descriptionHoverEffect: LegacyAdvancedCardProps['descriptionHoverEffect']
  textAlignment: LegacyAdvancedCardProps['textAlignment']
  lineHeight: string
  textSpacing: string
  fontFamily: string
  showBadge: boolean
  badgeText: string
  badgeColor: string
  badgeTextColor: string
  badgePosition: LegacyAdvancedCardProps['badgePosition']
  badgeShape: LegacyAdvancedCardProps['badgeShape']
  badgeHoverEffect: LegacyAdvancedCardProps['badgeHoverEffect']
  showButton: boolean
  buttonText: string
  buttonLink: string
  buttonStyle: LegacyAdvancedCardProps['buttonStyle']
  buttonColor: string
  buttonTextColor: string
  buttonAlignment: LegacyAdvancedCardProps['buttonAlignment']
  buttonIcon: string
  buttonSize: LegacyAdvancedCardProps['buttonSize']
  buttonRadius: number
  buttonFullWidth: boolean
  buttonHoverEffect: LegacyAdvancedCardProps['buttonHoverEffect']
  buttonHoverColor: string
  buttonTextHoverColor: string
  cardHoverEffect: LegacyAdvancedCardProps['cardHoverEffect']
  cardHoverShadow: LegacyAdvancedCardProps['cardHoverShadow']
  cardHoverScale: number
  cardHoverTilt: number
  cardHoverGlowColor: string
  cardHoverGlowIntensity: number
  cardHoverGradientFrom: string
  cardHoverGradientTo: string
  cardHoverDuration: number
  backgroundColor: string
  borderColor: string
  borderWidth: number
  borderRadius: number
  shadow: LegacyAdvancedCardProps['shadow']
  padding: number
  margin: string
  width: string
  height: string
  animationType: LegacyAdvancedCardProps['animationType']
  animationDelay: number
  hoverAnimation: LegacyAdvancedCardProps['hoverAnimation']
  transitionDuration: number
  enableFlip: boolean
  flipOn: LegacyAdvancedCardProps['flipOn']
  flipDirection: LegacyAdvancedCardProps['flipDirection']
  flipDuration: number
  flipPerspective: number
  visible: boolean
  customClass: string
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export function createAdvancedCardView(
  card: AdvancedCard,
  props: AdvancedCardComponentProps,
  resolvedImage: string,
): AdvancedCardViewModel {
  const resolvedTextAlignment = (props.textAlignment || card.layout.textAlignment || props.alignment || 'left') as LegacyAdvancedCardProps['textAlignment']
  const resolvedTitleAlignment = (props.titleAlignment || card.layout.titleAlignment || resolvedTextAlignment || 'left') as LegacyAdvancedCardProps['titleAlignment']
  const resolvedSubtitleAlign = (props.subtitleAlign || card.layout.subtitleAlignment || resolvedTextAlignment || 'left') as LegacyAdvancedCardProps['subtitleAlign']
  const resolvedDescriptionAlign = (props.descriptionAlign || card.layout.descriptionAlignment || resolvedTextAlignment || 'left') as LegacyAdvancedCardProps['descriptionAlign']
  const resolvedButtonAlignment = (props.buttonAlignment || card.layout.buttonAlignment || 'left') as LegacyAdvancedCardProps['buttonAlignment']
  const resolvedButtonFullWidth = Boolean(
    props.buttonFullWidth ??
    card.layout.buttonFullWidth ??
    (resolvedButtonAlignment === 'full-width' ||
      resolvedButtonAlignment === 'full' ||
      props.buttonAlignment === 'full-width' ||
      props.buttonAlignment === 'full' ||
      card.layout.buttonAlignment === 'full-width' ||
      card.layout.buttonAlignment === 'full')
  )

  return {
    id: card.id || '',
    variant: card.variant,
    resolvedImage,
    showImage: card.content.image.visible,
    image: card.content.image.src,
    alt: card.content.image.alt,
    imagePosition: card.layout.imagePosition,
    imageHeight: card.layout.imageHeight,
    imageWidth: card.layout.imageWidth,
    objectFit: card.style.image.objectFit,
    overlayColor: card.style.image.overlayColor,
    overlayOpacity: card.style.image.overlayOpacity,
    imageShadow: card.style.shadow.image,
    imageBorderRadius: card.style.image.borderRadius,
    imageHoverEffect: card.interaction.hover.image.effect,
    imageHoverZoom: card.interaction.hover.image.zoom,
    imageHoverBrightness: card.interaction.hover.image.brightness,
    imageHoverGrayscale: card.interaction.hover.image.grayscale,
    imageHoverDuration: card.interaction.hover.image.duration,
    showIcon: card.content.icon.visible,
    icon: card.content.icon.name,
    iconSize: card.style.icon.size,
    iconColor: card.style.icon.color,
    iconBackgroundColor: card.style.icon.backgroundColor,
    iconShape: card.style.icon.shape,
    iconBorderRadius: card.style.icon.borderRadius,
    iconPadding: card.style.icon.padding,
    iconShadow: card.style.shadow.icon,
    iconPosition: card.layout.iconPosition,
    iconHoverEffect: card.interaction.hover.icon.effect,
    iconHoverScale: card.interaction.hover.icon.scale,
    iconHoverColor: card.interaction.hover.icon.color,
    iconBgHoverColor: card.interaction.hover.icon.backgroundColor,
    iconHoverDuration: card.interaction.hover.icon.duration,
    showTitle: card.content.title.visible,
    title: card.content.title.text,
    titleColor: card.style.text.title.color,
    titleFontSize: card.style.text.title.fontSize,
    titleFontFamily: card.style.text.title.fontFamily || card.style.text.fontFamily,
    titleAlignment: resolvedTitleAlignment,
    titleHoverEffect: card.interaction.hover.text.title as AdvancedCardViewModel['titleHoverEffect'],
    showSubtitle: card.content.subtitle.visible,
    subtitle: card.content.subtitle.text,
    subtitleColor: card.style.text.subtitle.color,
    subtitleFontSize: card.style.text.subtitle.fontSize,
    subtitleAlign: resolvedSubtitleAlign,
    subtitleHoverEffect: card.interaction.hover.text.subtitle as AdvancedCardViewModel['subtitleHoverEffect'],
    showDescription: card.content.description.visible,
    description: card.content.description.text,
    descriptionColor: card.style.text.description.color,
    descriptionFontSize: card.style.text.description.fontSize,
    descriptionAlign: resolvedDescriptionAlign,
    descriptionHoverEffect: card.interaction.hover.text.description as AdvancedCardViewModel['descriptionHoverEffect'],
    textAlignment: resolvedTextAlignment,
    lineHeight: card.style.text.lineHeight,
    textSpacing: card.style.text.letterSpacing,
    fontFamily: card.style.text.fontFamily,
    showBadge: card.content.badge.visible,
    badgeText: card.content.badge.text,
    badgeColor: card.style.badge.color,
    badgeTextColor: card.style.badge.textColor,
    badgePosition: card.style.badge.position,
    badgeShape: card.style.badge.shape,
    badgeHoverEffect: card.interaction.hover.badge.effect,
    showButton: card.content.button.visible,
    buttonText: card.content.button.label,
    buttonLink: card.content.button.href,
    buttonStyle: card.style.button.variant,
    buttonColor: card.style.button.color,
    buttonTextColor: card.style.button.textColor,
    buttonAlignment: resolvedButtonAlignment,
    buttonIcon: card.content.button.icon,
    buttonSize: card.style.button.size,
    buttonRadius: card.style.button.radius,
    buttonFullWidth: resolvedButtonFullWidth,
    buttonHoverEffect: card.interaction.hover.button.effect,
    buttonHoverColor: card.interaction.hover.button.color,
    buttonTextHoverColor: card.interaction.hover.button.textColor,
    cardHoverEffect: card.interaction.hover.card.effect,
    cardHoverShadow: card.interaction.hover.card.shadow,
    cardHoverScale: card.interaction.hover.card.scale,
    cardHoverTilt: card.interaction.hover.card.tilt,
    cardHoverGlowColor: card.interaction.hover.card.glowColor,
    cardHoverGlowIntensity: card.interaction.hover.card.glowIntensity,
    cardHoverGradientFrom: card.interaction.hover.card.gradientFrom,
    cardHoverGradientTo: card.interaction.hover.card.gradientTo,
    cardHoverDuration: card.interaction.hover.card.duration,
    backgroundColor: card.style.backgroundColor,
    borderColor: card.style.border.color,
    borderWidth: card.style.border.width,
    borderRadius: card.style.border.radius,
    shadow: card.style.shadow.card,
    padding: card.layout.padding,
    margin: card.layout.margin,
    width: card.layout.width,
    height: card.layout.height,
    animationType: card.animation.entry.type,
    animationDelay: card.animation.entry.delay,
    hoverAnimation: card.animation.hoverAnimation,
    transitionDuration: card.animation.transitionDuration,
    enableFlip: card.interaction.flip.enabled,
    flipOn: card.interaction.flip.trigger,
    flipDirection: card.interaction.flip.direction,
    flipDuration: card.interaction.flip.duration,
    flipPerspective: card.interaction.flip.perspective,
    visible: card.system.visible,
    customClass: card.system.customClass,
    onClick: props.onClick,
    onMouseEnter: props.onMouseEnter,
    onMouseLeave: props.onMouseLeave,
  }
}

export function createAdvancedCardBlockViewModel(input: LegacyAdvancedCardProps = {}) {
  const card = normalizeAdvancedCard(input)
  const resolvedImage = String(card.content.image.src || '')
  const view = createAdvancedCardView(card, input as AdvancedCardComponentProps, resolvedImage)

  return {
    card,
    view,
  }
}
