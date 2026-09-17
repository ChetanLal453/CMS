import { VIDEO_DEFAULT_URL, defaultVideoProps } from './defaults'
import type { VideoProps, VideoResolvedSource, VideoSourceType } from './types'

function asString(value: unknown, fallback: string) {
  const normalized = String(value ?? '').trim()
  return normalized || fallback
}

function asBoolean(value: unknown, fallback: boolean) {
  if (value === undefined || value === null) {
    return fallback
  }

  return Boolean(value)
}

function asNumber(value: unknown, fallback: number) {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''))
  return Number.isFinite(parsed) ? parsed : fallback
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
  const sourceType = asString(props.sourceType, defaultVideoProps.sourceType || 'auto') as VideoSourceType

  return {
    ...defaultVideoProps,
    ...props,
    src: asString(props.src, VIDEO_DEFAULT_URL),
    sourceType,
    autoplay: asBoolean(props.autoplay, defaultVideoProps.autoplay ?? false),
    muted: asBoolean(props.muted, defaultVideoProps.muted ?? false),
    controls: asBoolean(props.controls, defaultVideoProps.controls ?? true),
    loop: asBoolean(props.loop, defaultVideoProps.loop ?? false),
    width: asString(props.width, defaultVideoProps.width || '100%'),
    maxWidth: asString(props.maxWidth, defaultVideoProps.maxWidth || '100%'),
    aspectRatio: asString(props.aspectRatio, defaultVideoProps.aspectRatio || '16 / 9'),
    margin: asString(props.margin, defaultVideoProps.margin || '0 auto'),
    borderRadius: asNumber(props.borderRadius, defaultVideoProps.borderRadius ?? 10),
    borderColor: asString(props.borderColor, defaultVideoProps.borderColor || '#ffffff'),
    borderOpacity: asNumber(props.borderOpacity, defaultVideoProps.borderOpacity ?? 13),
    accentColor: asString(props.accentColor, defaultVideoProps.accentColor || '#7c6dfa'),
    showOverlay: asBoolean(props.showOverlay, defaultVideoProps.showOverlay ?? true),
    overlayStrength: asNumber(props.overlayStrength, defaultVideoProps.overlayStrength ?? 10),
    showPreviewChrome: asBoolean(props.showPreviewChrome, defaultVideoProps.showPreviewChrome ?? true),
    previewProgress: asNumber(props.previewProgress, defaultVideoProps.previewProgress ?? 35),
    previewTime: asString(props.previewTime, defaultVideoProps.previewTime || '1:24 / 4:05'),
    objectFit: asString(props.objectFit, defaultVideoProps.objectFit || 'cover') as VideoProps['objectFit'],
    title: asString(props.title, defaultVideoProps.title || 'Video'),
    className: asString(props.className, defaultVideoProps.className || ''),
  }
}

export function resolveVideoSource(props: Record<string, any> = {}): VideoResolvedSource {
  const normalized = normalizeVideo(props)
  const src = (normalized.src || VIDEO_DEFAULT_URL).trim()
  const lowerSrc = src.toLowerCase()
  const sourceType = normalized.sourceType || 'auto'

  const isYoutubeUrl = lowerSrc.includes('youtube.com') || lowerSrc.includes('youtu.be')
  if (sourceType === 'youtube' || (sourceType === 'auto' && isYoutubeUrl)) {
    const id = getYouTubeId(src)
    if (id) {
      return {
        kind: 'youtube',
        src: withQueryParams(`https://www.youtube.com/embed/${id}`, {
          autoplay: normalized.autoplay ? '1' : '0',
          mute: normalized.muted ? '1' : '0',
          controls: normalized.controls !== false ? '1' : '0',
          loop: normalized.loop ? '1' : '0',
          playlist: normalized.loop ? id : '',
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
      return {
        kind: 'vimeo',
        src: withQueryParams(`https://player.vimeo.com/video/${id}`, {
          autoplay: normalized.autoplay ? '1' : '0',
          muted: normalized.muted ? '1' : '0',
          loop: normalized.loop ? '1' : '0',
          controls: normalized.controls !== false ? '1' : '0',
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
