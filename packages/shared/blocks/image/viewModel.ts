import { normalizeImage } from './normalize'
import type { ImageViewModel } from './types'
import { resolveAdminMediaUrl } from '../../page/adminUrls'

const SHADOW_MAP = {
  none: 'none',
  sm: '0 8px 18px rgba(15, 23, 42, 0.08)',
  md: '0 14px 28px rgba(15, 23, 42, 0.14)',
  lg: '0 20px 38px rgba(15, 23, 42, 0.18)',
  xl: '0 26px 46px rgba(15, 23, 42, 0.24)',
}

function resolveClipPath(shape?: string, customShape?: string) {
  switch (shape) {
    case 'circle':
      return 'circle(50% at 50% 50%)'
    case 'hexagon':
      return 'polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0 50%)'
    case 'diamond':
      return 'polygon(50% 0%, 100% 50%, 50% 100%, 0 50%)'
    case 'star':
      return 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
    case 'heart':
      return 'path("M50,90 C20,70 0,45 0,25 C0,5 20,0 35,10 C45,17 50,25 50,25 C50,25 55,17 65,10 C80,0 100,5 100,25 C100,45 80,70 50,90 Z")'
    case 'parallelogram':
      return 'polygon(15% 0, 100% 0, 85% 100%, 0 100%)'
    case 'triangle':
      return 'polygon(50% 0%, 0% 100%, 100% 100%)'
    case 'blob':
      return 'polygon(20% 15%, 45% 5%, 78% 12%, 94% 38%, 88% 72%, 64% 91%, 31% 88%, 8% 65%, 6% 36%)'
    case 'speech-bubble':
      return 'polygon(0 0, 100% 0, 100% 80%, 62% 80%, 52% 100%, 46% 80%, 0 80%)'
    case 'cross':
      return 'polygon(35% 0, 65% 0, 65% 35%, 100% 35%, 100% 65%, 65% 65%, 65% 100%, 35% 100%, 35% 65%, 0 65%, 0 35%, 35% 35%)'
    case 'custom':
      return customShape || undefined
    default:
      return undefined
  }
}

function resolveBorderRadius(shape?: string, borderRadius?: string | number) {
  if (borderRadius !== undefined && borderRadius !== null && String(borderRadius).trim() !== '') {
    return typeof borderRadius === 'number' ? `${borderRadius}px` : String(borderRadius)
  }
  if (shape === 'circle') return '999px'
  if (shape === 'rounded') return '24px'
  if (shape === 'square') return '0px'
  return '0px'
}

function buildGradientBorderBackground(type?: string, direction?: string, colors?: string) {
  if (!colors) return undefined
  if (type === 'radial') return `radial-gradient(circle, ${colors})`
  if (type === 'conic') return `conic-gradient(from ${direction || '135deg'}, ${colors})`
  return `linear-gradient(${direction || '135deg'}, ${colors})`
}

export function createImageViewModel(props: Record<string, any> = {}): ImageViewModel {
  const normalized = normalizeImage(props)
  const src = normalized.content?.src ?? normalized.src ?? ''
  const hasImage = Boolean(src && src.trim())
  const linkUrl = normalized.content?.linkUrl ?? normalized.linkUrl ?? ''
  const hasLink = Boolean(linkUrl && linkUrl.trim())
  const openInNewTab = Boolean(normalized.content?.openInNewTab ?? normalized.openInNewTab)
  const caption = normalized.content?.caption ?? normalized.caption ?? ''
  const showCaption = Boolean(caption && caption.trim())

  const shape = normalized.style?.shape ?? normalized.shape
  const customShape = normalized.style?.customShape ?? normalized.customShape
  const clipPath = resolveClipPath(shape, customShape)

  const rawBorderRadius = normalized.style?.borderRadius ?? normalized.borderRadius
  const resolvedBorderRadius = resolveBorderRadius(shape, rawBorderRadius)

  const showGradientBorder = Boolean(normalized.style?.showGradientBorder ?? normalized.showGradientBorder)
  const gradientBorderType = normalized.style?.gradientBorderType ?? normalized.gradientBorderType
  const gradientBorderDirection = normalized.style?.gradientBorderDirection ?? normalized.gradientBorderDirection
  const gradientBorderColors = normalized.style?.gradientBorderColors ?? normalized.gradientBorderColors
  const gradientBorderWidth = normalized.style?.gradientBorderWidth ?? normalized.gradientBorderWidth ?? '10px'
  const gradientBorderBackground = showGradientBorder
    ? buildGradientBorderBackground(gradientBorderType, gradientBorderDirection, gradientBorderColors)
    : undefined

  const showOverlay = Boolean(normalized.style?.showOverlay ?? normalized.showOverlay)
  const overlayText = String(normalized.style?.overlayText ?? normalized.overlayText ?? '').trim()
  const showOverlayLayer = Boolean(showOverlay || overlayText)

  const width = normalized.width ?? '100%'
  const height = normalized.height ?? 'auto'
  const maxWidth = normalized.maxWidth ?? '100%'
  const maxHeight = normalized.maxHeight ?? 'none'
  const objectFit = normalized.objectFit ?? 'contain'
  const objectPosition = normalized.objectPosition ?? 'center'
  const shadow = normalized.shadow ?? 'none'
  const hoverDuration = normalized.hoverDuration ?? 0.3
  const imageZoom = normalized.imageZoom ?? 1

  return {
    ...normalized,
    src,
    linkUrl,
    caption,
    openInNewTab,
    hasImage,
    isRenderable: hasImage,
    hasLink,
    resolvedSrc: resolveAdminMediaUrl(src),
    showCaption,
    showOverlayLayer,
    linkTarget: openInNewTab ? '_blank' : '_self',
    linkRel: openInNewTab ? 'noopener noreferrer' : undefined,
    resolvedBorderRadius,
    resolvedClassName: `${normalized.className || ''}`.trim(),
    clipPath,
    containerStyle: {
      textAlign: normalized.alignment ?? 'center',
      margin: normalized.margin ?? '0 auto',
      transform:
        normalized.componentPositionX || normalized.componentPositionY
          ? `translate(${normalized.componentPositionX || '0px'}, ${normalized.componentPositionY || '0px'})`
          : undefined,
      position: 'relative',
      width: '100%',
      maxWidth: '100%',
    },
    frameStyle: {
      position: 'relative',
      display: 'block',
      width,
      maxWidth,
      padding: showGradientBorder ? gradientBorderWidth : (normalized.padding ?? undefined),
      border: normalized.border ?? undefined,
      borderRadius: resolvedBorderRadius,
      background: gradientBorderBackground,
      boxShadow: SHADOW_MAP[shadow] || 'none',
      overflow: 'hidden',
    },
    imageStyle: {
      width,
      height,
      maxWidth,
      maxHeight,
      objectFit,
      objectPosition,
      borderRadius: resolvedBorderRadius,
      display: 'block',
      filter: normalized.filter && normalized.filter !== 'none' ? normalized.filter : undefined,
      transform: imageZoom !== 1 ? `scale(${imageZoom})` : undefined,
      transition: `transform ${hoverDuration}s ease, filter ${hoverDuration}s ease, opacity ${hoverDuration}s ease`,
      clipPath,
      cursor: normalized.showLightbox ? 'zoom-in' : hasLink ? 'pointer' : 'default',
    },
    hoverImageStyle: {
      transform:
        normalized.hoverEffect === 'zoom'
          ? `scale(${normalized.hoverZoom || 1.1})`
          : normalized.hoverEffect === 'rotate'
            ? `scale(${imageZoom}) rotate(3deg)`
            : normalized.hoverEffect === 'flip'
              ? `scale(${imageZoom}) rotateY(180deg)`
              : imageZoom !== 1
                ? `scale(${imageZoom})`
                : undefined,
      filter:
        normalized.hoverEffect === 'grayscale'
          ? 'grayscale(1)'
          : normalized.hoverEffect === 'brighten'
            ? `brightness(${normalized.hoverBrightness || 1.2})`
            : normalized.hoverEffect === 'blur'
              ? 'blur(1.5px)'
              : (normalized.filter && normalized.filter !== 'none' ? normalized.filter : undefined),
      opacity: normalized.hoverEffect === 'fade' ? 0.82 : 1,
    },
    overlayStyle: {
      position: 'absolute',
      inset: 0,
      backgroundColor: showOverlayLayer ? (normalized.overlayColor || '#000000') : undefined,
      opacity: showOverlay ? (normalized.overlayOpacity ?? 0.3) : 0,
      display: showOverlayLayer ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
      transition: `opacity ${hoverDuration}s ease`,
    },
    overlayTextStyle: {
      color: '#ffffff',
      fontSize: '14px',
      fontWeight: 600,
      textAlign: 'center',
      padding: '16px',
    },
    captionStyle: {
      marginTop: normalized.captionPosition === 'bottom' ? '10px' : 0,
      marginBottom: normalized.captionPosition === 'top' ? '10px' : 0,
      textAlign: normalized.captionAlignment ?? 'center',
      fontSize: '14px',
      color: 'var(--canvas-text2, #64748b)',
    },
  }
}
