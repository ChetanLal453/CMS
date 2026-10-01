import { defaultImageProps } from './defaults'
import type {
  CanonicalImageContent,
  CanonicalImageResponsive,
  CanonicalImageStyle,
  ImageAlignment,
  ImageCaptionPosition,
  ImageGradientBorderType,
  ImageHoverEffect,
  ImageObjectFit,
  ImageProps,
  ImageShape,
  ImageShadow,
} from './types'
import { asString, asBoolean, asNumber } from '../../utils/merge'

function asAlignment(value: unknown, fallback: ImageAlignment): ImageAlignment {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (normalized === 'left' || normalized === 'center' || normalized === 'right') return normalized
  return fallback
}

function asObjectFit(value: unknown, fallback: ImageObjectFit): ImageObjectFit {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (['cover', 'contain', 'fill', 'none', 'scale-down'].includes(normalized)) return normalized as ImageObjectFit
  return fallback
}

function asShape(value: unknown, fallback: ImageShape): ImageShape {
  const normalized = String(value ?? '').trim().toLowerCase()
  const allowed = ['default', 'circle', 'rounded', 'square', 'hexagon', 'diamond', 'star', 'heart', 'parallelogram', 'triangle', 'blob', 'speech-bubble', 'cross', 'custom']
  return (allowed.includes(normalized) ? normalized : fallback) as ImageShape
}

function asShadow(value: unknown, fallback: ImageShadow): ImageShadow {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (['none', 'sm', 'md', 'lg', 'xl'].includes(normalized)) return normalized as ImageShadow
  return fallback
}

function asHoverEffect(value: unknown, fallback: ImageHoverEffect): ImageHoverEffect {
  const normalized = String(value ?? '').trim().toLowerCase()
  const allowed = ['none', 'zoom', 'fade', 'grayscale', 'brighten', 'blur', 'rotate', 'flip']
  return (allowed.includes(normalized) ? normalized : fallback) as ImageHoverEffect
}

function asGradientBorderType(value: unknown, fallback: ImageGradientBorderType): ImageGradientBorderType {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (['linear', 'radial', 'conic'].includes(normalized)) return normalized as ImageGradientBorderType
  return fallback
}

function asOptionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined
  const str = String(value).trim()
  return str.length > 0 ? str : undefined
}

export function normalizeImage(props: Record<string, any> = {}): ImageProps {
  const contentInput = props.content && typeof props.content === 'object' ? props.content : {}
  const styleInput = props.style && typeof props.style === 'object' ? props.style : {}
  const responsiveInput = props.responsive && typeof props.responsive === 'object' ? props.responsive : {}

  // Content Fields
  const source = contentInput.src ?? props.src ?? props.image ?? props.url ?? props.imageUrl
  const src = asString(source, defaultImageProps.src || '')
  const alt = asString(contentInput.alt ?? props.alt, defaultImageProps.alt || 'Image')
  const rawLink = contentInput.linkUrl ?? props.linkUrl ?? props.link ?? props.href
  const linkUrl = asString(rawLink, defaultImageProps.linkUrl || '')
  const openInNewTab = asBoolean(contentInput.openInNewTab ?? props.openInNewTab, defaultImageProps.openInNewTab ?? false)
  const caption = asString(contentInput.caption ?? props.caption, defaultImageProps.caption || '')
  const rawCaptionPos = contentInput.captionPosition ?? props.captionPosition
  const captionPosition = (asOptionalString(rawCaptionPos) as ImageCaptionPosition) || defaultImageProps.captionPosition || 'bottom'
  const captionAlignment = asAlignment(contentInput.captionAlignment ?? props.captionAlignment, defaultImageProps.captionAlignment || 'center')

  // Style Fields (Sparse: untouched fields remain undefined)
  const width = asOptionalString(styleInput.width ?? props.width)
  const height = asOptionalString(styleInput.height ?? props.height)
  const maxWidth = asOptionalString(styleInput.maxWidth ?? props.maxWidth)
  const maxHeight = asOptionalString(styleInput.maxHeight ?? props.maxHeight)

  const rawAlignment = styleInput.alignment ?? props.alignment ?? props.textAlign ?? props.align
  const alignment = rawAlignment !== undefined ? asAlignment(rawAlignment, 'center') : undefined

  const rawObjectFit = styleInput.objectFit ?? props.objectFit
  const objectFit = rawObjectFit !== undefined ? asObjectFit(rawObjectFit, 'contain') : undefined
  const objectPosition = asOptionalString(styleInput.objectPosition ?? props.objectPosition)

  const borderRadius = asOptionalString(styleInput.borderRadius ?? props.borderRadius)
  const rawShape = styleInput.shape ?? props.shape
  const shape = rawShape !== undefined ? asShape(rawShape, 'default') : undefined
  const customShape = asOptionalString(styleInput.customShape ?? props.customShape)

  const rawGradientBorder = styleInput.showGradientBorder ?? props.showGradientBorder
  const showGradientBorder = rawGradientBorder !== undefined ? asBoolean(rawGradientBorder, false) : undefined
  const gradientBorderColors = asOptionalString(styleInput.gradientBorderColors ?? props.gradientBorderColors)
  const gradientBorderDirection = asOptionalString(styleInput.gradientBorderDirection ?? props.gradientBorderDirection)
  const gradientBorderWidth = asOptionalString(styleInput.gradientBorderWidth ?? props.gradientBorderWidth)
  const rawGradientBorderType = styleInput.gradientBorderType ?? props.gradientBorderType
  const gradientBorderType = rawGradientBorderType !== undefined ? asGradientBorderType(rawGradientBorderType, 'conic') : undefined

  const rawShadow = styleInput.shadow ?? props.shadow
  const shadow = rawShadow !== undefined ? asShadow(rawShadow, 'none') : undefined
  const border = asOptionalString(styleInput.border ?? props.border)
  const margin = asOptionalString(styleInput.margin ?? props.margin)
  const padding = asOptionalString(styleInput.padding ?? props.padding)
  const filter = asOptionalString(styleInput.filter ?? props.filter)

  const rawZoom = styleInput.imageZoom ?? props.imageZoom
  const imageZoom = rawZoom !== undefined ? asNumber(rawZoom, 1) : undefined
  const componentPositionX = asOptionalString(styleInput.componentPositionX ?? props.componentPositionX)
  const componentPositionY = asOptionalString(styleInput.componentPositionY ?? props.componentPositionY)

  const rawOverlay = styleInput.showOverlay ?? props.showOverlay
  const showOverlay = rawOverlay !== undefined ? asBoolean(rawOverlay, false) : undefined
  const overlayColor = asOptionalString(styleInput.overlayColor ?? props.overlayColor)
  const rawOpacity = styleInput.overlayOpacity ?? props.overlayOpacity
  const overlayOpacity = rawOpacity !== undefined ? asNumber(rawOpacity, 0.3) : undefined
  const overlayText = asOptionalString(styleInput.overlayText ?? props.overlayText)

  const rawHoverEffect = styleInput.hoverEffect ?? props.hoverEffect
  const hoverEffect = rawHoverEffect !== undefined ? asHoverEffect(rawHoverEffect, 'none') : undefined
  const rawHoverZoom = styleInput.hoverZoom ?? props.hoverZoom
  const hoverZoom = rawHoverZoom !== undefined ? asNumber(rawHoverZoom, 1.1) : undefined
  const rawHoverBrightness = styleInput.hoverBrightness ?? props.hoverBrightness
  const hoverBrightness = rawHoverBrightness !== undefined ? asNumber(rawHoverBrightness, 1.2) : undefined
  const rawHoverDuration = styleInput.hoverDuration ?? props.hoverDuration
  const hoverDuration = rawHoverDuration !== undefined ? asNumber(rawHoverDuration, 0.3) : undefined

  const rawLazyLoad = styleInput.lazyLoad ?? props.lazyLoad
  const lazyLoad = rawLazyLoad !== undefined ? asBoolean(rawLazyLoad, false) : undefined
  const rawLightbox = styleInput.showLightbox ?? props.showLightbox
  const showLightbox = rawLightbox !== undefined ? asBoolean(rawLightbox, false) : undefined

  const className = asOptionalString(styleInput.className ?? props.className)
  const customId = asOptionalString(styleInput.customId ?? props.customId)

  // Construct Canonical Style Object (Sparse)
  const canonicalStyle: CanonicalImageStyle = {}
  if (width !== undefined) canonicalStyle.width = width
  if (height !== undefined) canonicalStyle.height = height
  if (maxWidth !== undefined) canonicalStyle.maxWidth = maxWidth
  if (maxHeight !== undefined) canonicalStyle.maxHeight = maxHeight
  if (alignment !== undefined) canonicalStyle.alignment = alignment
  if (objectFit !== undefined) canonicalStyle.objectFit = objectFit
  if (objectPosition !== undefined) canonicalStyle.objectPosition = objectPosition
  if (borderRadius !== undefined) canonicalStyle.borderRadius = borderRadius
  if (shape !== undefined) canonicalStyle.shape = shape
  if (customShape !== undefined) canonicalStyle.customShape = customShape
  if (showGradientBorder !== undefined) canonicalStyle.showGradientBorder = showGradientBorder
  if (gradientBorderColors !== undefined) canonicalStyle.gradientBorderColors = gradientBorderColors
  if (gradientBorderDirection !== undefined) canonicalStyle.gradientBorderDirection = gradientBorderDirection
  if (gradientBorderWidth !== undefined) canonicalStyle.gradientBorderWidth = gradientBorderWidth
  if (gradientBorderType !== undefined) canonicalStyle.gradientBorderType = gradientBorderType
  if (shadow !== undefined) canonicalStyle.shadow = shadow
  if (border !== undefined) canonicalStyle.border = border
  if (margin !== undefined) canonicalStyle.margin = margin
  if (padding !== undefined) canonicalStyle.padding = padding
  if (filter !== undefined) canonicalStyle.filter = filter
  if (imageZoom !== undefined) canonicalStyle.imageZoom = imageZoom
  if (componentPositionX !== undefined) canonicalStyle.componentPositionX = componentPositionX
  if (componentPositionY !== undefined) canonicalStyle.componentPositionY = componentPositionY
  if (showOverlay !== undefined) canonicalStyle.showOverlay = showOverlay
  if (overlayColor !== undefined) canonicalStyle.overlayColor = overlayColor
  if (overlayOpacity !== undefined) canonicalStyle.overlayOpacity = overlayOpacity
  if (overlayText !== undefined) canonicalStyle.overlayText = overlayText
  if (hoverEffect !== undefined) canonicalStyle.hoverEffect = hoverEffect
  if (hoverZoom !== undefined) canonicalStyle.hoverZoom = hoverZoom
  if (hoverBrightness !== undefined) canonicalStyle.hoverBrightness = hoverBrightness
  if (hoverDuration !== undefined) canonicalStyle.hoverDuration = hoverDuration
  if (lazyLoad !== undefined) canonicalStyle.lazyLoad = lazyLoad
  if (showLightbox !== undefined) canonicalStyle.showLightbox = showLightbox
  if (className !== undefined) canonicalStyle.className = className
  if (customId !== undefined) canonicalStyle.customId = customId

  const canonicalContent: CanonicalImageContent = {
    src,
    alt,
    linkUrl,
    openInNewTab,
    caption,
    captionPosition,
    captionAlignment,
  }

  const canonicalResponsive: CanonicalImageResponsive = {
    desktop: responsiveInput.desktop || {},
    tablet: responsiveInput.tablet || {},
    mobile: responsiveInput.mobile || {},
  }

  return {
    ...props,
    version: 1,
    content: canonicalContent,
    style: canonicalStyle,
    responsive: canonicalResponsive,

    // Projections for flat backwards-compatibility
    src,
    url: src,
    image: src,
    imageUrl: src,
    alt,
    linkUrl,
    link: linkUrl,
    href: linkUrl,
    openInNewTab,
    caption,
    captionPosition,
    captionAlignment,

    width,
    height,
    maxWidth,
    maxHeight,
    alignment,
    textAlign: alignment,
    objectFit,
    objectPosition,
    borderRadius,
    shape,
    customShape,
    showGradientBorder,
    gradientBorderColors,
    gradientBorderDirection,
    gradientBorderWidth,
    gradientBorderType,
    shadow,
    border,
    margin,
    padding,
    filter,
    imageZoom,
    componentPositionX,
    componentPositionY,
    showOverlay,
    overlayColor,
    overlayOpacity,
    overlayText,
    hoverEffect,
    hoverZoom,
    hoverBrightness,
    hoverDuration,
    lazyLoad,
    showLightbox,
    className,
    customId,
  }
}
