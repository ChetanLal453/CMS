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
  if (shape === 'circle') return '999px'
  if (shape === 'rounded') return '24px'
  if (shape === 'square') return '0px'
  return typeof borderRadius === 'number' ? `${borderRadius}px` : String(borderRadius ?? '0px')
}

function buildGradientBorderBackground(type?: string, direction?: string, colors?: string) {
  if (!colors) return undefined
  if (type === 'radial') return `radial-gradient(circle, ${colors})`
  if (type === 'conic') return `conic-gradient(from ${direction || '135deg'}, ${colors})`
  return `linear-gradient(${direction || '135deg'}, ${colors})`
}

export function createImageViewModel(props: Record<string, any> = {}): ImageViewModel {
  const normalized = normalizeImage(props)
  const hasImage = Boolean(normalized.src && normalized.src.trim())
  const hasLink = Boolean(normalized.linkUrl && normalized.linkUrl.trim())
  const clipPath = resolveClipPath(normalized.shape, normalized.customShape)
  const resolvedBorderRadius = resolveBorderRadius(normalized.shape, normalized.borderRadius)
  const gradientBorderBackground = normalized.showGradientBorder
    ? buildGradientBorderBackground(normalized.gradientBorderType, normalized.gradientBorderDirection, normalized.gradientBorderColors)
    : undefined

  return {
    ...normalized,
    hasImage,
    isRenderable: hasImage,
    hasLink,
    resolvedSrc: resolveAdminMediaUrl(normalized.src || ''),
    showCaption: Boolean(normalized.caption && normalized.caption.trim()),
    showOverlayLayer: Boolean(normalized.showOverlay || normalized.overlayText),
    linkTarget: normalized.openInNewTab ? '_blank' : '_self',
    linkRel: normalized.openInNewTab ? 'noopener noreferrer' : undefined,
    resolvedBorderRadius,
    resolvedClassName: `${normalized.className || ''}`.trim(),
    clipPath,
    containerStyle: {
      textAlign: normalized.alignment,
      margin: normalized.margin || '0 auto',
      transform: `translate(${normalized.componentPositionX}, ${normalized.componentPositionY})`,
      position: 'relative',
      width: '100%',
      maxWidth: '100%',
    },
    frameStyle: {
      position: 'relative',
      display: 'block',
      width: normalized.width || '100%',
      maxWidth: normalized.maxWidth || '100%',
      padding: normalized.showGradientBorder ? normalized.gradientBorderWidth : normalized.padding,
      border: normalized.border,
      borderRadius: resolvedBorderRadius,
      background: gradientBorderBackground,
      boxShadow: SHADOW_MAP[normalized.shadow || 'none'],
      overflow: 'hidden',
    },
    imageStyle: {
      width: normalized.width || '100%',
      height: normalized.height || 'auto',
      maxWidth: normalized.maxWidth || '100%',
      maxHeight: normalized.maxHeight || 'none',
      objectFit: normalized.objectFit || 'contain',
      objectPosition: normalized.objectPosition,
      borderRadius: resolvedBorderRadius,
      display: 'block',
      filter: normalized.filter,
      transform: `scale(${normalized.imageZoom || 1})`,
      transition: `transform ${normalized.hoverDuration}s ease, filter ${normalized.hoverDuration}s ease, opacity ${normalized.hoverDuration}s ease`,
      clipPath,
      cursor: normalized.showLightbox ? 'zoom-in' : hasLink ? 'pointer' : 'default',
    },
    hoverImageStyle: {
      transform:
        normalized.hoverEffect === 'zoom'
          ? `scale(${normalized.hoverZoom || normalized.imageZoom || 1.1})`
          : normalized.hoverEffect === 'rotate'
            ? `scale(${normalized.imageZoom || 1}) rotate(3deg)`
            : normalized.hoverEffect === 'flip'
              ? `scale(${normalized.imageZoom || 1}) rotateY(180deg)`
              : `scale(${normalized.imageZoom || 1})`,
      filter:
        normalized.hoverEffect === 'grayscale'
          ? 'grayscale(1)'
          : normalized.hoverEffect === 'brighten'
            ? `brightness(${normalized.hoverBrightness || 1.2})`
            : normalized.hoverEffect === 'blur'
              ? 'blur(1.5px)'
              : normalized.filter,
      opacity: normalized.hoverEffect === 'fade' ? 0.82 : 1,
    },
    overlayStyle: {
      position: 'absolute',
      inset: 0,
      backgroundColor: normalized.overlayColor,
      opacity: normalized.showOverlay ? normalized.overlayOpacity : 0,
      display: normalized.showOverlayLayer ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
      transition: `opacity ${normalized.hoverDuration}s ease`,
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
      textAlign: normalized.captionAlignment,
      fontSize: '14px',
      color: 'var(--canvas-text2, #64748b)',
    },
  }
}
