import { normalizeDivider } from './normalize'
import type { DividerViewModel } from './types'

export function createDividerViewModel(props: Record<string, any> = {}): DividerViewModel {
  const normalized = normalizeDivider(props)

  const thickness = String(normalized.style?.thickness || normalized.thickness || '1px')
  const color = String(normalized.style?.color || normalized.color || '#cccccc')
  const width = String(normalized.style?.width || normalized.width || '100%')
  const margin = String(normalized.style?.margin || normalized.margin || '20px 0')
  const className = String(normalized.style?.className || normalized.className || '')

  return {
    ...normalized,
    thickness,
    color,
    width,
    margin,
    className,
  }
}
