export type VideoSourceType = 'auto' | 'youtube' | 'vimeo' | 'mp4'

export type VideoResolvedSource = {
  kind: 'youtube' | 'vimeo' | 'mp4' | 'embed'
  src: string
}

export type VideoProps = {
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
