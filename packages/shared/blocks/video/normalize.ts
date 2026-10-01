import { VIDEO_DEFAULT_URL, defaultVideoProps } from './defaults'
import type {
  CanonicalVideoContent,
  CanonicalVideoProps,
  CanonicalVideoResponsive,
  CanonicalVideoStyle,
  VideoProps,
  VideoResolvedSource,
  VideoSourceType,
} from './types'

function asStringOrUndefined(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined
  const str = String(value).trim()
  return str.length > 0 ? str : undefined
}

function asBooleanOrUndefined(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') return undefined
  return Boolean(value)
}

function asNumberOrUndefined(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value))
  return Number.isFinite(parsed) ? parsed : undefined
}

function getYouTubeId(urlString: string): string | null {
  const trimmed = (urlString || '').trim()
  if (!trimmed) return null

  const shortMatch = trimmed.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/)
  if (shortMatch?.[1]) return shortMatch[1]

  const embedMatch = trimmed.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/)
  if (embedMatch?.[1]) return embedMatch[1]

  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/)
  if (shortsMatch?.[1]) return shortsMatch[1]

  try {
    const parsed = new URL(trimmed)
    return parsed.searchParams.get('v')
  } catch {
    return null
  }
}

function getVimeoId(urlString: string): string | null {
  const match = (urlString || '').match(/vimeo\.com\/(?:video\/)?(\d{5,})/)
  return match?.[1] || null
}

function withQueryParams(urlString: string, params: Record<string, string>): string {
  try {
    const parsed = new URL(urlString)
    Object.entries(params).forEach(([key, value]) => {
      if (value === '' || value === undefined || value === null) {
        parsed.searchParams.delete(key)
        return
      }
      parsed.searchParams.set(key, value)
    })
    return parsed.toString()
  } catch {
    return urlString
  }
}

export function applyAlphaToColor(colorValue: string, alphaPercent: number): string {
  const alpha = Math.max(0, Math.min(100, alphaPercent)) / 100
  const trimmed = (colorValue || '').trim()
  const shortHexMatch = trimmed.match(/^#([0-9a-fA-F]{3})$/)
  const longHexMatch = trimmed.match(/^#([0-9a-fA-F]{6})$/)

  if (shortHexMatch?.[1]) {
    const [r, g, b] = shortHexMatch[1].split('').map((char) => parseInt(`${char}${char}`, 16))
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  if (longHexMatch?.[1]) {
    const hex = longHexMatch[1]
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  return trimmed || `rgba(255,255,255,${alpha})`
}

export function normalizeVideo(props: Record<string, any> = {}): VideoProps {
  const contentInput = props.content && typeof props.content === 'object' ? props.content : {}
  const styleInput = props.style && typeof props.style === 'object' ? props.style : {}
  const responsiveInput = props.responsive && typeof props.responsive === 'object' ? props.responsive : {}

  const src = asStringOrUndefined(contentInput.src ?? props.src)
  const sourceType = asStringOrUndefined(contentInput.sourceType ?? props.sourceType) as VideoSourceType | undefined
  const title = asStringOrUndefined(contentInput.title ?? props.title)
  const autoplay = asBooleanOrUndefined(contentInput.autoplay ?? props.autoplay)
  const muted = asBooleanOrUndefined(contentInput.muted ?? props.muted)
  const controls = asBooleanOrUndefined(contentInput.controls ?? props.controls)
  const loop = asBooleanOrUndefined(contentInput.loop ?? props.loop)

  const content: CanonicalVideoContent = {}
  if (src !== undefined) content.src = src
  if (sourceType !== undefined) content.sourceType = sourceType
  if (title !== undefined) content.title = title
  if (autoplay !== undefined) content.autoplay = autoplay
  if (muted !== undefined) content.muted = muted
  if (controls !== undefined) content.controls = controls
  if (loop !== undefined) content.loop = loop

  const width = asStringOrUndefined(styleInput.width ?? props.width)
  const maxWidth = asStringOrUndefined(styleInput.maxWidth ?? props.maxWidth)
  const aspectRatio = asStringOrUndefined(styleInput.aspectRatio ?? props.aspectRatio)
  const margin = asStringOrUndefined(styleInput.margin ?? props.margin)
  const borderRadius = asNumberOrUndefined(styleInput.borderRadius ?? props.borderRadius)
  const borderColor = asStringOrUndefined(styleInput.borderColor ?? props.borderColor)
  const borderOpacity = asNumberOrUndefined(styleInput.borderOpacity ?? props.borderOpacity)
  const accentColor = asStringOrUndefined(styleInput.accentColor ?? props.accentColor)
  const showOverlay = asBooleanOrUndefined(styleInput.showOverlay ?? props.showOverlay)
  const overlayStrength = asNumberOrUndefined(styleInput.overlayStrength ?? props.overlayStrength)
  const showPreviewChrome = asBooleanOrUndefined(styleInput.showPreviewChrome ?? props.showPreviewChrome)
  const previewProgress = asNumberOrUndefined(styleInput.previewProgress ?? props.previewProgress)
  const previewTime = asStringOrUndefined(styleInput.previewTime ?? props.previewTime)
  const objectFit = asStringOrUndefined(styleInput.objectFit ?? props.objectFit) as VideoProps['objectFit'] | undefined
  const className = asStringOrUndefined(styleInput.className ?? props.className)

  const style: CanonicalVideoStyle = {}
  if (width !== undefined) style.width = width
  if (maxWidth !== undefined) style.maxWidth = maxWidth
  if (aspectRatio !== undefined) style.aspectRatio = aspectRatio
  if (margin !== undefined) style.margin = margin
  if (borderRadius !== undefined) style.borderRadius = borderRadius
  if (borderColor !== undefined) style.borderColor = borderColor
  if (borderOpacity !== undefined) style.borderOpacity = borderOpacity
  if (accentColor !== undefined) style.accentColor = accentColor
  if (showOverlay !== undefined) style.showOverlay = showOverlay
  if (overlayStrength !== undefined) style.overlayStrength = overlayStrength
  if (showPreviewChrome !== undefined) style.showPreviewChrome = showPreviewChrome
  if (previewProgress !== undefined) style.previewProgress = previewProgress
  if (previewTime !== undefined) style.previewTime = previewTime
  if (objectFit !== undefined) style.objectFit = objectFit
  if (className !== undefined) style.className = className

  const responsive: CanonicalVideoResponsive = {
    desktop: responsiveInput.desktop && typeof responsiveInput.desktop === 'object' ? responsiveInput.desktop : {},
    tablet: responsiveInput.tablet && typeof responsiveInput.tablet === 'object' ? responsiveInput.tablet : {},
    mobile: responsiveInput.mobile && typeof responsiveInput.mobile === 'object' ? responsiveInput.mobile : {},
  }

  return {
    ...defaultVideoProps,
    ...props,
    version: 1,
    content,
    style,
    responsive,
    src: src ?? defaultVideoProps.src ?? VIDEO_DEFAULT_URL,
    sourceType: sourceType ?? defaultVideoProps.sourceType ?? 'auto',
    title: title ?? defaultVideoProps.title ?? 'Video',
    autoplay: autoplay ?? defaultVideoProps.autoplay ?? false,
    muted: muted ?? defaultVideoProps.muted ?? false,
    controls: controls ?? defaultVideoProps.controls ?? true,
    loop: loop ?? defaultVideoProps.loop ?? false,
    width: width ?? defaultVideoProps.width ?? '100%',
    maxWidth: maxWidth ?? defaultVideoProps.maxWidth ?? '100%',
    aspectRatio: aspectRatio ?? defaultVideoProps.aspectRatio ?? '16 / 9',
    margin: margin ?? defaultVideoProps.margin ?? '0 auto',
    borderRadius: borderRadius ?? defaultVideoProps.borderRadius ?? 10,
    borderColor: borderColor ?? defaultVideoProps.borderColor ?? '#ffffff',
    borderOpacity: borderOpacity ?? defaultVideoProps.borderOpacity ?? 13,
    accentColor: accentColor ?? defaultVideoProps.accentColor ?? '#7c6dfa',
    showOverlay: showOverlay ?? defaultVideoProps.showOverlay ?? true,
    overlayStrength: overlayStrength ?? defaultVideoProps.overlayStrength ?? 10,
    showPreviewChrome: showPreviewChrome ?? defaultVideoProps.showPreviewChrome ?? true,
    previewProgress: previewProgress ?? defaultVideoProps.previewProgress ?? 35,
    previewTime: previewTime ?? defaultVideoProps.previewTime ?? '1:24 / 4:05',
    objectFit: objectFit ?? defaultVideoProps.objectFit ?? 'cover',
    className: className ?? '',
  }
}

export function resolveVideoSource(props: Record<string, any> = {}): VideoResolvedSource {
  const normalized = normalizeVideo(props)
  const src = (normalized.content?.src || normalized.src || VIDEO_DEFAULT_URL).trim()
  const lowerSrc = src.toLowerCase()
  const sourceType = normalized.content?.sourceType || normalized.sourceType || 'auto'

  const isYoutubeUrl = lowerSrc.includes('youtube.com') || lowerSrc.includes('youtu.be')
  if (sourceType === 'youtube' || (sourceType === 'auto' && isYoutubeUrl)) {
    const id = getYouTubeId(src)
    if (id) {
      const autoplay = normalized.content?.autoplay ?? normalized.autoplay
      const muted = normalized.content?.muted ?? normalized.muted
      const controls = normalized.content?.controls ?? normalized.controls
      const loop = normalized.content?.loop ?? normalized.loop

      return {
        kind: 'youtube',
        src: withQueryParams(`https://www.youtube.com/embed/${id}`, {
          autoplay: autoplay ? '1' : '0',
          mute: muted ? '1' : '0',
          controls: controls !== false ? '1' : '0',
          loop: loop ? '1' : '0',
          playlist: loop ? id : '',
          rel: '0',
          modestbranding: '1',
        }),
      }
    }
  }

  const isVimeoUrl = lowerSrc.includes('vimeo.com')
  if (sourceType === 'vimeo' || (sourceType === 'auto' && isVimeoUrl)) {
    const id = getVimeoId(src)
    if (id) {
      const autoplay = normalized.content?.autoplay ?? normalized.autoplay
      const muted = normalized.content?.muted ?? normalized.muted
      const controls = normalized.content?.controls ?? normalized.controls
      const loop = normalized.content?.loop ?? normalized.loop

      return {
        kind: 'vimeo',
        src: withQueryParams(`https://player.vimeo.com/video/${id}`, {
          autoplay: autoplay ? '1' : '0',
          muted: muted ? '1' : '0',
          loop: loop ? '1' : '0',
          controls: controls !== false ? '1' : '0',
          title: '0',
          byline: '0',
          portrait: '0',
        }),
      }
    }
  }

  if (sourceType === 'mp4' || lowerSrc.includes('.mp4')) {
    return { kind: 'mp4', src }
  }

  return { kind: 'embed', src }
}
