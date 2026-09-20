import { defaultImageProps } from './defaults'
import type {
  ImageAlignment,
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

export function normalizeImage(props: Record<string, any> = {}): ImageProps {
  const source = props.src ?? props.image ?? props.url ?? props.imageUrl
  const alignment = asAlignment(props.alignment ?? props.textAlign ?? props.align, defaultImageProps.alignment || 'center')

  return {
    ...defaultImageProps,
    ...props,
    src: asString(source, defaultImageProps.src || ''),
    url: asString(source, defaultImageProps.src || ''),
    image: asString(source, defaultImageProps.src || ''),
    imageUrl: asString(source, defaultImageProps.src || ''),
    alt: asString(props.alt, defaultImageProps.alt || 'Image'),
    linkUrl: asString(props.linkUrl ?? props.link ?? props.href, defaultImageProps.linkUrl || ''),
    openInNewTab: asBoolean(props.openInNewTab, defaultImageProps.openInNewTab ?? false),
    objectFit: asObjectFit(props.objectFit, defaultImageProps.objectFit || 'contain'),
    objectPosition: asString(props.objectPosition, defaultImageProps.objectPosition || 'center'),
    borderRadius: asString(props.borderRadius, String(defaultImageProps.borderRadius ?? '0px')),
    shape: asShape(props.shape, defaultImageProps.shape || 'default'),
    customShape: asString(props.customShape, defaultImageProps.customShape || ''),
    showGradientBorder: asBoolean(props.showGradientBorder, defaultImageProps.showGradientBorder ?? false),
    gradientBorderColors: asString(props.gradientBorderColors, defaultImageProps.gradientBorderColors || ''),
    gradientBorderDirection: asString(props.gradientBorderDirection, defaultImageProps.gradientBorderDirection || '135deg'),
    gradientBorderWidth: asString(props.gradientBorderWidth, defaultImageProps.gradientBorderWidth || '10px'),
    gradientBorderType: asGradientBorderType(props.gradientBorderType, defaultImageProps.gradientBorderType || 'conic'),
    shadow: asShadow(props.shadow, defaultImageProps.shadow || 'none'),
    width: asString(props.width, defaultImageProps.width || '100%'),
    height: asString(props.height, defaultImageProps.height || 'auto'),
    maxWidth: asString(props.maxWidth, defaultImageProps.maxWidth || '100%'),
    maxHeight: asString(props.maxHeight, defaultImageProps.maxHeight || 'none'),
    alignment,
    textAlign: alignment,
    componentPositionX: asString(props.componentPositionX, defaultImageProps.componentPositionX || '0px'),
    componentPositionY: asString(props.componentPositionY, defaultImageProps.componentPositionY || '0px'),
    imageZoom: asNumber(props.imageZoom, defaultImageProps.imageZoom || 1),
    caption: asString(props.caption, defaultImageProps.caption || ''),
    captionPosition: asString(props.captionPosition, defaultImageProps.captionPosition || 'bottom') as ImageProps['captionPosition'],
    captionAlignment: asAlignment(props.captionAlignment, defaultImageProps.captionAlignment || 'center'),
    showOverlay: asBoolean(props.showOverlay, defaultImageProps.showOverlay ?? false),
    overlayColor: asString(props.overlayColor, defaultImageProps.overlayColor || '#000000'),
    overlayOpacity: asNumber(props.overlayOpacity, defaultImageProps.overlayOpacity || 0.3),
    overlayText: asString(props.overlayText, defaultImageProps.overlayText || ''),
    hoverEffect: asHoverEffect(props.hoverEffect, defaultImageProps.hoverEffect || 'none'),
    hoverZoom: asNumber(props.hoverZoom, defaultImageProps.hoverZoom || 1.1),
    hoverBrightness: asNumber(props.hoverBrightness, defaultImageProps.hoverBrightness || 1.2),
    hoverDuration: asNumber(props.hoverDuration, defaultImageProps.hoverDuration || 0.3),
    filter: asString(props.filter, defaultImageProps.filter || 'none'),
    lazyLoad: asBoolean(props.lazyLoad, defaultImageProps.lazyLoad ?? false),
    showLightbox: asBoolean(props.showLightbox, defaultImageProps.showLightbox ?? false),
    className: asString(props.className, defaultImageProps.className || ''),
    customId: asString(props.customId, defaultImageProps.customId || ''),
    margin: asString(props.margin, defaultImageProps.margin || '0px'),
    padding: asString(props.padding, defaultImageProps.padding || '0px'),
    border: asString(props.border, defaultImageProps.border || 'none'),
  }
}
