import { normalizeIcon } from './normalize'
import type { IconViewModel } from './types'

function toNumber(value: unknown, fallback: number) {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value || ''))
  return Number.isFinite(parsed) ? parsed : fallback
}

export function createIconViewModel(props: Record<string, any> = {}): IconViewModel {
  const normalized = normalizeIcon(props)

  return {
    iconName: String(normalized.name || 'star'),
    size: normalized.size ?? '24px',
    numericSize: toNumber(normalized.size, 24),
    color: String(normalized.color || '#000000'),
    className: String(normalized.className || ''),
  }
}
