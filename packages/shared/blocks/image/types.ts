export type ImageAlignment = 'left' | 'center' | 'right'
export type ImageObjectFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
export type ImageShape =
  | 'default'
  | 'circle'
  | 'rounded'
  | 'square'
  | 'hexagon'
  | 'diamond'
  | 'star'
  | 'heart'
  | 'parallelogram'
  | 'triangle'
  | 'blob'
  | 'speech-bubble'
  | 'cross'
  | 'custom'
export type ImageShadow = 'none' | 'sm' | 'md' | 'lg' | 'xl'
export type ImageCaptionPosition = 'bottom' | 'top' | 'overlay'
export type ImageHoverEffect = 'none' | 'zoom' | 'fade' | 'grayscale' | 'brighten' | 'blur' | 'rotate' | 'flip'
export type ImageGradientBorderType = 'linear' | 'radial' | 'conic'

export interface CanonicalImageContent {
  src?: string
  alt?: string
  linkUrl?: string
  openInNewTab?: boolean
  caption?: string
  captionPosition?: ImageCaptionPosition
  captionAlignment?: ImageAlignment
}

export interface CanonicalImageStyle {
  width?: string
  height?: string
  maxWidth?: string
  maxHeight?: string
  alignment?: ImageAlignment
  objectFit?: ImageObjectFit
  objectPosition?: string
  borderRadius?: string | number
  shape?: ImageShape
  customShape?: string
  showGradientBorder?: boolean
  gradientBorderColors?: string
  gradientBorderDirection?: string
  gradientBorderWidth?: string
  gradientBorderType?: ImageGradientBorderType
  shadow?: ImageShadow
  border?: string
  margin?: string
  padding?: string
  filter?: string
  imageZoom?: number
  componentPositionX?: string
  componentPositionY?: string
  showOverlay?: boolean
  overlayColor?: string
  overlayOpacity?: number
  overlayText?: string
  hoverEffect?: ImageHoverEffect
  hoverZoom?: number
  hoverBrightness?: number
  hoverDuration?: number
  lazyLoad?: boolean
  showLightbox?: boolean
  className?: string
  customId?: string
}

export interface CanonicalImageResponsive {
  desktop?: Record<string, any>
  tablet?: Record<string, any>
  mobile?: Record<string, any>
}

export interface CanonicalImageProps {
  version?: number
  content?: CanonicalImageContent
  style?: CanonicalImageStyle
  responsive?: CanonicalImageResponsive
}

export type ImageProps = {
  src?: string
  alt?: string
  linkUrl?: string
  openInNewTab?: boolean
  objectFit?: ImageObjectFit
  objectPosition?: string
  borderRadius?: string | number
  shape?: ImageShape
  customShape?: string
  showGradientBorder?: boolean
  gradientBorderColors?: string
  gradientBorderDirection?: string
  gradientBorderWidth?: string
  gradientBorderType?: ImageGradientBorderType
  shadow?: ImageShadow
  width?: string
  height?: string
  alignment?: ImageAlignment
  componentPositionX?: string
  componentPositionY?: string
  imageZoom?: number
  caption?: string
  captionPosition?: ImageCaptionPosition
  captionAlignment?: ImageAlignment
  showOverlay?: boolean
  overlayColor?: string
  overlayOpacity?: number
  overlayText?: string
  hoverEffect?: ImageHoverEffect
  hoverZoom?: number
  hoverBrightness?: number
  hoverDuration?: number
  filter?: string
  lazyLoad?: boolean
  showLightbox?: boolean
  className?: string
  customId?: string
  margin?: string
  padding?: string
  border?: string
  maxWidth?: string
  maxHeight?: string
  [key: string]: any
} & CanonicalImageProps

export type ImageViewModel = ImageProps & {
  hasImage: boolean
  isRenderable: boolean
  hasLink: boolean
  resolvedSrc: string
  showCaption: boolean
  showOverlayLayer: boolean
  linkTarget: '_blank' | '_self'
  linkRel?: string
  resolvedBorderRadius: string
  resolvedClassName: string
  clipPath?: string
  containerStyle: Record<string, any>
  frameStyle: Record<string, any>
  imageStyle: Record<string, any>
  hoverImageStyle: Record<string, any>
  overlayStyle: Record<string, any>
  overlayTextStyle: Record<string, any>
  captionStyle: Record<string, any>
}
