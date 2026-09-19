import {
  checkboxDefaultOptions,
  filterDefaultOptions,
  filterDefaultProps,
  manualDefaultOptions,
  radioDefaultOptions,
  sortDefaultOptions,
  tagDefaultOptions,
} from './defaults'
import type { FilterOption, FilterProps, FilterType, FilterValue, LegacyFilterType } from './types'

const filterTypeAliases: Record<LegacyFilterType, FilterType> = {
  search: 'searchInput',
  'checkbox-group': 'checkboxGroup',
  'multi-select-dropdown': 'multiselect',
  'radio-buttons': 'radioGroup',
  'toggle-switch': 'toggle',
  'sort-dropdown': 'sortDropdown',
  'tag-chips': 'tagChips',
  'range-slider': 'rangeSlider',
  'clear-all': 'clearAll',
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export function normalizeFilterType(filterType?: string): FilterType {
  if (!filterType) return 'dropdown'
  if (filterType in filterTypeAliases) return filterTypeAliases[filterType as LegacyFilterType]
  return (filterType as FilterType) || 'dropdown'
}

const normalizeOption = (item: any, fallbackIndex: number): FilterOption | null => {
  if (!item || typeof item !== 'object') {
    if (typeof item === 'string' || typeof item === 'number') {
      const value = String(item)
      return { value, label: value }
    }
    return null
  }

  const label = String(item.label ?? item.name ?? item.title ?? item.value ?? `Option ${fallbackIndex + 1}`)
  const value = String(item.value ?? item.id ?? slugify(label))
  if (!value) return null

  return {
    value,
    label,
    disabled: Boolean(item.disabled ?? item.isDisabled ?? false),
    icon: item.icon,
    badge: item.badge,
    group: item.group ? String(item.group) : undefined,
    description: item.description,
  }
}

export function normalizeOptions(input: any): FilterOption[] {
  if (!Array.isArray(input)) return []
  return input.map((item, index) => normalizeOption(item, index)).filter((item): item is FilterOption => Boolean(item))
}

export function inferValueFromType(filterType: FilterType, props: Partial<FilterProps>): FilterValue {
  if (filterType === 'toggle') {
    if (typeof props.defaultValue === 'boolean') return props.defaultValue
    return Boolean(props.defaultChecked)
  }

  if (filterType === 'rangeSlider') {
    const min = Number.isFinite(Number(props.min)) ? Number(props.min) : 0
    const max = Number.isFinite(Number(props.max)) ? Number(props.max) : 100
    if (Array.isArray(props.defaultValue) && props.defaultValue.length >= 2) {
      return [Number(props.defaultValue[0]) || min, Number(props.defaultValue[1]) || max]
    }
    if (typeof props.defaultValue === 'number') {
      const numericValue = Number(props.defaultValue)
      return [numericValue, numericValue]
    }
    if (typeof props.defaultValue === 'string' && props.defaultValue.trim()) {
      const numericValue = Number(props.defaultValue)
      if (Number.isFinite(numericValue)) {
        return [numericValue, numericValue]
      }
    }
    return props.rangeMode === 'single' ? [min, min] : [min, max]
  }

  if (filterType === 'multiselect' || filterType === 'checkboxGroup' || filterType === 'tagChips') {
    if (Array.isArray(props.defaultValue)) return props.defaultValue.map(String)
    if (typeof props.defaultValue === 'string' && props.defaultValue.trim()) {
      return props.defaultValue
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    }
    return []
  }

  if (typeof props.defaultValue === 'string' || typeof props.defaultValue === 'number') {
    return String(props.defaultValue)
  }

  return ''
}

export function coerceValueForType(filterType: FilterType, value: FilterValue, props: Partial<FilterProps>): FilterValue {
  if (filterType === 'toggle') return Boolean(value)

  if (filterType === 'multiselect' || filterType === 'checkboxGroup' || filterType === 'tagChips') {
    if (Array.isArray(value)) return value.map(String)
    if (typeof value === 'string' && value.trim()) return value.split(',').map((item) => item.trim()).filter(Boolean)
    return []
  }

  if (filterType === 'rangeSlider') {
    if (Array.isArray(value) && value.length >= 2) {
      return [Number(value[0]) || 0, Number(value[1]) || 0]
    }
    if (typeof value === 'number') {
      return [value, value]
    }
    if (typeof value === 'string' && value.trim()) {
      const numericValue = Number(value)
      if (Number.isFinite(numericValue)) {
        return [numericValue, numericValue]
      }
    }
    return inferValueFromType(filterType, props)
  }

  if (filterType === 'searchInput' || filterType === 'dropdown' || filterType === 'radioGroup' || filterType === 'sortDropdown') {
    if (typeof value === 'string') return value
    if (typeof value === 'number') return String(value)
    return inferValueFromType(filterType, props)
  }

  return value
}

function fallbackOptionsForType(filterType: FilterType): FilterOption[] {
  switch (filterType) {
    case 'sortDropdown':
      return sortDefaultOptions
    case 'tagChips':
      return tagDefaultOptions
    case 'checkboxGroup':
    case 'multiselect':
      return checkboxDefaultOptions
    case 'radioGroup':
      return radioDefaultOptions
    case 'searchInput':
    case 'toggle':
    case 'clearAll':
    case 'rangeSlider':
      return []
    default:
      return filterDefaultOptions.length ? filterDefaultOptions : manualDefaultOptions
  }
}

export function normalizeFilter(props: Record<string, any> = {}): FilterProps {
  const filterType = normalizeFilterType(String(props.filterType || filterDefaultProps.filterType || 'dropdown'))
  const normalizedOptions = normalizeOptions(props.options)
  const defaultOptions = normalizedOptions.length ? normalizedOptions : fallbackOptionsForType(filterType)
  const visibleWhen =
    typeof props.visibleWhen === 'boolean'
      ? props.visibleWhen
        ? ''
        : 'false'
      : String(props.visibleWhen ?? filterDefaultProps.visibleWhen ?? '')
  const disabledWhen =
    typeof props.disabledWhen === 'boolean'
      ? props.disabledWhen
        ? 'true'
        : ''
      : String(props.disabledWhen ?? filterDefaultProps.disabledWhen ?? '')
  const nextProps: FilterProps = {
    ...filterDefaultProps,
    ...props,
    filterType,
    filterKey: String(props.filterKey || filterDefaultProps.filterKey || 'filter'),
    bindTo: String(props.bindTo ?? props.filterKey ?? filterDefaultProps.bindTo ?? ''),
    label: String(props.label ?? filterDefaultProps.label ?? 'Filter'),
    helpText: String(props.helpText ?? filterDefaultProps.helpText ?? ''),
    placeholder: String(props.placeholder ?? filterDefaultProps.placeholder ?? ''),
    options: defaultOptions,
    sourceType: (props.sourceType ?? filterDefaultProps.sourceType ?? 'manual') as FilterProps['sourceType'],
    presetKey: String(props.presetKey ?? filterDefaultProps.presetKey ?? ''),
    apiEndpoint: String(props.apiEndpoint ?? filterDefaultProps.apiEndpoint ?? ''),
    apiMethod: String(props.apiMethod ?? filterDefaultProps.apiMethod ?? 'GET'),
    apiLabelField: String(props.apiLabelField ?? filterDefaultProps.apiLabelField ?? 'label'),
    apiValueField: String(props.apiValueField ?? filterDefaultProps.apiValueField ?? 'value'),
    visibleWhen,
    disabledWhen,
  }

  const seededValue =
    props.value !== undefined
      ? props.value
      : props.defaultValue !== undefined
        ? props.defaultValue
        : inferValueFromType(filterType, nextProps)

  nextProps.defaultValue = coerceValueForType(filterType, seededValue, nextProps)
  nextProps.value = coerceValueForType(filterType, seededValue, nextProps)

  return nextProps
}
