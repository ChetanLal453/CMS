import { applyAlphaToColor, normalizeVideo, resolveVideoSource } from './normalize'
import type { VideoViewModel } from './types'
import { resolveAdminMediaUrl } from '../../page/adminUrls'

export function createVideoViewModel(props: Record<string, any> = {}): VideoViewModel {
  const normalized = normalizeVideo(props)
  const rawSrc = normalized.content?.src || normalized.src
  const normalizedWithResolvedSrc = {
    ...normalized,
    src: resolveAdminMediaUrl(rawSrc),
  }
  const resolvedSource = resolveVideoSource(normalizedWithResolvedSrc)

  const borderColor = normalized.style?.borderColor || normalized.borderColor || '#ffffff'
  const borderOpacity = Number(normalized.style?.borderOpacity ?? normalized.borderOpacity ?? 13)
  const title = normalized.content?.title || normalized.title || ''
  const muted = normalized.content?.muted ?? normalized.muted
  const autoplay = normalized.content?.autoplay ?? normalized.autoplay

  return {
    ...normalizedWithResolvedSrc,
    resolvedSource,
    isMp4: resolvedSource.kind === 'mp4',
    borderColorWithOpacity: applyAlphaToColor(borderColor, borderOpacity),
    resolvedTitle: title,
    shouldMute: Boolean(muted) || Boolean(autoplay),
  }
}
