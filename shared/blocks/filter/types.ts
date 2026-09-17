export type FilterType =
  | 'dropdown'
  | 'multiselect'
  | 'checkboxGroup'
  | 'radioGroup'
  | 'toggle'
  | 'sortDropdown'
  | 'tagChips'
  | 'rangeSlider'
  | 'searchInput'
  | 'clearAll'

export type LegacyFilterType =
  | 'search'
  | 'checkbox-group'
  | 'multi-select-dropdown'
  | 'radio-buttons'
  | 'toggle-switch'
  | 'sort-dropdown'
  | 'tag-chips'
  | 'range-slider'
  | 'clear-all'

export type AnyFilterType = FilterType | LegacyFilterType
export type FilterValue = string | string[] | boolean | [number, number] | null | undefined
export type FilterState = Record<string, FilterValue>
export type FilterSourceType = 'manual' | 'preset' | 'api'

export type FilterOption = {
  value: string
  label: string
  disabled?: boolean
  icon?: string
  badge?: string
  group?: string
  description?: string
}

export interface FilterProps {
  filterType: AnyFilterType
  filterKey: string
  bindTo?: string
  label: string
  helpText?: string
  placeholder: string
  defaultValue?: FilterValue
  defaultChecked?: boolean
  disabled?: boolean
  required?: boolean
  clearable?: boolean
  searchable?: boolean
  showLabel?: boolean
  showClearButton?: boolean
  className?: string
  wrapperClassName?: string
  options?: FilterOption[]
  sourceType?: FilterSourceType
  presetKey?: string
  apiEndpoint?: string
  apiMethod?: string
  apiLabelField?: string
  apiValueField?: string
  closeMenuOnSelect?: boolean
  maxSelections?: number
  showSelectedCount?: boolean
  inline?: boolean
  columns?: number
  selectAllEnabled?: boolean
  selectAllLabel?: string
  radioStyle?: 'default' | 'button'
  onLabel?: string
  offLabel?: string
  toggleColor?: string
  showStateLabel?: boolean
  defaultSort?: string
  sortField?: string
  sortDirection?: 'asc' | 'desc'
  removable?: boolean
  chipStyle?: string
  chipVariant?: string
  allowMultiple?: boolean
  min?: number
  max?: number
  step?: number
  value?: FilterValue
  rangeMode?: 'single' | 'double'
  showTooltip?: boolean
  showTicks?: boolean
  prefix?: string
  suffix?: string
  showMinMaxLabels?: boolean
  debounceMs?: number
  autoFocus?: boolean
  persistState?: boolean
  storageKey?: string
  syncWithUrl?: boolean
  queryParam?: string
  autoApply?: boolean
  applyButtonLabel?: string
  resetOnChange?: boolean
  emitEventName?: string
  dependsOn?: string | string[]
  visibleWhen?: string | boolean
  disabledWhen?: string | boolean
  reloadOptionsOnDependencyChange?: boolean
  variant?: string
  size?: string
  density?: string
  fullWidth?: boolean
  labelPosition?: string
  orientation?: 'horizontal' | 'vertical'
  mobileVariant?: string
  desktopVariant?: string
  sticky?: boolean
  collapsedByDefault?: boolean
  showDivider?: boolean
  sectionTitle?: string
  id?: string
  ariaLabel?: string
  ariaDescription?: string
  tabIndex?: number
  previewMode?: boolean
  onChange?: (value: FilterValue) => void
  onStateChange?: (state: FilterState) => void
  [key: string]: any
}

export type FilterViewModel = FilterProps & {
  resolvedFilterType: FilterType
  normalizedOptions: FilterOption[]
  effectiveValue: FilterValue
  emptyValue: FilterValue
  rangeMin: number
  rangeMax: number
}
