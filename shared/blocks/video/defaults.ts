import type { VideoProps } from './types'

export const VIDEO_DEFAULT_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

export const defaultVideoProps: VideoProps = {
  src: VIDEO_DEFAULT_URL,
  sourceType: 'auto',
  autoplay: false,
  muted: false,
  controls: true,
  loop: false,
  width: '100%',
  maxWidth: '100%',
  aspectRatio: '16 / 9',
  margin: '0 auto',
  borderRadius: 10,
  borderColor: '#ffffff',
  borderOpacity: 13,
  accentColor: '#7c6dfa',
  showOverlay: true,
  overlayStrength: 10,
  showPreviewChrome: true,
  previewProgress: 35,
  previewTime: '1:24 / 4:05',
  objectFit: 'cover',
  title: 'Video',
  className: '',
}
