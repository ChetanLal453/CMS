'use client'

import React, { useState } from 'react'
import type { PublicBlockProps } from '../PublicBlocks/shared'
import type { FilterOption, FilterViewModel } from '../../../../../shared/blocks/filter'
import { reportCmsBoundaryViolation } from '../../../lib/cmsBoundary'

function optionalString(value: string | undefined) {
  return value === '' || value === undefined ? undefined : value
}

type FilterRendererProps = PublicBlockProps & {
  __sharedViewModel?: FilterViewModel
}

function FilterInner({ viewModel }: { viewModel: FilterViewModel }) {
  const filterType = viewModel.resolvedFilterType
  const options = viewModel.normalizedOptions
  const [value, setValue] = useState(viewModel.effectiveValue)

  const updateValue = (nextValue: FilterViewModel['effectiveValue']) => {
    setValue(nextValue)
    viewModel.onChange?.(nextValue)
    viewModel.onStateChange?.({ [viewModel.filterKey]: nextValue })
  }

  const clearAllFilters = () => {
    setValue(viewModel.emptyValue)
    viewModel.onChange?.(viewModel.emptyValue)
    viewModel.onStateChange?.({})
  }

  const control = (() => {
    switch (filterType) {
      case 'toggle':
        return (
          <button
            type="button"
            onClick={() => updateValue(!Boolean(value))}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '999px',
              border: '1px solid #d1d5db',
              background: Boolean(value) ? '#111827' : '#ffffff',
              color: Boolean(value) ? '#ffffff' : '#111827',
            }}>
            {Boolean(value) ? viewModel.onLabel : viewModel.offLabel}
          </button>
        )
      case 'rangeSlider':
        const rangeValue = Array.isArray(value) ? value : (viewModel.emptyValue as [number, number])
        return (
          <input
            type="range"
            min={viewModel.rangeMin}
            max={viewModel.rangeMax}
            step={viewModel.step}
            value={Number(viewModel.rangeMode === 'single' ? rangeValue[1] : rangeValue[0])}
            onChange={(event) => {
              const nextNumber = Number(event.target.value)
              updateValue(viewModel.rangeMode === 'single' ? [nextNumber, nextNumber] : [nextNumber, Number(rangeValue[1])])
            }}
            style={{ width: '100%' }}
          />
        )
      case 'checkboxGroup':
      case 'multiselect':
      case 'tagChips':
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {options.map((option: FilterOption, index: number) => {
              const optionValue = option.value
              const optionLabel = option.label
              const currentValues: string[] = Array.isArray(value) ? (value as (string | number)[]).map(String) : []
              const selected = Array.isArray(value) ? currentValues.includes(optionValue) : value === optionValue
              return (
                <button
                  key={`${optionValue}-${index}`}
                  type="button"
                  onClick={() => {
                    if (Array.isArray(value)) {
                      const nextValues: string[] = selected
                        ? currentValues.filter((item) => item !== optionValue)
                        : [...currentValues, optionValue]
                      updateValue(nextValues)
                      return
                    }

                    updateValue(selected ? '' : optionValue)
                  }}
                  disabled={Boolean(option.disabled)}
                  style={{
                    border: '1px solid #d1d5db',
                    borderRadius: '999px',
                    padding: '8px 12px',
                    background: selected ? '#111827' : '#ffffff',
                    color: selected ? '#ffffff' : '#111827',
                  }}>
                  {optionLabel}
                </button>
              )
            })}
          </div>
        )
      case 'radioGroup':
        return (
          <div style={{ display: 'grid', gap: '8px' }}>
            {options.map((option: FilterOption, index: number) => {
              const optionValue = option.value
              const optionLabel = option.label
              return (
                <label key={`${optionValue}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="radio" checked={value === optionValue} onChange={() => updateValue(optionValue)} disabled={Boolean(option.disabled)} />
                  <span>{optionLabel}</span>
                </label>
              )
            })}
          </div>
        )
      case 'clearAll':
        return (
          <button
            type="button"
            onClick={clearAllFilters}
            style={{
              border: '1px solid #d1d5db',
              borderRadius: '999px',
              padding: '10px 14px',
              background: '#ffffff',
              color: '#111827',
            }}>
            {viewModel.applyButtonLabel}
          </button>
        )
      case 'dropdown':
      case 'sortDropdown':
        return (
          <select
            value={String(value)}
            onChange={(event) => updateValue(event.target.value)}
            style={{
              width: viewModel.fullWidth ? '100%' : 'auto',
              minWidth: '220px',
              border: '1px solid #d1d5db',
              borderRadius: '12px',
              padding: '10px 12px',
              background: '#ffffff',
              color: '#111827',
            }}>
            <option value="">{viewModel.placeholder}</option>
            {options.map((option: FilterOption, index: number) => {
              const optionValue = option.value
              const optionLabel = option.label
              return (
                <option key={`${optionValue}-${index}`} value={optionValue} disabled={Boolean(option.disabled)}>
                  {optionLabel}
                </option>
              )
            })}
          </select>
        )
      case 'searchInput':
      default:
        return (
          <input
            type="search"
            value={String(value)}
            onChange={(event) => updateValue(event.target.value)}
            style={{
              width: viewModel.fullWidth ? '100%' : 'auto',
              minWidth: '220px',
              border: '1px solid #d1d5db',
              borderRadius: '12px',
              padding: '10px 12px',
              background: '#ffffff',
              color: '#111827',
            }}
          />
        )
    }
  })()

  return (
    <div
      className={optionalString(viewModel.className)}
      style={{
        display: 'grid',
        gap: '12px',
        padding: viewModel.padding,
        border: '1px solid #e5e7eb',
        borderRadius: '14px',
        background: viewModel.backgroundColor,
      }}>
      {viewModel.sectionTitle ? <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{viewModel.sectionTitle}</div> : null}
      {viewModel.showLabel !== false && viewModel.label ? <div style={{ fontWeight: 600 }}>{viewModel.label}</div> : null}
      {viewModel.helpText ? <div style={{ fontSize: '14px', color: '#6b7280' }}>{viewModel.helpText}</div> : null}
      {control}
      {viewModel.showClearButton && filterType !== 'clearAll' ? (
        <button
          type="button"
          onClick={() => updateValue(viewModel.emptyValue)}
          style={{
            justifySelf: 'start',
            border: 'none',
            background: 'transparent',
            color: '#4b5563',
            textDecoration: 'underline',
            padding: 0,
          }}>
          {viewModel.applyButtonLabel}
        </button>
      ) : null}
    </div>
  )
}

export default function PublicFilter(props: FilterRendererProps) {
  const viewModel = props.__sharedViewModel ?? null

  if (!viewModel) {
    return reportCmsBoundaryViolation('filter', 'Missing required shared view model.')
  }

  return <FilterInner viewModel={viewModel} />
}
