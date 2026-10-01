import { defaultVideoProps, VIDEO_DEFAULT_URL } from './defaults'
import { normalizeVideo } from './normalize'
import { createVideoViewModel } from './viewModel'

export { VIDEO_DEFAULT_URL } from './defaults'
export { normalizeVideo, resolveVideoSource, applyAlphaToColor } from './normalize'
export type { VideoProps, VideoResolvedSource, VideoSourceType, VideoViewModel } from './types'

export const videoContract = {
  defaultProps: defaultVideoProps,
  schema: {
    categories: [
      { id: 'content', label: 'Content', expanded: true },
      { id: 'layout', label: 'Layout', expanded: false },
      { id: 'style', label: 'Style', expanded: false },
      { id: 'player', label: 'Player & Controls', expanded: false },
    ],
    properties: {
      src: { type: 'text', label: 'Video URL', default: VIDEO_DEFAULT_URL, category: 'Content' },
      sourceType: {
        type: 'select',
        label: 'Source Type',
        default: 'auto',
        options: [
          { value: 'auto', label: 'Auto Detect' },
          { value: 'youtube', label: 'YouTube' },
          { value: 'vimeo', label: 'Vimeo' },
          { value: 'mp4', label: 'MP4 File' },
        ],
        category: 'Content',
      },
      title: { type: 'text', label: 'Embed Title', default: 'Video', category: 'Content' },
      width: { type: 'text', label: 'Width', default: '100%', category: 'Layout' },
      maxWidth: { type: 'text', label: 'Max Width', default: '100%', category: 'Layout' },
      aspectRatio: {
        type: 'select',
        label: 'Aspect Ratio',
        default: '16 / 9',
        options: [
          { value: '16 / 9', label: '16:9' },
          { value: '4 / 3', label: '4:3' },
          { value: '1 / 1', label: '1:1' },
          { value: '21 / 9', label: '21:9' },
        ],
        category: 'Layout',
      },
      objectFit: {
        type: 'select',
        label: 'Object Fit (MP4)',
        default: 'cover',
        options: [
          { value: 'cover', label: 'Cover' },
          { value: 'contain', label: 'Contain' },
          { value: 'fill', label: 'Fill' },
        ],
        category: 'Layout',
      },
      borderRadius: { type: 'number', label: 'Border Radius', default: 10, min: 0, max: 64, step: 1, category: 'Style' },
      borderColor: { type: 'color', label: 'Border Color', default: '#ffffff', category: 'Style' },
      borderOpacity: { type: 'range', label: 'Border Opacity', default: 13, min: 0, max: 100, step: 1, category: 'Style' },
      accentColor: { type: 'color', label: 'Progress Accent', default: '#7c6dfa', category: 'Style' },
      showOverlay: { type: 'toggle', label: 'Show Overlay', default: true, category: 'Style' },
      overlayStrength: { type: 'range', label: 'Overlay Strength', default: 10, min: 0, max: 60, step: 1, category: 'Style' },
      autoplay: { type: 'toggle', label: 'Autoplay', default: false, category: 'Player & Controls' },
      muted: { type: 'toggle', label: 'Muted', default: false, category: 'Player & Controls' },
      controls: { type: 'toggle', label: 'Show Native Controls', default: true, category: 'Player & Controls' },
      loop: { type: 'toggle', label: 'Loop', default: false, category: 'Player & Controls' },
      showPreviewChrome: { type: 'toggle', label: 'Show Preview Chrome', default: true, category: 'Player & Controls' },
      previewProgress: { type: 'range', label: 'Preview Progress', default: 35, min: 0, max: 100, step: 1, category: 'Player & Controls' },
      previewTime: { type: 'text', label: 'Preview Time Label', default: '1:24 / 4:05', category: 'Player & Controls' },
    },
  },
  normalize: normalizeVideo,
  createViewModel: createVideoViewModel,
}
