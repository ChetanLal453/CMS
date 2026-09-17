import { coerceValueForType, normalizeFilter, normalizeFilterType, normalizeOptions } from './normalize'
import type { FilterViewModel } from './types'

function getEmptyValue(viewModel: Pick<FilterViewModel, 'resolvedFilterType' | 'rangeMode'> & { min?: number; max?: number }) {
  if (viewModel.resolvedFilterType === 'toggle') {
    return false
  }

  if (viewModel.resolvedFilterType === 'checkboxGroup' || viewModel.resolvedFilterType === 'multiselect' || viewModel.resolvedFilterType === 'tagChips') {
    return []
  }

  if (viewModel.resolvedFilterType === 'rangeSlider') {
    const rangeMin = typeof viewModel.min === 'number' ? viewModel.min : Number(viewModel.min) || 0
    const rangeMax = typeof viewModel.max === 'number' ? viewModel.max : Number(viewModel.max) || 100
    return viewModel.rangeMode === 'single' ? [rangeMin, rangeMin] : [rangeMin, rangeMax]
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
