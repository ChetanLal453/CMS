import { filterDefaultProps } from './defaults'
import { createFilterViewModel } from './viewModel'
import { normalizeFilter } from './normalize'

const buildSchemaField = (type: any, label: string, defaultValue: any, extra: Record<string, any> = {}) => ({
  type,
  label,
  default: defaultValue,
  ...extra,
})

const isFilterType = (...types: string[]) => (props: Record<string, any>) => types.includes(String(props.filterType || '').trim())
const isNotFilterType = (...types: string[]) => (props: Record<string, any>) => !types.includes(String(props.filterType || '').trim())
const isSourceType = (...types: string[]) => (props: Record<string, any>) => types.includes(String(props.sourceType || '').trim())

export {
  checkboxDefaultOptions,
  filterDefaultOptions,
  filterDefaultProps,
  manualDefaultOptions,
  radioDefaultOptions,
  sortDefaultOptions,
  tagDefaultOptions,
} from './defaults'
export {
  coerceValueForType,
  inferValueFromType,
  normalizeFilter,
  normalizeFilterType,
  normalizeOptions,
} from './normalize'
export type { FilterOption, FilterProps, FilterState, FilterType, FilterValue, FilterViewModel } from './types'

export { createFilterViewModel } from './viewModel'
export const filterSchema = {
  categories: [
    { id: 'general', label: 'General', expanded: true },
    { id: 'data', label: 'Data', expanded: true },
    { id: 'behavior', label: 'Behavior', expanded: true },
    { id: 'layout', label: 'Layout', expanded: false },
    { id: 'accessibility', label: 'Accessibility', expanded: false },
  ],
  properties: {
    filterType: buildSchemaField('select', 'Filter Type', filterDefaultProps.filterType, {
      category: 'General',
      options: [
        { value: 'dropdown', label: 'Dropdown' },
        { value: 'multiselect', label: 'Multi Select' },
        { value: 'checkboxGroup', label: 'Checkbox Group' },
        { value: 'radioGroup', label: 'Radio Group' },
        { value: 'toggle', label: 'Toggle' },
        { value: 'sortDropdown', label: 'Sort Dropdown' },
        { value: 'tagChips', label: 'Tag Chips' },
        { value: 'rangeSlider', label: 'Range Slider' },
        { value: 'searchInput', label: 'Search Input' },
        { value: 'clearAll', label: 'Clear All Button' },
      ],
    }),
    filterKey: buildSchemaField('text', 'Filter Key', filterDefaultProps.filterKey, { category: 'General' }),
    bindTo: buildSchemaField('text', 'Bind To', '', { category: 'General', description: 'Optional alias for filterKey.' }),
    label: buildSchemaField('text', 'Label', filterDefaultProps.label, { category: 'General' }),
    helpText: buildSchemaField('textarea', 'Help Text', filterDefaultProps.helpText, { category: 'General' }),
    showLabel: buildSchemaField('toggle', 'Show Label', filterDefaultProps.showLabel, { category: 'General' }),
    showClearButton: buildSchemaField('toggle', 'Show Clear Button', filterDefaultProps.showClearButton, { category: 'General', showIf: isNotFilterType('clearAll') }),
    disabled: buildSchemaField('toggle', 'Disabled', filterDefaultProps.disabled, { category: 'General' }),
    required: buildSchemaField('toggle', 'Required', filterDefaultProps.required, { category: 'General', showIf: isNotFilterType('clearAll') }),
    sourceType: buildSchemaField('select', 'Option Source', filterDefaultProps.sourceType, {
      category: 'Data',
      showIf: isFilterType('dropdown', 'multiselect', 'checkboxGroup', 'radioGroup', 'sortDropdown', 'tagChips'),
      options: [
        { value: 'manual', label: 'Manual' },
        { value: 'preset', label: 'Preset' },
        { value: 'api', label: 'API' },
      ],
    }),
    presetKey: buildSchemaField('text', 'Preset Key', filterDefaultProps.presetKey, { category: 'Data', showIf: isSourceType('preset') }),
    apiEndpoint: buildSchemaField('text', 'API Endpoint', filterDefaultProps.apiEndpoint, { category: 'Data', showIf: isSourceType('api') }),
    apiMethod: buildSchemaField('select', 'API Method', filterDefaultProps.apiMethod, {
      category: 'Data',
      showIf: isSourceType('api'),
      options: [
        { value: 'GET', label: 'GET' },
        { value: 'POST', label: 'POST' },
      ],
    }),
    apiLabelField: buildSchemaField('text', 'API Label Field', filterDefaultProps.apiLabelField, { category: 'Data', showIf: isSourceType('api') }),
    apiValueField: buildSchemaField('text', 'API Value Field', filterDefaultProps.apiValueField, { category: 'Data', showIf: isSourceType('api') }),
    options: buildSchemaField('option-list', 'Options', filterDefaultProps.options, { category: 'Data', showIf: isSourceType('manual') }),
    searchable: buildSchemaField('toggle', 'Searchable', filterDefaultProps.searchable, { category: 'Data', showIf: isFilterType('dropdown', 'multiselect') }),
    clearable: buildSchemaField('toggle', 'Clearable', filterDefaultProps.clearable, { category: 'Data', showIf: isFilterType('dropdown', 'multiselect', 'searchInput') }),
    placeholder: buildSchemaField('text', 'Placeholder', filterDefaultProps.placeholder, { category: 'Data', showIf: isFilterType('dropdown', 'multiselect', 'searchInput') }),
    closeMenuOnSelect: buildSchemaField('toggle', 'Close Menu On Select', false, { category: 'Data', showIf: isFilterType('multiselect') }),
    maxSelections: buildSchemaField('number', 'Max Selections', filterDefaultProps.maxSelections, { category: 'Data', min: 1, showIf: isFilterType('multiselect') }),
    showSelectedCount: buildSchemaField('toggle', 'Show Selected Count', filterDefaultProps.showSelectedCount, { category: 'Data', showIf: isFilterType('multiselect') }),
    inline: buildSchemaField('toggle', 'Inline', filterDefaultProps.inline, { category: 'Layout', showIf: isFilterType('checkboxGroup', 'radioGroup') }),
    columns: buildSchemaField('number', 'Columns', filterDefaultProps.columns, { category: 'Layout', min: 1, max: 6, showIf: isFilterType('checkboxGroup', 'radioGroup') }),
    selectAllEnabled: buildSchemaField('toggle', 'Select All Enabled', filterDefaultProps.selectAllEnabled, { category: 'Behavior', showIf: isFilterType('multiselect', 'checkboxGroup') }),
    selectAllLabel: buildSchemaField('text', 'Select All Label', filterDefaultProps.selectAllLabel, { category: 'Behavior', showIf: isFilterType('multiselect', 'checkboxGroup') }),
    radioStyle: buildSchemaField('select', 'Radio Style', filterDefaultProps.radioStyle, {
      category: 'Behavior',
      showIf: isFilterType('radioGroup'),
      options: [
        { value: 'default', label: 'Default' },
        { value: 'button', label: 'Button' },
      ],
    }),
    defaultChecked: buildSchemaField('toggle', 'Default Checked', filterDefaultProps.defaultChecked, { category: 'Behavior', showIf: isFilterType('toggle') }),
    onLabel: buildSchemaField('text', 'On Label', filterDefaultProps.onLabel, { category: 'Behavior', showIf: isFilterType('toggle') }),
    offLabel: buildSchemaField('text', 'Off Label', filterDefaultProps.offLabel, { category: 'Behavior', showIf: isFilterType('toggle') }),
    toggleColor: buildSchemaField('color', 'Toggle Color', filterDefaultProps.toggleColor, { category: 'Behavior', showIf: isFilterType('toggle') }),
    showStateLabel: buildSchemaField('toggle', 'Show State Label', filterDefaultProps.showStateLabel, { category: 'Behavior', showIf: isFilterType('toggle') }),
    defaultSort: buildSchemaField('text', 'Default Sort', filterDefaultProps.defaultSort, { category: 'Behavior', showIf: isFilterType('sortDropdown') }),
    sortField: buildSchemaField('text', 'Sort Field', filterDefaultProps.sortField, { category: 'Behavior', showIf: isFilterType('sortDropdown') }),
    sortDirection: buildSchemaField('select', 'Sort Direction', filterDefaultProps.sortDirection, {
      category: 'Behavior',
      showIf: isFilterType('sortDropdown'),
      options: [
        { value: 'asc', label: 'Ascending' },
        { value: 'desc', label: 'Descending' },
      ],
    }),
    removable: buildSchemaField('toggle', 'Removable', filterDefaultProps.removable, { category: 'Behavior', showIf: isFilterType('tagChips') }),
    chipStyle: buildSchemaField('text', 'Chip Style', filterDefaultProps.chipStyle, { category: 'Behavior', showIf: isFilterType('tagChips') }),
    chipVariant: buildSchemaField('text', 'Chip Variant', filterDefaultProps.chipVariant, { category: 'Behavior', showIf: isFilterType('tagChips') }),
    allowMultiple: buildSchemaField('toggle', 'Allow Multiple', filterDefaultProps.allowMultiple, { category: 'Behavior', showIf: isFilterType('tagChips') }),
    min: buildSchemaField('number', 'Min', filterDefaultProps.min, { category: 'Behavior', showIf: isFilterType('rangeSlider') }),
    max: buildSchemaField('number', 'Max', filterDefaultProps.max, { category: 'Behavior', showIf: isFilterType('rangeSlider') }),
    step: buildSchemaField('number', 'Step', filterDefaultProps.step, { category: 'Behavior', showIf: isFilterType('rangeSlider') }),
    rangeMode: buildSchemaField('select', 'Range Mode', filterDefaultProps.rangeMode, {
      category: 'Behavior',
      showIf: isFilterType('rangeSlider'),
      options: [
        { value: 'single', label: 'Single' },
        { value: 'double', label: 'Double' },
      ],
    }),
    showTooltip: buildSchemaField('toggle', 'Show Tooltip', filterDefaultProps.showTooltip, { category: 'Behavior', showIf: isFilterType('rangeSlider') }),
    showTicks: buildSchemaField('toggle', 'Show Ticks', filterDefaultProps.showTicks, { category: 'Behavior', showIf: isFilterType('rangeSlider') }),
    prefix: buildSchemaField('text', 'Prefix', filterDefaultProps.prefix, { category: 'Behavior', showIf: isFilterType('rangeSlider') }),
    suffix: buildSchemaField('text', 'Suffix', filterDefaultProps.suffix, { category: 'Behavior', showIf: isFilterType('rangeSlider') }),
    showMinMaxLabels: buildSchemaField('toggle', 'Show Min/Max Labels', filterDefaultProps.showMinMaxLabels, { category: 'Behavior', showIf: isFilterType('rangeSlider') }),
    debounceMs: buildSchemaField('number', 'Debounce (ms)', filterDefaultProps.debounceMs, { category: 'Behavior', showIf: isFilterType('searchInput') }),
    autoFocus: buildSchemaField('toggle', 'Auto Focus', filterDefaultProps.autoFocus, { category: 'Behavior', showIf: isFilterType('searchInput') }),
    persistState: buildSchemaField('toggle', 'Persist State', filterDefaultProps.persistState, { category: 'Behavior' }),
    storageKey: buildSchemaField('text', 'Storage Key', filterDefaultProps.storageKey, { category: 'Behavior', showIf: (props) => Boolean(props.persistState) }),
    syncWithUrl: buildSchemaField('toggle', 'Sync With URL', filterDefaultProps.syncWithUrl, { category: 'Behavior' }),
    queryParam: buildSchemaField('text', 'Query Param', filterDefaultProps.queryParam, { category: 'Behavior', showIf: (props) => Boolean(props.syncWithUrl) }),
    autoApply: buildSchemaField('toggle', 'Auto Apply', filterDefaultProps.autoApply, { category: 'Behavior' }),
    applyButtonLabel: buildSchemaField('text', 'Apply Button Label', filterDefaultProps.applyButtonLabel, { category: 'Behavior', showIf: isNotFilterType('searchInput') }),
    resetOnChange: buildSchemaField('toggle', 'Reset On Change', filterDefaultProps.resetOnChange, { category: 'Behavior' }),
    emitEventName: buildSchemaField('text', 'Emit Event Name', filterDefaultProps.emitEventName, { category: 'Behavior' }),
    dependsOn: buildSchemaField('text', 'Depends On', filterDefaultProps.dependsOn, { category: 'Behavior' }),
    visibleWhen: buildSchemaField('text', 'Visible When', filterDefaultProps.visibleWhen, { category: 'Behavior' }),
    disabledWhen: buildSchemaField('text', 'Disabled When', filterDefaultProps.disabledWhen, { category: 'Behavior' }),
    reloadOptionsOnDependencyChange: buildSchemaField('toggle', 'Reload Options On Dependency Change', filterDefaultProps.reloadOptionsOnDependencyChange, {
      category: 'Behavior',
      showIf: isSourceType('api'),
    }),
    variant: buildSchemaField('text', 'Variant', filterDefaultProps.variant, { category: 'Layout' }),
    size: buildSchemaField('text', 'Size', filterDefaultProps.size, { category: 'Layout' }),
    density: buildSchemaField('text', 'Density', filterDefaultProps.density, { category: 'Layout' }),
    fullWidth: buildSchemaField('toggle', 'Full Width', filterDefaultProps.fullWidth, { category: 'Layout' }),
    labelPosition: buildSchemaField('text', 'Label Position', filterDefaultProps.labelPosition, { category: 'Layout' }),
    orientation: buildSchemaField('select', 'Orientation', filterDefaultProps.orientation, {
      category: 'Layout',
      options: [
        { value: 'horizontal', label: 'Horizontal' },
        { value: 'vertical', label: 'Vertical' },
      ],
    }),
    mobileVariant: buildSchemaField('text', 'Mobile Variant', filterDefaultProps.mobileVariant, { category: 'Layout' }),
    desktopVariant: buildSchemaField('text', 'Desktop Variant', filterDefaultProps.desktopVariant, { category: 'Layout' }),
    sticky: buildSchemaField('toggle', 'Sticky', filterDefaultProps.sticky, { category: 'Layout' }),
    collapsedByDefault: buildSchemaField('toggle', 'Collapsed By Default', filterDefaultProps.collapsedByDefault, { category: 'Layout' }),
    showDivider: buildSchemaField('toggle', 'Show Divider', filterDefaultProps.showDivider, { category: 'Layout' }),
    sectionTitle: buildSchemaField('text', 'Section Title', filterDefaultProps.sectionTitle, { category: 'Layout' }),
    id: buildSchemaField('text', 'ID', filterDefaultProps.id, { category: 'Accessibility' }),
    ariaLabel: buildSchemaField('text', 'ARIA Label', filterDefaultProps.ariaLabel, { category: 'Accessibility' }),
    ariaDescription: buildSchemaField('text', 'ARIA Description', filterDefaultProps.ariaDescription, { category: 'Accessibility' }),
    tabIndex: buildSchemaField('number', 'Tab Index', filterDefaultProps.tabIndex, { category: 'Accessibility' }),
  },
}

export const filterContract = {
  defaultProps: filterDefaultProps,
  schema: filterSchema,
  normalize: normalizeFilter,
  createViewModel: createFilterViewModel,
}
