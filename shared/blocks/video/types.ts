export type VideoSourceType = 'auto' | 'youtube' | 'vimeo' | 'mp4'

export type VideoResolvedSource = {
  kind: 'youtube' | 'vimeo' | 'mp4' | 'embed'
  src: string
}

export interface CanonicalVideoContent {
  src?: string
  sourceType?: VideoSourceType
  title?: string
  autoplay?: boolean
  muted?: boolean
  controls?: boolean
  loop?: boolean
}

export interface CanonicalVideoStyle {
  width?: string
  maxWidth?: string
  aspectRatio?: string
  margin?: string
  borderRadius?: number
  borderColor?: string
  borderOpacity?: number
  accentColor?: string
  showOverlay?: boolean
  overlayStrength?: number
  showPreviewChrome?: boolean
  previewProgress?: number
  previewTime?: string
  objectFit?: 'cover' | 'contain' | 'fill'
  className?: string
}

export interface CanonicalVideoResponsive {
  desktop?: Record<string, any>
  tablet?: Record<string, any>
  mobile?: Record<string, any>
}

export interface CanonicalVideoProps {
  version?: number
  content?: CanonicalVideoContent
  style?: CanonicalVideoStyle
  responsive?: CanonicalVideoResponsive
}

export type VideoProps = Omit<CanonicalVideoProps, 'content'> & {
  content?: CanonicalVideoContent
  src?: string
  sourceType?: VideoSourceType
  autoplay?: boolean
  muted?: boolean
  controls?: boolean
  loop?: boolean
  width?: string
  maxWidth?: string
  aspectRatio?: string
  margin?: string
  borderRadius?: number
  borderColor?: string
  borderOpacity?: number
  accentColor?: string
  showOverlay?: boolean
  overlayStrength?: number
  showPreviewChrome?: boolean
  previewProgress?: number
  previewTime?: string
  objectFit?: 'cover' | 'contain' | 'fill'
  title?: string
  className?: string
  [key: string]: any
}

export type VideoViewModel = VideoProps & {
  resolvedSource: VideoResolvedSource
  isMp4: boolean
  borderColorWithOpacity: string
  resolvedTitle: string
  shouldMute: boolean
}
