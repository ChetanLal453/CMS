import { normalizeIcon } from './normalize'
import type { IconViewModel } from './types'

function toNumber(value: unknown, fallback: number) {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value || ''))
  return Number.isFinite(parsed) ? parsed : fallback
}

export function createIconViewModel(props: Record<string, any> = {}): IconViewModel {
  const normalized = normalizeIcon(props)

  const iconName = String(
    normalized.content?.name ||
    normalized.content?.icon ||
    normalized.name ||
    normalized.icon ||
    'star'
  )
  const size = normalized.style?.size ?? normalized.size ?? '24px'
  const color = String(normalized.style?.color || normalized.color || '#000000')
  const className = String(normalized.style?.className || normalized.className || '')

  return {
    iconName,
    size,
    numericSize: toNumber(size, 24),
    color,
    className,
  }
}
