import { coerceValueForType, fallbackOptionsForType, normalizeFilter, normalizeFilterType, normalizeOptions } from './normalize'
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
  const resolvedFilterType = normalizeFilterType(String(normalized.content?.filterType || normalized.filterType || 'dropdown'))
  const rawOptions = normalized.content?.options ?? normalized.options
  const normalizedOptions = normalizeOptions(rawOptions)
  const optionsWithFallback = normalizedOptions.length ? normalizedOptions : fallbackOptionsForType(resolvedFilterType)
  const effectiveValue = coerceValueForType(
    resolvedFilterType,
    normalized.content?.value ?? normalized.content?.defaultValue ?? normalized.value ?? normalized.defaultValue,
    normalized,
  )
  const min = normalized.content?.min !== undefined ? normalized.content.min : normalized.min
  const max = normalized.content?.max !== undefined ? normalized.content.max : normalized.max
  const rangeMin = typeof min === 'number' ? min : Number(min) || 0
  const rangeMax = typeof max === 'number' ? max : Number(max) || 100
  const rangeMode = normalized.content?.rangeMode || normalized.rangeMode

  return {
    ...normalized,
    filterType: resolvedFilterType,
    resolvedFilterType,
    normalizedOptions: optionsWithFallback,
    options: optionsWithFallback,
    effectiveValue,
    emptyValue: getEmptyValue({
      resolvedFilterType,
      rangeMode,
      min: rangeMin,
      max: rangeMax,
    }),
    rangeMin,
    rangeMax,
  }
}
