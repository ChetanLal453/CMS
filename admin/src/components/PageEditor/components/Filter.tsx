'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Button } from 'react-bootstrap'

import {
  FilterCheckboxGroup,
  FilterClearButton,
  FilterDropdown,
  FilterMultiSelect,
  FilterRadioGroup,
  FilterRangeSlider,
  FilterSearch,
  FilterSortDropdown,
  FilterSwitch,
  FilterTagChips,
} from '../../filters'
import {
  coerceValueForType,
  createFilterViewModel,
  checkboxDefaultOptions,
  filterDefaultProps,
  filterDefaultOptions,
  filterSchema,
  inferValueFromType,
  manualDefaultOptions,
  radioDefaultOptions,
  normalizeFilterType,
  normalizeOptions,
  sortDefaultOptions,
  tagDefaultOptions,
  type FilterOption,
  type FilterProps,
  type FilterState,
  type FilterType,
  type FilterValue,
} from '../../../../../shared/blocks/filter'

interface FilterContextValue {
  state: FilterState
  setFilterValue: (key: string, value: FilterValue) => void
  clearFilter: (key: string) => void
  clearAll: () => void
}

const FilterStateContext = createContext<FilterContextValue | null>(null)

export const useFilterState = () => useContext(FilterStateContext)

const slugify = (value: string) =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const FilterProvider: React.FC<{ children: React.ReactNode; initialState?: FilterState; onStateChange?: (state: FilterState) => void }> = ({
  children,
  initialState = {},
  onStateChange,
}) => {
  const [state, setState] = useState<FilterState>(initialState)

  const setFilterValue = useCallback(
    (key: string, value: FilterValue) => {
      setState((current) => {
        const next = { ...current, [key]: value }
        onStateChange?.(next)
        return next
      })
    },
    [onStateChange],
  )

  const clearFilter = useCallback(
    (key: string) => {
      setState((current) => {
        const next = { ...current }
        delete next[key]
        onStateChange?.(next)
        return next
      })
    },
    [onStateChange],
  )

  const clearAll = useCallback(() => {
    setState({})
    onStateChange?.({})
  }, [onStateChange])

  const value = useMemo(
    () => ({
      state,
      setFilterValue,
      clearFilter,
      clearAll,
    }),
    [state, setFilterValue, clearFilter, clearAll],
  )

  return <FilterStateContext.Provider value={value}>{children}</FilterStateContext.Provider>
}

const filterRegistry = {
  dropdown: FilterDropdown,
  multiselect: FilterMultiSelect,
  checkboxGroup: FilterCheckboxGroup,
  radioGroup: FilterRadioGroup,
  toggle: FilterSwitch,
  sortDropdown: FilterSortDropdown,
  tagChips: FilterTagChips,
  rangeSlider: FilterRangeSlider,
  searchInput: FilterSearch,
  clearAll: FilterClearButton,
} as const

const presetOptionsRegistry: Record<string, FilterOption[]> = {}

export const normalizeFilterState = (filterKey: string, value: FilterValue): FilterState => ({
  [filterKey]: value,
})

const sharedFilterDefaults = filterDefaultProps as FilterProps
const sharedFilterSchema = filterSchema

export { filterRegistry }

const manualOptionsFallback = (props: Partial<FilterProps>, filterType: FilterType) => {
  const rawOptions = normalizeOptions(props.options)
  if (rawOptions.length) return rawOptions

  if (filterType === 'sortDropdown') return sortDefaultOptions
  if (filterType === 'checkboxGroup') return checkboxDefaultOptions
  if (filterType === 'radioGroup') return radioDefaultOptions
  if (filterType === 'tagChips') return tagDefaultOptions
  return manualDefaultOptions
}

const getDefaultValueForType = (filterType: FilterType, props: Partial<FilterProps>, options: FilterOption[]): FilterValue => {
  if (props.defaultValue !== undefined) return coerceValueForType(filterType, props.defaultValue, props)

  switch (filterType) {
    case 'toggle':
      return Boolean(props.defaultChecked)
    case 'rangeSlider':
      return inferValueFromType(filterType, props)
    case 'multiselect':
    case 'checkboxGroup':
    case 'tagChips':
      return []
    case 'sortDropdown':
      return props.defaultSort || options[0]?.value || ''
    default:
      return ''
  }
}

const getEmptyValueForType = (filterType: FilterType, props: Partial<FilterProps>): FilterValue => {
  if (filterType === 'toggle') return false
  if (filterType === 'multiselect' || filterType === 'checkboxGroup' || filterType === 'tagChips') return []
  if (filterType === 'rangeSlider') {
    const min = Number(props.min ?? 0)
    const max = Number(props.max ?? 100)
    return props.rangeMode === 'single' ? [min, min] : [min, max]
  }
  return ''
}

const serializeFilterValue = (value: FilterValue) => JSON.stringify(value ?? null)

const useResolvedDependencyState = (dependsOn: string | string[] | undefined, state: FilterState) =>
  useMemo(() => {
    const keys = Array.isArray(dependsOn)
      ? dependsOn
      : typeof dependsOn === 'string'
        ? dependsOn.split(',').map((item) => item.trim()).filter(Boolean)
        : []

    const dependencyState: FilterState = {}
    keys.forEach((key) => {
      dependencyState[key] = state[key]
    })
    return dependencyState
  }, [dependsOn, state])

const evaluateCondition = (condition: string | boolean | undefined, state: FilterState) => {
  if (typeof condition === 'boolean') {
    return condition
  }

  if (typeof condition !== 'string') {
    return true
  }

  const normalized = condition.trim()
  if (!normalized) {
    return true
  }

  if (normalized === 'true') {
    return true
  }

  if (normalized === 'false') {
    return false
  }

  if (normalized in state) {
    return Boolean(state[normalized])
  }

  return true
}

const useFilterValueState = (props: Partial<FilterProps>, filterType: FilterType, options: FilterOption[]) => {
  const resolvedDefaultValue = useMemo(() => getDefaultValueForType(filterType, props, options), [filterType, options, props])
  const resolvedDefaultValueSignature = useMemo(() => serializeFilterValue(resolvedDefaultValue), [resolvedDefaultValue])
  const isControlled = props.value !== undefined
  const [internalValue, setInternalValue] = useState<FilterValue>(resolvedDefaultValue)
  const [draftValue, setDraftValue] = useState<FilterValue>(resolvedDefaultValue)

  useEffect(() => {
    if (isControlled) return
    setInternalValue((current) => (serializeFilterValue(current) === resolvedDefaultValueSignature ? current : resolvedDefaultValue))
    setDraftValue((current) => (serializeFilterValue(current) === resolvedDefaultValueSignature ? current : resolvedDefaultValue))
  }, [isControlled, resolvedDefaultValue, resolvedDefaultValueSignature])

  const committedValue = isControlled ? props.value : internalValue
  const committedValueSignature = useMemo(() => serializeFilterValue(committedValue), [committedValue])

  useEffect(() => {
    setDraftValue((current) => (serializeFilterValue(current) === committedValueSignature ? current : committedValue))
  }, [committedValue, committedValueSignature])

  const commitValue = useCallback(
    (nextValue: FilterValue) => {
      if (!isControlled) {
        setInternalValue(nextValue)
      }
      props.onChange?.(nextValue)
    },
    [isControlled, props.onChange],
  )

  return {
    committedValue,
    draftValue,
    setDraftValue,
    commitValue,
    resolvedDefaultValue,
  }
}

const FilterComponent: React.FC<Partial<FilterProps>> = (props) => {
  const propsSignature = useMemo(() => JSON.stringify(props), [props])
  const blockViewModel = useMemo(() => createFilterViewModel(props) as FilterProps, [propsSignature])
  const filterType = normalizeFilterType(String(blockViewModel.filterType || sharedFilterDefaults.filterType || 'dropdown'))
  const filterKey = blockViewModel.bindTo || blockViewModel.filterKey || sharedFilterDefaults.filterKey || 'filter'
  const context = useFilterState()
  const dependencyState = useResolvedDependencyState(blockViewModel.dependsOn, context?.state || {})
  const dependencySignature = useMemo(() => JSON.stringify(dependencyState), [dependencyState])
  const sourceType: FilterSourceType = blockViewModel.sourceType || sharedFilterDefaults.sourceType || 'manual'
  const [apiOptions, setApiOptions] = useState<FilterOption[]>([])
  const [apiLoading, setApiLoading] = useState(false)

  const optionsSignature = useMemo(() => JSON.stringify(blockViewModel.options || []), [blockViewModel.options])
  const normalizedOptions = useMemo(() => normalizeOptions(blockViewModel.options), [optionsSignature])
  const manualOptions = useMemo(() => {
    const fallback = manualOptionsFallback(blockViewModel, filterType)
    return normalizedOptions.length ? normalizedOptions : fallback
  }, [blockViewModel, filterType, normalizedOptions])
  const presetOptions = useMemo(() => presetOptionsRegistry[blockViewModel.presetKey || ''] || manualDefaultOptions, [blockViewModel.presetKey])

  useEffect(() => {
    if (props.previewMode) return
    if (sourceType !== 'api' || !props.apiEndpoint) return

    let cancelled = false
    setApiLoading(true)

    fetchOptionsFromApi(props.apiEndpoint, props.apiMethod || 'GET', props.apiLabelField || 'label', props.apiValueField || 'value')
      .then((result) => {
        if (!cancelled) {
          setApiOptions(result)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setApiOptions([])
        }
      })
      .finally(() => {
        if (!cancelled) setApiLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [
    dependencySignature,
    blockViewModel.apiEndpoint,
    blockViewModel.apiLabelField,
    blockViewModel.apiMethod,
    blockViewModel.apiValueField,
    blockViewModel.previewMode,
    sourceType,
  ])

  const resolvedOptions = useMemo(() => {
    if (sourceType === 'preset') return presetOptions.length ? presetOptions : manualOptions
    if (sourceType === 'api') return apiOptions.length ? apiOptions : manualOptions
    return manualOptions
  }, [apiOptions, manualOptions, presetOptions, sourceType])

  const { committedValue, draftValue, setDraftValue, commitValue } = useFilterValueState(blockViewModel, filterType, resolvedOptions)
  const activeValue = blockViewModel.autoApply === false ? draftValue : committedValue
  const dependencyConditions = context?.state || {}
  const visible = evaluateCondition(blockViewModel.visibleWhen, dependencyConditions)
  const disabledFromCondition = evaluateCondition(blockViewModel.disabledWhen, dependencyConditions)
  const disabled = Boolean(blockViewModel.disabled || disabledFromCondition || (sourceType === 'api' && apiLoading))
  const showLabel = blockViewModel.showLabel !== false
  const showClearButton = blockViewModel.showClearButton !== false
  const wrapperClassName = blockViewModel.wrapperClassName || ''
  const className = blockViewModel.className || ''

  const emitStateChange = useCallback(
    (nextValue: FilterValue) => {
      if (context) {
        context.setFilterValue(filterKey, nextValue)
      }
      blockViewModel.onStateChange?.(normalizeFilterState(filterKey, nextValue))

      if (blockViewModel.emitEventName && typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent(blockViewModel.emitEventName, {
            detail: {
              filterKey,
              value: nextValue,
              state: normalizeFilterState(filterKey, nextValue),
            },
          }),
        )
      }
    },
    [context, filterKey, blockViewModel],
  )

  const commitAndSync = useCallback(
    (nextValue: FilterValue) => {
      const normalized = coerceValueForType(filterType, nextValue, blockViewModel)
      commitValue(normalized)
      emitStateChange(normalized)
    },
    [commitValue, emitStateChange, filterType, blockViewModel],
  )

  useEffect(() => {
    if (blockViewModel.previewMode) return
    if (blockViewModel.persistState || blockViewModel.syncWithUrl) {
      const storageKey = blockViewModel.storageKey || `filter:${filterKey}`
      let restored: FilterValue | undefined

      if (typeof window !== 'undefined') {
        if (blockViewModel.syncWithUrl) {
          restored = parseValue(new URL(window.location.href).searchParams.get(blockViewModel.queryParam || filterKey))
        }

        if (restored === undefined && blockViewModel.persistState) {
          restored = parseValue(window.localStorage.getItem(storageKey))
        }
      }

      if (restored !== undefined && blockViewModel.value === undefined) {
        commitAndSync(restored)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (blockViewModel.previewMode) return
    if (blockViewModel.persistState && typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(blockViewModel.storageKey || `filter:${filterKey}`, serializeValue(committedValue))
      } catch {
        // ignore storage errors
      }
    }

    if (blockViewModel.syncWithUrl && typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href)
        const param = blockViewModel.queryParam || filterKey
        if (isValueEmpty(committedValue)) {
          url.searchParams.delete(param)
        } else {
          url.searchParams.set(param, serializeValue(committedValue))
        }
        window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
      } catch {
        // ignore URL sync errors
      }
    }
  }, [
    committedValue,
    filterKey,
    blockViewModel.persistState,
    blockViewModel.previewMode,
    blockViewModel.queryParam,
    blockViewModel.storageKey,
    blockViewModel.syncWithUrl,
  ])

  useEffect(() => {
    if (blockViewModel.previewMode) return
    if (blockViewModel.autoApply === false) return
    emitStateChange(committedValue)
  }, [blockViewModel.autoApply, blockViewModel.previewMode, committedValue, emitStateChange])

  const clearCurrentValue = useCallback(() => {
    const cleared = getEmptyValueForType(filterType, blockViewModel)
    if (blockViewModel.autoApply === false) {
      setDraftValue(cleared)
    }
    commitAndSync(cleared)
    if (context) context.clearFilter(filterKey)
  }, [blockViewModel, commitAndSync, context, filterType, filterKey, setDraftValue])

  const clearAllFilters = useCallback(() => {
    const cleared = getEmptyValueForType(filterType, blockViewModel)
    if (blockViewModel.autoApply === false) {
      setDraftValue(cleared)
    }
    context?.clearAll()
    blockViewModel.onStateChange?.({})
    commitValue(cleared)
  }, [blockViewModel, commitValue, context, filterType, setDraftValue])

  const setValue = useCallback(
    (next: FilterValue) => {
      const normalized = coerceValueForType(filterType, next, blockViewModel)
      if (blockViewModel.autoApply === false) {
        setDraftValue(normalized)
        return
      }
      commitAndSync(normalized)
    },
    [blockViewModel, commitAndSync, filterType, setDraftValue],
  )

  if (!visible) {
    return null
  }

  const sharedProps = {
    label: blockViewModel.label,
    hint: blockViewModel.helpText,
    disabled,
    className,
    wrapperClassName,
    showLabel,
  }

  const normalizedRenderer = (() => {
    switch (filterType) {
      case 'dropdown':
        return (
          <FilterDropdown
            {...sharedProps}
            value={typeof activeValue === 'string' ? activeValue : ''}
            onChange={setValue}
            options={resolvedOptions.length ? resolvedOptions : filterDefaultOptions}
            placeholder={props.placeholder || 'Select one...'}
            searchable={props.searchable}
            clearable={props.clearable !== false}
            menuPlacement="bottom"
          />
        )
      case 'multiselect':
        return (
          <FilterMultiSelect
            {...sharedProps}
            value={Array.isArray(activeValue) ? activeValue.map(String) : []}
            onChange={setValue}
            options={resolvedOptions.length ? resolvedOptions : filterDefaultOptions}
            placeholder={props.placeholder || 'Select multiple...'}
            searchable={props.searchable !== false}
            isClearable={props.clearable !== false}
            closeMenuOnSelect={props.closeMenuOnSelect ?? false}
            maxSelections={props.maxSelections}
            showSelectedCount={props.showSelectedCount}
            menuPlacement="bottom"
          />
        )
      case 'checkboxGroup':
        return (
          <FilterCheckboxGroup
            {...sharedProps}
            value={Array.isArray(activeValue) ? activeValue.map(String) : []}
            onChange={setValue}
            options={resolvedOptions.length ? resolvedOptions : checkboxDefaultOptions}
            inline={props.inline}
            columns={props.columns}
            name={`${filterKey}-checkbox`}
          />
        )
      case 'radioGroup':
        return (
          <FilterRadioGroup
            {...sharedProps}
            value={typeof activeValue === 'string' ? activeValue : ''}
            onChange={setValue}
            options={resolvedOptions.length ? resolvedOptions : radioDefaultOptions}
            inline={props.inline}
            columns={props.columns}
            radioStyle={props.radioStyle || 'default'}
            name={`${filterKey}-radio`}
          />
        )
      case 'toggle':
        return (
          <FilterSwitch
            {...sharedProps}
            checked={Boolean(activeValue)}
            onChange={setValue}
            onLabel={props.onLabel}
            offLabel={props.offLabel}
            toggleColor={props.toggleColor}
            showStateLabel={props.showStateLabel}
          />
        )
      case 'sortDropdown':
        return (
          <FilterSortDropdown
            label={showLabel ? props.label : undefined}
            value={typeof activeValue === 'string' ? activeValue : props.defaultSort || ''}
            onChange={setValue}
            options={resolvedOptions.length ? resolvedOptions : sortDefaultOptions}
            disabled={disabled}
          />
        )
      case 'tagChips':
        return (
          <FilterTagChips
            {...sharedProps}
            value={Array.isArray(activeValue) ? activeValue.map(String) : []}
            onChange={setValue}
            options={resolvedOptions.length ? resolvedOptions : tagDefaultOptions}
            allowMultiple={props.allowMultiple !== false}
            removable={props.removable !== false}
          />
        )
      case 'rangeSlider':
        return (
          <FilterRangeSlider
            {...sharedProps}
            value={Array.isArray(activeValue) ? [Number(activeValue[0]) || 0, Number(activeValue[1]) || 0] : [Number(props.min ?? 0), Number(props.max ?? 100)]}
            onChange={setValue}
            min={Number(props.min ?? 0)}
            max={Number(props.max ?? 100)}
            step={Number(props.step ?? 1)}
            rangeMode={props.rangeMode || 'double'}
            showTooltip={props.showTooltip !== false}
            showTicks={props.showTicks}
            prefix={props.prefix}
            suffix={props.suffix}
            showMinMaxLabels={props.showMinMaxLabels !== false}
          />
        )
      case 'searchInput':
        return (
          <FilterSearch
            {...sharedProps}
            value={typeof activeValue === 'string' ? activeValue : ''}
            onChange={setValue}
            placeholder={props.placeholder || 'Search...'}
            onClear={props.clearable !== false ? clearCurrentValue : undefined}
            autoFocus={props.autoFocus}
          />
        )
      case 'clearAll':
        return <FilterClearButton onClick={clearAllFilters} label={props.applyButtonLabel || 'Clear all'} />
      default:
        return (
          <FilterDropdown
            {...sharedProps}
            value={typeof activeValue === 'string' ? activeValue : ''}
            onChange={setValue}
            options={resolvedOptions.length ? resolvedOptions : manualOptions}
            placeholder={props.placeholder || 'Select one...'}
            searchable={props.searchable}
            clearable={props.clearable !== false}
          />
        )
    }
  })()

  const layoutClass = props.orientation === 'horizontal' ? 'd-flex align-items-center gap-3 flex-wrap' : 'd-flex flex-column gap-3'
  const variantClass = props.variant ? `filter-variant-${slugify(props.variant)}` : 'filter-variant-default'
  const densityClass = props.density ? `filter-density-${slugify(props.density)}` : ''
  const responsiveVariant = props.desktopVariant || props.mobileVariant ? `filter-mobile-${slugify(props.mobileVariant || 'stacked')} filter-desktop-${slugify(props.desktopVariant || 'inline')}` : ''

  return (
    <div
      id={props.id}
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      onTouchStart={(event) => event.stopPropagation()}
      className={[layoutClass, variantClass, densityClass, responsiveVariant, props.fullWidth ? 'w-100' : '', wrapperClassName, 'filter-component']
        .filter(Boolean)
        .join(' ')}
      aria-label={props.ariaLabel}
      aria-description={props.ariaDescription}
      tabIndex={props.tabIndex}
      data-filter-key={filterKey}
      data-filter-type={filterType}>
      {props.sectionTitle ? <div className="filter-section-title">{props.sectionTitle}</div> : null}
      {props.showDivider ? <hr className="my-1 border-white border-opacity-10" /> : null}
      <div className="filter-control-stack">{normalizedRenderer}</div>
      {showClearButton && filterType !== 'clearAll' ? (
        <div className="filter-actions">
          <FilterClearButton onClick={clearCurrentValue} label={props.applyButtonLabel || 'Clear'} className="filter-clear-btn" />
          {props.autoApply === false ? (
            <Button type="button" variant="outline-light" className="border-white border-opacity-10 filter-apply-btn" onClick={() => commitAndSync(draftValue)}>
              {props.applyButtonLabel || 'Apply filters'}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export default FilterComponent

