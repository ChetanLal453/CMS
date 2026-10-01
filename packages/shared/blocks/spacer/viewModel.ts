import { normalizeSpacer } from './normalize'
import type { SpacerViewModel } from './types'

export function createSpacerViewModel(props: Record<string, any> = {}): SpacerViewModel {
  const normalized = normalizeSpacer(props)

  const resolvedDesktopHeight =
    normalized.responsive?.desktop?.height ||
    normalized.desktopHeight ||
    normalized.style?.height ||
    normalized.height ||
    '32px'

  // Tablet cascades from desktop if not explicitly set
  const resolvedTabletHeight =
    normalized.responsive?.tablet?.height ||
    normalized.tabletHeight ||
    resolvedDesktopHeight

  // Mobile cascades from tablet/desktop if not explicitly set
  const resolvedMobileHeight =
    normalized.responsive?.mobile?.height ||
    normalized.mobileHeight ||
    resolvedTabletHeight

  return {
    ...normalized,
    visible: normalized.visibility !== false,
    editorBackgroundColor:
      normalized.backgroundColor === '#ffffff'
        ? 'transparent'
        : String(normalized.backgroundColor || 'transparent'),
    resolvedHeight: resolvedDesktopHeight,
    resolvedDesktopHeight,
    resolvedTabletHeight,
    resolvedMobileHeight,
  }
}
