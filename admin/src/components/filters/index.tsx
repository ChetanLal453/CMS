'use client'

import clsx from 'clsx'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import Nouislider from 'nouislider-react'
import ReactSelect, { type StylesConfig, type MultiValue, type ActionMeta } from 'react-select'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Form,
  InputGroup,
} from 'react-bootstrap'
import { ChevronDown, Search, SlidersHorizontal, Tags, X } from 'lucide-react'

export type FilterOption = {
  value: string
  label: ReactNode
  isDisabled?: boolean
  disabled?: boolean
  icon?: ReactNode
  badge?: ReactNode
  group?: string
  description?: ReactNode
}

type FilterBaseProps = {
  label?: ReactNode
  hint?: ReactNode
  className?: string
  wrapperClassName?: string
  showLabel?: boolean
}

type FilterSectionProps = FilterBaseProps & {
  children: ReactNode
}

export type FilterPanelProps = {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}

export const FilterPanel = ({ title, description, actions, children, className, bodyClassName }: FilterPanelProps) => {
  return (
    <Card className={clsx('bg-transparent border border-white border-opacity-10 shadow-sm', className)}>
      <CardHeader className="bg-transparent border-0 pb-0 d-flex flex-wrap justify-content-between align-items-start gap-3">
        <div>
          <h4 className="card-title mb-1">{title}</h4>
          {description ? <div className="text-muted small">{description}</div> : null}
        </div>
        {actions ? <div className="d-flex flex-wrap align-items-center gap-2">{actions}</div> : null}
      </CardHeader>
      <CardBody className={clsx('pt-3 d-flex flex-column gap-3', bodyClassName)}>{children}</CardBody>
    </Card>
  )
}

export const FilterGrid = ({ children, className }: { children: ReactNode; className?: string }) => {
  return (
    <div
      className={clsx('d-grid gap-3', className)}
      style={{
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      }}>
      {children}
    </div>
  )
}

const FilterSection = ({ label, hint, className, wrapperClassName, children }: FilterSectionProps) => {
  return (
    <div className={clsx('d-flex flex-column gap-2', wrapperClassName, className)}>
      {label || hint ? (
        <div className="d-flex align-items-center justify-content-between gap-2">
          {label ? <Form.Label className="mb-0 text-uppercase fw-semibold small text-muted">{label}</Form.Label> : <span />}
          {hint ? <small className="text-muted">{hint}</small> : null}
        </div>
      ) : null}
      {children}
    </div>
  )
}

const darkSelectStyles: StylesConfig<FilterOption, boolean> = {
  control: (base, state) => ({
    ...base,
    minHeight: 40,
    backgroundColor: 'transparent',
    borderColor: state.isFocused ? 'rgba(124, 92, 252, 0.72)' : 'rgba(255, 255, 255, 0.12)',
    boxShadow: 'none',
    color: 'var(--t1)',
    ':hover': {
      borderColor: state.isFocused ? 'rgba(124, 92, 252, 0.72)' : 'rgba(255, 255, 255, 0.2)',
    },
  }),
  valueContainer: (base) => ({
    ...base,
    paddingTop: 4,
    paddingBottom: 4,
  }),
  input: (base) => ({
    ...base,
    color: 'var(--t1)',
  }),
  placeholder: (base) => ({
    ...base,
    color: 'var(--t2)',
  }),
  singleValue: (base) => ({
    ...base,
    color: 'var(--t1)',
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: 'var(--s1)',
    border: '1px solid var(--b2)',
    boxShadow: '0 18px 45px rgba(0, 0, 0, 0.35)',
    zIndex: 30,
  }),
  menuList: (base) => ({
    ...base,
    paddingTop: 4,
    paddingBottom: 4,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? 'rgba(124, 92, 252, 0.2)' : state.isFocused ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
    color: 'var(--t1)',
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
    ':active': {
      backgroundColor: 'rgba(124, 92, 252, 0.22)',
    },
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: 'rgba(124, 92, 252, 0.16)',
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: 'var(--pul)',
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: 'var(--pul)',
    ':hover': {
      backgroundColor: 'rgba(124, 92, 252, 0.22)',
      color: '#fff',
    },
  }),
  indicatorSeparator: (base) => ({
    ...base,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: 'var(--t2)',
    ':hover': {
      color: 'var(--t1)',
    },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: 'var(--t2)',
    ':hover': {
      color: 'var(--t1)',
    },
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
}

const isOptionDisabled = (option: FilterOption) => Boolean(option.isDisabled || option.disabled)

const renderOptionLabel = (option: FilterOption) => (
  <div className="d-flex align-items-center gap-2 flex-wrap">
    {option.icon ? <span className="d-inline-flex align-items-center">{option.icon}</span> : null}
    <span>{option.label}</span>
    {option.badge ? <span className="badge rounded-pill text-bg-secondary">{option.badge}</span> : null}
    {option.group ? <small className="text-muted">{option.group}</small> : null}
  </div>
)

export type FilterSearchProps = FilterBaseProps & {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onClear?: () => void
  disabled?: boolean
  debounceMs?: number
  autoFocus?: boolean
}

export const FilterSearch = ({
  label = 'Search',
  hint,
  value,
  onChange,
  placeholder = 'Search...',
  onClear,
  disabled,
  autoFocus,
  className,
  showLabel = true,
}: FilterSearchProps) => {
  return (
    <FilterSection label={showLabel ? label : undefined} hint={hint} className={className}>
      <InputGroup>
        <InputGroup.Text className="bg-transparent border-white border-opacity-10 text-muted">
          <Search size={14} />
        </InputGroup.Text>
        <Form.Control
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className="bg-transparent text-light border-white border-opacity-10"
        />
        {onClear ? (
          <Button variant="outline-light" className="border-white border-opacity-10" type="button" onClick={onClear} disabled={disabled || !value}>
            <X size={14} />
          </Button>
        ) : null}
      </InputGroup>
    </FilterSection>
  )
}

export type FilterDropdownProps = FilterBaseProps & {
  value: string
  onChange: (value: string) => void
  options: FilterOption[]
  placeholder?: string
  searchable?: boolean
  clearable?: boolean
  menuPlacement?: 'auto' | 'top' | 'bottom'
  disabled?: boolean
}

export const FilterDropdown = ({
  label,
  hint,
  value,
  onChange,
  options,
  placeholder = 'Select one...',
  searchable = false,
  clearable = true,
  menuPlacement = 'bottom',
  disabled,
  className,
  showLabel = true,
}: FilterDropdownProps) => {
  const selectedOption = useMemo(() => options.find((option) => option.value === value) || null, [options, value])

  return (
    <FilterSection label={showLabel ? label : undefined} hint={hint} className={className}>
      <ReactSelect<FilterOption, false>
        isClearable={clearable}
        isSearchable={searchable}
        isDisabled={disabled}
        placeholder={placeholder}
        options={options}
        value={selectedOption}
        menuPlacement={menuPlacement}
        menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
        menuPosition="fixed"
        menuShouldBlockScroll={false}
        onChange={(nextValue) => onChange(nextValue?.value || '')}
        getOptionLabel={(option) => String(option.label)}
        getOptionValue={(option) => option.value}
        formatOptionLabel={(option) => renderOptionLabel(option)}
        isOptionDisabled={isOptionDisabled}
        styles={darkSelectStyles}
        classNamePrefix="filter-select"
      />
    </FilterSection>
  )
}

export type FilterMultiSelectProps = FilterBaseProps & {
  value: string[]
  onChange: (value: string[]) => void
  options: FilterOption[]
  placeholder?: string
  searchable?: boolean
  isClearable?: boolean
  closeMenuOnSelect?: boolean
  maxSelections?: number
  showSelectedCount?: boolean
  menuPlacement?: 'auto' | 'top' | 'bottom'
  disabled?: boolean
}

export const FilterMultiSelect = ({
  label,
  hint,
  value,
  onChange,
  options,
  placeholder = 'Select multiple...',
  searchable = true,
  isClearable = true,
  closeMenuOnSelect = false,
  maxSelections,
  showSelectedCount = false,
  menuPlacement = 'bottom',
  disabled,
  className,
  showLabel = true,
}: FilterMultiSelectProps) => {
  const selectedOptions = useMemo(() => options.filter((option) => value.includes(option.value)), [options, value])
  const selectionLimitReached = typeof maxSelections === 'number' && value.length >= maxSelections

  return (
    <FilterSection label={showLabel ? label : undefined} hint={hint} className={className}>
      <ReactSelect<FilterOption, true>
        isMulti
        isClearable={isClearable}
        isDisabled={disabled}
        placeholder={placeholder}
        isSearchable={searchable}
        closeMenuOnSelect={closeMenuOnSelect}
        options={options}
        value={selectedOptions}
        menuPlacement={menuPlacement}
        menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
        menuPosition="fixed"
        menuShouldBlockScroll={false}
        isOptionDisabled={(option) => isOptionDisabled(option) || Boolean(maxSelections && !value.includes(option.value) && value.length >= maxSelections)}
        onChange={(nextValue: MultiValue<FilterOption>, _meta: ActionMeta<FilterOption>) => {
          const next = nextValue.map((item) => item.value)
          onChange(typeof maxSelections === 'number' ? next.slice(0, maxSelections) : next)
        }}
        styles={darkSelectStyles}
        classNamePrefix="filter-select"
        formatOptionLabel={(option) => renderOptionLabel(option)}
      />
      {showSelectedCount ? <small className="text-muted">{value.length} selected</small> : null}
      {selectionLimitReached ? <small className="text-muted">Maximum {maxSelections} selections reached</small> : null}
    </FilterSection>
  )
}

export type FilterCheckboxGroupProps = FilterBaseProps & {
  value: string[]
  onChange: (value: string[]) => void
  options: FilterOption[]
  inline?: boolean
  columns?: number
  name?: string
  disabled?: boolean
}

export const FilterCheckboxGroup = ({
  label,
  hint,
  value,
  onChange,
  options,
  inline = false,
  columns = 2,
  name,
  disabled,
  className,
  showLabel = true,
}: FilterCheckboxGroupProps) => {
  const toggleValue = (itemValue: string) => {
    onChange(value.includes(itemValue) ? value.filter((current) => current !== itemValue) : [...value, itemValue])
  }

  return (
    <FilterSection label={showLabel ? label : undefined} hint={hint} className={className}>
      <div
        className={inline ? 'd-flex flex-wrap gap-2' : 'd-grid gap-2'}
        style={!inline ? { gridTemplateColumns: `repeat(${Math.max(1, columns)}, minmax(0, 1fr))` } : undefined}>
        {options.map((option) => {
          const id = `${name ?? 'filter-checkbox'}-${option.value}`
          return (
            <Form.Check
              key={option.value}
              type="checkbox"
              id={id}
              label={
                <span className="d-inline-flex align-items-center gap-2">
                  {option.icon ? <span>{option.icon}</span> : null}
                  <span>{option.label}</span>
                  {option.badge ? <span className="badge rounded-pill text-bg-secondary">{option.badge}</span> : null}
                </span>
              }
              disabled={disabled || isOptionDisabled(option)}
              checked={value.includes(option.value)}
              onChange={() => toggleValue(option.value)}
            />
          )
        })}
      </div>
    </FilterSection>
  )
}

export type FilterRadioGroupProps = FilterBaseProps & {
  value: string
  onChange: (value: string) => void
  options: FilterOption[]
  inline?: boolean
  columns?: number
  radioStyle?: 'default' | 'button'
  name: string
  disabled?: boolean
}

export const FilterRadioGroup = ({
  label,
  hint,
  value,
  onChange,
  options,
  inline = false,
  columns = 2,
  radioStyle = 'default',
  name,
  disabled,
  className,
  showLabel = true,
}: FilterRadioGroupProps) => {
  return (
    <FilterSection label={showLabel ? label : undefined} hint={hint} className={className}>
      <div
        className={inline ? 'd-flex flex-wrap gap-2' : 'd-grid gap-2'}
        style={!inline ? { gridTemplateColumns: `repeat(${Math.max(1, columns)}, minmax(0, 1fr))` } : undefined}>
        {options.map((option) => (
          <Form.Check
            key={option.value}
            type="radio"
            id={`${name}-${option.value}`}
            name={name}
            label={
              <span className="d-inline-flex align-items-center gap-2">
                {option.icon ? <span>{option.icon}</span> : null}
                <span>{option.label}</span>
              </span>
            }
            disabled={disabled || isOptionDisabled(option)}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
        ))}
      </div>
    </FilterSection>
  )
}

export type FilterSwitchProps = FilterBaseProps & {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  onLabel?: ReactNode
  offLabel?: ReactNode
  toggleColor?: string
  showStateLabel?: boolean
}

export const FilterSwitch = ({
  label,
  hint,
  checked,
  onChange,
  disabled,
  className,
  onLabel,
  offLabel,
  showStateLabel = false,
  showLabel = true,
}: FilterSwitchProps) => {
  const id = typeof label === 'string' ? `filter-switch-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : 'filter-switch'

  return (
    <FilterSection label={showLabel ? label : undefined} hint={hint} className={className}>
      <div className="d-flex align-items-center justify-content-between gap-3">
        <Form.Check
          id={id}
          type="switch"
          aria-label={typeof label === 'string' ? label : 'Filter switch'}
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
        />
        {showStateLabel ? <small className="text-muted">{checked ? (onLabel ?? 'On') : (offLabel ?? 'Off')}</small> : null}
      </div>
    </FilterSection>
  )
}

export type FilterSortDropdownProps = {
  label?: string
  value: string
  onChange: (value: string) => void
  options: FilterOption[]
  disabled?: boolean
  className?: string
}

export const FilterSortDropdown = ({ label = 'Sort', value, onChange, options, disabled, className }: FilterSortDropdownProps) => {
  const selectedLabel = options.find((option) => option.value === value)?.label

  return (
    <Dropdown className={className}>
      <DropdownToggle variant="outline-light" disabled={disabled} className="icons-center gap-1 border-white border-opacity-10">
        <SlidersHorizontal size={14} />
        <span>{selectedLabel ? `${label}: ${selectedLabel}` : label}</span>
        <ChevronDown size={14} />
      </DropdownToggle>
      <DropdownMenu className="dropdown-menu-animated">
        {options.map((option) => (
          <DropdownItem key={option.value} active={option.value === value} onClick={() => onChange(option.value)}>
            {option.label}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  )
}

export type FilterTagChipsProps = FilterBaseProps & {
  value: string[]
  onChange: (value: string[]) => void
  options: FilterOption[]
  allowMultiple?: boolean
  removable?: boolean
  disabled?: boolean
}

export const FilterTagChips = ({
  label = 'Tags',
  hint,
  value,
  onChange,
  options,
  allowMultiple = true,
  removable = true,
  disabled,
  className,
  showLabel = true,
}: FilterTagChipsProps) => {
  const toggleValue = (itemValue: string) => {
    if (!allowMultiple) {
      onChange(value.includes(itemValue) ? [] : [itemValue])
      return
    }
    onChange(value.includes(itemValue) ? value.filter((current) => current !== itemValue) : [...value, itemValue])
  }

  return (
    <FilterSection label={showLabel ? label : undefined} hint={hint} className={className}>
      <div className="d-flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value.includes(option.value)

          return (
            <Button
              key={option.value}
              type="button"
              size="sm"
              disabled={disabled || option.isDisabled}
              variant={selected ? 'primary' : 'outline-light'}
              className={clsx('rounded-pill border-white border-opacity-10 icons-center gap-1', {
                'text-light': !selected,
              })}
              onClick={() => toggleValue(option.value)}>
              <Tags size={13} />
              <span>{option.label}</span>
              {option.badge ? <span className="badge rounded-pill text-bg-secondary">{option.badge}</span> : null}
              {removable && selected ? <X size={12} /> : null}
            </Button>
          )
        })}
      </div>
    </FilterSection>
  )
}

export type FilterRangeSliderProps = FilterBaseProps & {
  value: [number, number]
  onChange: (value: [number, number]) => void
  min: number
  max: number
  step?: number
  rangeMode?: 'single' | 'double'
  showTooltip?: boolean
  showTicks?: boolean
  prefix?: ReactNode
  suffix?: ReactNode
  showMinMaxLabels?: boolean
  disabled?: boolean
}

export const FilterRangeSlider = ({
  label = 'Range',
  hint,
  value,
  onChange,
  min,
  max,
  step,
  rangeMode = 'double',
  showTooltip = true,
  showMinMaxLabels = true,
  prefix,
  suffix,
  disabled,
  className,
  showLabel = true,
}: FilterRangeSliderProps) => {
  const sliderValue: [number, number] = rangeMode === 'single' ? [value[1], value[1]] : value

  return (
    <FilterSection label={showLabel ? label : undefined} hint={hint} className={className}>
      <div className={clsx('px-2', { 'opacity-50 pe-none': disabled })}>
        <Nouislider
          range={{ min, max }}
          start={sliderValue}
          step={step}
          disabled={disabled}
          connect
          tooltips={showTooltip}
          onUpdate={(_renderValues: string[], _handle: number, unencodedValues: number[]) => {
            onChange([Number(unencodedValues[0]), Number(unencodedValues[1])])
          }}
        />
      </div>
      {showMinMaxLabels ? (
        <div className="d-flex justify-content-between small text-muted">
          <span>
            {prefix}
            {value[0]}
          </span>
          <span>
            {value[1]}
            {suffix}
          </span>
        </div>
      ) : null}
    </FilterSection>
  )
}

export type FilterClearButtonProps = {
  onClick: () => void
  label?: string
  disabled?: boolean
  className?: string
}

export const FilterClearButton = ({ onClick, label = 'Clear all', disabled, className }: FilterClearButtonProps) => {
  return (
    <Button type="button" variant="outline-light" className={clsx('border-white border-opacity-10 icons-center gap-1', className)} disabled={disabled} onClick={onClick}>
      <X size={14} />
      <span>{label}</span>
    </Button>
  )
}

export default FilterPanel
