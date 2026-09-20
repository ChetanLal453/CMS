import { coerceValueForType, normalizeFilter, normalizeFilterType, normalizeOptions } from './normalize'
import type { FilterViewModel } from './types'

function getEmptyValue(viewModel: Pick<FilterViewModel, 'resolvedFilterType' | 'rangeMode'> & { min?: number; max?: number }): FilterViewModel['emptyValue'] {
  if (viewModel.resolvedFilterType === 'toggle') {
    return false
  }

  if (viewModel.resolvedFilterType === 'checkboxGroup' || viewModel.resolvedFilterType === 'multiselect' || viewModel.resolvedFilterType === 'tagChips') {
    return []
  }

  if (viewModel.resolvedFilterType === 'rangeSlider') {
    const rawMin = typeof viewModel.min === 'number' && Number.isFinite(viewModel.min) ? viewModel.min : Number(viewModel.min)
    const rawMax = typeof viewModel.max === 'number' && Number.isFinite(viewModel.max) ? viewModel.max : Number(viewModel.max)
    const rangeMin = Number.isFinite(rawMin) ? rawMin : 0
    const rangeMax = Number.isFinite(rawMax) ? rawMax : 100
    const tuple: [number, number] = viewModel.rangeMode === 'single' ? [rangeMin, rangeMin] : [rangeMin, rangeMax]
    return tuple
  }

  return ''
}

export function createFilterViewModel(props: Record<string, any> = {}): FilterViewModel {
  const normalized = normalizeFilter(props)
  const resolvedFilterType = normalizeFilterType(String(normalized.filterType || 'dropdown'))
  const normalizedOptions = normalizeOptions(normalized.options)
  const effectiveValue = coerceValueForType(resolvedFilterType, normalized.value ?? normalized.defaultValue, normalized)
  const rangeMin = typeof normalized.min === 'number' ? normalized.min : Number(normalized.min) || 0
  const rangeMax = typeof normalized.max === 'number' ? normalized.max : Number(normalized.max) || 100

  return {
    ...normalized,
    filterType: resolvedFilterType,
    resolvedFilterType,
    normalizedOptions,
    effectiveValue,
    emptyValue: getEmptyValue({
      resolvedFilterType,
      rangeMode: normalized.rangeMode,
      min: rangeMin,
      max: rangeMax,
    }),
    rangeMin,
    rangeMax,
  }
}
