import { applyAlphaToColor, normalizeVideo, resolveVideoSource } from './normalize'
import type { VideoViewModel } from './types'
import { resolveAdminMediaUrl } from '../../page/adminUrls'

export function createVideoViewModel(props: Record<string, any> = {}): VideoViewModel {
  const normalized = normalizeVideo(props)
  const normalizedWithResolvedSrc = {
    ...normalized,
    src: resolveAdminMediaUrl(normalized.src),
  }
  const resolvedSource = resolveVideoSource(normalizedWithResolvedSrc)

  return {
    ...normalizedWithResolvedSrc,
    resolvedSource,
    isMp4: resolvedSource.kind === 'mp4',
    borderColorWithOpacity: applyAlphaToColor(normalizedWithResolvedSrc.borderColor || '#ffffff', Number(normalizedWithResolvedSrc.borderOpacity ?? 13)),
    resolvedTitle: normalizedWithResolvedSrc.title || '',
    shouldMute: Boolean(normalizedWithResolvedSrc.muted) || Boolean(normalizedWithResolvedSrc.autoplay),
  }
}
