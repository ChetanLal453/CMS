import { normalizeFlexbox } from './normalize'

export function createFlexboxViewModel(props: Record<string, any> = {}) {
  const normalized = normalizeFlexbox(props)

  return {
    ...normalized,
    backgroundColor: normalized.backgroundColor === '#ffffff' ? 'transparent' : normalized.backgroundColor,
  }
}
