import { normalizeSpacer } from './normalize'
import type { SpacerViewModel } from './types'

export function createSpacerViewModel(props: Record<string, any> = {}): SpacerViewModel {
  const normalized = normalizeSpacer(props)

  return {
    ...normalized,
    visible: normalized.visibility !== false,
    editorBackgroundColor: normalized.backgroundColor === '#ffffff' ? 'transparent' : String(normalized.backgroundColor || 'transparent'),
  }
}
