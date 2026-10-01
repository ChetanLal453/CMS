import {
  checkboxDefaultOptions,
  filterDefaultOptions,
  filterDefaultProps,
  manualDefaultOptions,
  radioDefaultOptions,
  sortDefaultOptions,
  tagDefaultOptions,
} from './defaults'
import type {
  CanonicalFilterContent,
  CanonicalFilterProps,
  CanonicalFilterResponsive,
  CanonicalFilterStyle,
  FilterOption,
  FilterProps,
  FilterSourceType,
  FilterType,
  FilterValue,
  LegacyFilterType,
} from './types'

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

export function fallbackOptionsForType(filterType: FilterType): FilterOption[] {
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

function asStringOrUndefined(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined
  const str = String(value).trim()
  return str.length > 0 ? str : undefined
}

function asBooleanOrUndefined(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') return undefined
  return Boolean(value)
}

function asNumberOrUndefined(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value))
  return Number.isFinite(parsed) ? parsed : undefined
}

export function normalizeFilter(props: Record<string, any> = {}): FilterProps {
  const contentInput = props.content && typeof props.content === 'object' ? props.content : {}
  const styleInput = props.style && typeof props.style === 'object' ? props.style : {}
  const responsiveInput = props.responsive && typeof props.responsive === 'object' ? props.responsive : {}

  const rawFilterType = contentInput.filterType ?? props.filterType
  const filterType = normalizeFilterType(rawFilterType ? String(rawFilterType) : undefined)

  const filterKey = asStringOrUndefined(contentInput.filterKey ?? props.filterKey)
  const bindTo = asStringOrUndefined(contentInput.bindTo ?? props.bindTo)
  const label = asStringOrUndefined(contentInput.label ?? props.label)
  const helpText = asStringOrUndefined(contentInput.helpText ?? props.helpText)
  const placeholder = asStringOrUndefined(contentInput.placeholder ?? props.placeholder)
  const defaultValue = contentInput.defaultValue !== undefined ? contentInput.defaultValue : props.defaultValue
  const defaultChecked = asBooleanOrUndefined(contentInput.defaultChecked ?? props.defaultChecked)
  const value = contentInput.value !== undefined ? contentInput.value : props.value
  const sourceType = (contentInput.sourceType ?? props.sourceType) as FilterSourceType | undefined
  const presetKey = asStringOrUndefined(contentInput.presetKey ?? props.presetKey)

  const rawOptions = contentInput.options !== undefined ? contentInput.options : props.options
  const normalizedOptions = rawOptions !== undefined ? normalizeOptions(rawOptions) : undefined

  const apiEndpoint = asStringOrUndefined(contentInput.apiEndpoint ?? props.apiEndpoint)
  const apiMethod = asStringOrUndefined(contentInput.apiMethod ?? props.apiMethod)
  const apiLabelField = asStringOrUndefined(contentInput.apiLabelField ?? props.apiLabelField)
  const apiValueField = asStringOrUndefined(contentInput.apiValueField ?? props.apiValueField)

  const min = asNumberOrUndefined(contentInput.min ?? props.min)
  const max = asNumberOrUndefined(contentInput.max ?? props.max)
  const step = asNumberOrUndefined(contentInput.step ?? props.step)
  const rangeMode = asStringOrUndefined(contentInput.rangeMode ?? props.rangeMode) as 'single' | 'double' | undefined
  const prefix = asStringOrUndefined(contentInput.prefix ?? props.prefix)
  const suffix = asStringOrUndefined(contentInput.suffix ?? props.suffix)
  const defaultSort = asStringOrUndefined(contentInput.defaultSort ?? props.defaultSort)
  const sortField = asStringOrUndefined(contentInput.sortField ?? props.sortField)
  const sortDirection = asStringOrUndefined(contentInput.sortDirection ?? props.sortDirection) as 'asc' | 'desc' | undefined
  const onLabel = asStringOrUndefined(contentInput.onLabel ?? props.onLabel)
  const offLabel = asStringOrUndefined(contentInput.offLabel ?? props.offLabel)
  const selectAllLabel = asStringOrUndefined(contentInput.selectAllLabel ?? props.selectAllLabel)
  const applyButtonLabel = asStringOrUndefined(contentInput.applyButtonLabel ?? props.applyButtonLabel)
  const sectionTitle = asStringOrUndefined(contentInput.sectionTitle ?? props.sectionTitle)
  const dependsOn = contentInput.dependsOn !== undefined ? contentInput.dependsOn : props.dependsOn
  const visibleWhen = contentInput.visibleWhen !== undefined ? contentInput.visibleWhen : props.visibleWhen
  const disabledWhen = contentInput.disabledWhen !== undefined ? contentInput.disabledWhen : props.disabledWhen
  const storageKey = asStringOrUndefined(contentInput.storageKey ?? props.storageKey)
  const queryParam = asStringOrUndefined(contentInput.queryParam ?? props.queryParam)
  const emitEventName = asStringOrUndefined(contentInput.emitEventName ?? props.emitEventName)

  const content: CanonicalFilterContent = {}
  if (rawFilterType !== undefined) content.filterType = filterType
  if (filterKey !== undefined) content.filterKey = filterKey
  if (bindTo !== undefined) content.bindTo = bindTo
  if (label !== undefined) content.label = label
  if (helpText !== undefined) content.helpText = helpText
  if (placeholder !== undefined) content.placeholder = placeholder
  if (defaultValue !== undefined) content.defaultValue = defaultValue
  if (defaultChecked !== undefined) content.defaultChecked = defaultChecked
  if (value !== undefined) content.value = value
  if (sourceType !== undefined) content.sourceType = sourceType
  if (presetKey !== undefined) content.presetKey = presetKey
  if (normalizedOptions !== undefined) content.options = normalizedOptions
  if (apiEndpoint !== undefined) content.apiEndpoint = apiEndpoint
  if (apiMethod !== undefined) content.apiMethod = apiMethod
  if (apiLabelField !== undefined) content.apiLabelField = apiLabelField
  if (apiValueField !== undefined) content.apiValueField = apiValueField
  if (min !== undefined) content.min = min
  if (max !== undefined) content.max = max
  if (step !== undefined) content.step = step
  if (rangeMode !== undefined) content.rangeMode = rangeMode
  if (prefix !== undefined) content.prefix = prefix
  if (suffix !== undefined) content.suffix = suffix
  if (defaultSort !== undefined) content.defaultSort = defaultSort
  if (sortField !== undefined) content.sortField = sortField
  if (sortDirection !== undefined) content.sortDirection = sortDirection
  if (onLabel !== undefined) content.onLabel = onLabel
  if (offLabel !== undefined) content.offLabel = offLabel
  if (selectAllLabel !== undefined) content.selectAllLabel = selectAllLabel
  if (applyButtonLabel !== undefined) content.applyButtonLabel = applyButtonLabel
  if (sectionTitle !== undefined) content.sectionTitle = sectionTitle
  if (dependsOn !== undefined) content.dependsOn = dependsOn
  if (visibleWhen !== undefined) content.visibleWhen = visibleWhen
  if (disabledWhen !== undefined) content.disabledWhen = disabledWhen
  if (storageKey !== undefined) content.storageKey = storageKey
  if (queryParam !== undefined) content.queryParam = queryParam
  if (emitEventName !== undefined) content.emitEventName = emitEventName

  const variant = asStringOrUndefined(styleInput.variant ?? props.variant)
  const size = asStringOrUndefined(styleInput.size ?? props.size)
  const density = asStringOrUndefined(styleInput.density ?? props.density)
  const fullWidth = asBooleanOrUndefined(styleInput.fullWidth ?? props.fullWidth)
  const labelPosition = asStringOrUndefined(styleInput.labelPosition ?? props.labelPosition)
  const orientation = asStringOrUndefined(styleInput.orientation ?? props.orientation) as 'horizontal' | 'vertical' | undefined
  const mobileVariant = asStringOrUndefined(styleInput.mobileVariant ?? props.mobileVariant)
  const desktopVariant = asStringOrUndefined(styleInput.desktopVariant ?? props.desktopVariant)
  const columns = asNumberOrUndefined(styleInput.columns ?? props.columns)
  const inline = asBooleanOrUndefined(styleInput.inline ?? props.inline)
  const radioStyle = asStringOrUndefined(styleInput.radioStyle ?? props.radioStyle) as 'default' | 'button' | undefined
  const toggleColor = asStringOrUndefined(styleInput.toggleColor ?? props.toggleColor)
  const chipStyle = asStringOrUndefined(styleInput.chipStyle ?? props.chipStyle)
  const chipVariant = asStringOrUndefined(styleInput.chipVariant ?? props.chipVariant)
  const showLabel = asBooleanOrUndefined(styleInput.showLabel ?? props.showLabel)
  const showClearButton = asBooleanOrUndefined(styleInput.showClearButton ?? props.showClearButton)
  const showStateLabel = asBooleanOrUndefined(styleInput.showStateLabel ?? props.showStateLabel)
  const showSelectedCount = asBooleanOrUndefined(styleInput.showSelectedCount ?? props.showSelectedCount)
  const showTooltip = asBooleanOrUndefined(styleInput.showTooltip ?? props.showTooltip)
  const showTicks = asBooleanOrUndefined(styleInput.showTicks ?? props.showTicks)
  const showMinMaxLabels = asBooleanOrUndefined(styleInput.showMinMaxLabels ?? props.showMinMaxLabels)
  const showDivider = asBooleanOrUndefined(styleInput.showDivider ?? props.showDivider)
  const sticky = asBooleanOrUndefined(styleInput.sticky ?? props.sticky)
  const collapsedByDefault = asBooleanOrUndefined(styleInput.collapsedByDefault ?? props.collapsedByDefault)
  const disabled = asBooleanOrUndefined(styleInput.disabled ?? props.disabled)
  const required = asBooleanOrUndefined(styleInput.required ?? props.required)
  const clearable = asBooleanOrUndefined(styleInput.clearable ?? props.clearable)
  const searchable = asBooleanOrUndefined(styleInput.searchable ?? props.searchable)
  const closeMenuOnSelect = asBooleanOrUndefined(styleInput.closeMenuOnSelect ?? props.closeMenuOnSelect)
  const maxSelections = asNumberOrUndefined(styleInput.maxSelections ?? props.maxSelections)
  const selectAllEnabled = asBooleanOrUndefined(styleInput.selectAllEnabled ?? props.selectAllEnabled)
  const allowMultiple = asBooleanOrUndefined(styleInput.allowMultiple ?? props.allowMultiple)
  const removable = asBooleanOrUndefined(styleInput.removable ?? props.removable)
  const debounceMs = asNumberOrUndefined(styleInput.debounceMs ?? props.debounceMs)
  const autoFocus = asBooleanOrUndefined(styleInput.autoFocus ?? props.autoFocus)
  const persistState = asBooleanOrUndefined(styleInput.persistState ?? props.persistState)
  const syncWithUrl = asBooleanOrUndefined(styleInput.syncWithUrl ?? props.syncWithUrl)
  const autoApply = asBooleanOrUndefined(styleInput.autoApply ?? props.autoApply)
  const resetOnChange = asBooleanOrUndefined(styleInput.resetOnChange ?? props.resetOnChange)
  const reloadOptionsOnDependencyChange = asBooleanOrUndefined(styleInput.reloadOptionsOnDependencyChange ?? props.reloadOptionsOnDependencyChange)
  const className = asStringOrUndefined(styleInput.className ?? props.className)
  const wrapperClassName = asStringOrUndefined(styleInput.wrapperClassName ?? props.wrapperClassName)
  const ariaLabel = asStringOrUndefined(styleInput.ariaLabel ?? props.ariaLabel)
  const ariaDescription = asStringOrUndefined(styleInput.ariaDescription ?? props.ariaDescription)
  const tabIndex = asNumberOrUndefined(styleInput.tabIndex ?? props.tabIndex)

  const style: CanonicalFilterStyle = {}
  if (variant !== undefined) style.variant = variant
  if (size !== undefined) style.size = size
  if (density !== undefined) style.density = density
  if (fullWidth !== undefined) style.fullWidth = fullWidth
  if (labelPosition !== undefined) style.labelPosition = labelPosition
  if (orientation !== undefined) style.orientation = orientation
  if (mobileVariant !== undefined) style.mobileVariant = mobileVariant
  if (desktopVariant !== undefined) style.desktopVariant = desktopVariant
  if (columns !== undefined) style.columns = columns
  if (inline !== undefined) style.inline = inline
  if (radioStyle !== undefined) style.radioStyle = radioStyle
  if (toggleColor !== undefined) style.toggleColor = toggleColor
  if (chipStyle !== undefined) style.chipStyle = chipStyle
  if (chipVariant !== undefined) style.chipVariant = chipVariant
  if (showLabel !== undefined) style.showLabel = showLabel
  if (showClearButton !== undefined) style.showClearButton = showClearButton
  if (showStateLabel !== undefined) style.showStateLabel = showStateLabel
  if (showSelectedCount !== undefined) style.showSelectedCount = showSelectedCount
  if (showTooltip !== undefined) style.showTooltip = showTooltip
  if (showTicks !== undefined) style.showTicks = showTicks
  if (showMinMaxLabels !== undefined) style.showMinMaxLabels = showMinMaxLabels
  if (showDivider !== undefined) style.showDivider = showDivider
  if (sticky !== undefined) style.sticky = sticky
  if (collapsedByDefault !== undefined) style.collapsedByDefault = collapsedByDefault
  if (disabled !== undefined) style.disabled = disabled
  if (required !== undefined) style.required = required
  if (clearable !== undefined) style.clearable = clearable
  if (searchable !== undefined) style.searchable = searchable
  if (closeMenuOnSelect !== undefined) style.closeMenuOnSelect = closeMenuOnSelect
  if (maxSelections !== undefined) style.maxSelections = maxSelections
  if (selectAllEnabled !== undefined) style.selectAllEnabled = selectAllEnabled
  if (allowMultiple !== undefined) style.allowMultiple = allowMultiple
  if (removable !== undefined) style.removable = removable
  if (debounceMs !== undefined) style.debounceMs = debounceMs
  if (autoFocus !== undefined) style.autoFocus = autoFocus
  if (persistState !== undefined) style.persistState = persistState
  if (syncWithUrl !== undefined) style.syncWithUrl = syncWithUrl
  if (autoApply !== undefined) style.autoApply = autoApply
  if (resetOnChange !== undefined) style.resetOnChange = resetOnChange
  if (reloadOptionsOnDependencyChange !== undefined) style.reloadOptionsOnDependencyChange = reloadOptionsOnDependencyChange
  if (className !== undefined) style.className = className
  if (wrapperClassName !== undefined) style.wrapperClassName = wrapperClassName
  if (ariaLabel !== undefined) style.ariaLabel = ariaLabel
  if (ariaDescription !== undefined) style.ariaDescription = ariaDescription
  if (tabIndex !== undefined) style.tabIndex = tabIndex

  const responsive: CanonicalFilterResponsive = {
    desktop: responsiveInput.desktop && typeof responsiveInput.desktop === 'object' ? responsiveInput.desktop : {},
    tablet: responsiveInput.tablet && typeof responsiveInput.tablet === 'object' ? responsiveInput.tablet : {},
    mobile: responsiveInput.mobile && typeof responsiveInput.mobile === 'object' ? responsiveInput.mobile : {},
  }

  const nextProps: FilterProps = {
    ...filterDefaultProps,
    ...props,
    version: 1,
    content,
    style,
    responsive,
    filterType,
    filterKey: filterKey ?? filterDefaultProps.filterKey ?? 'filter',
    bindTo: bindTo ?? filterKey ?? filterDefaultProps.bindTo ?? '',
    label: label ?? filterDefaultProps.label ?? 'Filter',
    helpText: helpText ?? filterDefaultProps.helpText ?? '',
    placeholder: placeholder ?? filterDefaultProps.placeholder ?? '',
    options: normalizedOptions !== undefined ? normalizedOptions : (props.options ? normalizeOptions(props.options) : filterDefaultOptions),
    sourceType: (sourceType ?? filterDefaultProps.sourceType ?? 'manual') as FilterProps['sourceType'],
    presetKey: presetKey ?? filterDefaultProps.presetKey ?? '',
    apiEndpoint: apiEndpoint ?? filterDefaultProps.apiEndpoint ?? '',
    apiMethod: apiMethod ?? filterDefaultProps.apiMethod ?? 'GET',
    apiLabelField: apiLabelField ?? filterDefaultProps.apiLabelField ?? 'label',
    apiValueField: apiValueField ?? filterDefaultProps.apiValueField ?? 'value',
    visibleWhen: visibleWhen !== undefined ? (typeof visibleWhen === 'boolean' ? (visibleWhen ? '' : 'false') : String(visibleWhen)) : '',
    disabledWhen: disabledWhen !== undefined ? (typeof disabledWhen === 'boolean' ? (disabledWhen ? 'true' : '') : String(disabledWhen)) : '',
  }

  const seededValue =
    value !== undefined
      ? value
      : defaultValue !== undefined
        ? defaultValue
        : inferValueFromType(filterType, nextProps)

  nextProps.defaultValue = coerceValueForType(filterType, seededValue, nextProps)
  nextProps.value = coerceValueForType(filterType, seededValue, nextProps)

  return nextProps
}
