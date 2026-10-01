import { normalizeFlexbox } from './normalize'

const SHADOW_MAP: Record<string, string> = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
}

export function createFlexboxViewModel(props: Record<string, any> = {}) {
  const normalized = normalizeFlexbox(props)

  const resolvedShadow = SHADOW_MAP[normalized.shadow || 'none'] || normalized.shadow || 'none'

  return {
    ...normalized,
    backgroundColor: normalized.backgroundColor === '#ffffff' ? 'transparent' : normalized.backgroundColor,
    boxShadow: resolvedShadow !== 'none' ? resolvedShadow : undefined,
    borderRadius: normalized.borderRadius && normalized.borderRadius !== '0px' ? normalized.borderRadius : undefined,
    border: normalized.border && normalized.border !== 'none' ? normalized.border : undefined,
    maxWidth: normalized.maxWidth && normalized.maxWidth !== 'none' ? normalized.maxWidth : undefined,
  }
}
