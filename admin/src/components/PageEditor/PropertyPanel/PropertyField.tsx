'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'

interface PropertyFieldProps {
  propName: string
  config: any
  value: any
  onChange: (value: any) => void
}

const slugifyValue = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const normalizeOptionItem = (item: any, index: number) => {
  if (!item || typeof item !== 'object') {
    return {
      id: `option-${index}`,
      label: '',
      value: '',
      disabled: false,
      icon: '',
      badge: '',
      group: '',
    }
  }

  const label = String(item.label ?? '')
  const value = String(item.value ?? '')

  return {
    id: String(item.id ?? `option-${index}`),
    label,
    value,
    disabled: Boolean(item.disabled ?? item.isDisabled ?? false),
    icon: String(item.icon ?? ''),
    badge: String(item.badge ?? ''),
    group: String(item.group ?? ''),
  }
}

const OptionListField: React.FC<{
  propName: string
  config: any
  value: any
  onChange: (value: any) => void
}> = ({ propName, config, value, onChange }) => {
  const optionItems = Array.isArray(value) ? value.map((item: any, index: number) => normalizeOptionItem(item, index)) : []
  const [autoGenerateValue, setAutoGenerateValue] = useState(config.autoGenerateValue !== false)

  useEffect(() => {
    setAutoGenerateValue(config.autoGenerateValue !== false)
  }, [config.autoGenerateValue])

  const updateOptionItem = (index: number, field: string, nextValue: any) => {
    const nextItems = optionItems.map((item: any, itemIndex: number) => {
      if (itemIndex !== index) return item

      const updated = { ...item, [field]: nextValue }
      if (field === 'label' && autoGenerateValue) {
        const generated = slugifyValue(String(nextValue || ''))
        if (!updated.value || updated.value === slugifyValue(String(item.label || ''))) {
          updated.value = generated
        }
      }
      return updated
    })
    onChange(nextItems)
  }

  const addOptionItem = () => {
    const nextIndex = optionItems.length
    onChange([
      ...optionItems,
      {
        id: `option-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        label: `Option ${nextIndex + 1}`,
        value: slugifyValue(`Option ${nextIndex + 1}`),
        disabled: false,
        icon: '',
        badge: '',
        group: '',
      },
    ])
  }

  const removeOptionItem = (index: number) => {
    onChange(optionItems.filter((_: any, itemIndex: number) => itemIndex !== index))
  }

  const duplicateOptionItem = (index: number) => {
    const itemToCopy = optionItems[index]
    if (!itemToCopy) return
    const nextLabel = `${itemToCopy.label || 'Option'} (copy)`
    onChange([
      ...optionItems.slice(0, index + 1),
      {
        ...itemToCopy,
        id: `option-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        label: nextLabel,
        value: autoGenerateValue ? slugifyValue(nextLabel) : `${itemToCopy.value || 'option'}-copy`,
      },
      ...optionItems.slice(index + 1),
    ])
  }

  const moveOptionItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= optionItems.length || fromIndex === toIndex) return
    const nextItems = [...optionItems]
    const [movedItem] = nextItems.splice(fromIndex, 1)
    if (!movedItem) return
    nextItems.splice(toIndex, 0, movedItem)
    onChange(nextItems)
  }

  const handleDragStart = (index: number, event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(index))
  }

  const handleDrop = (index: number, event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const fromIndex = Number(event.dataTransfer.getData('text/plain'))
    if (Number.isFinite(fromIndex)) {
      moveOptionItem(fromIndex, index)
    }
  }

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <label className="text-sm font-medium text-gray-700">{config.label}</label>
          {config.description ? <div className="text-xs text-gray-500 mt-1">{config.description}</div> : null}
        </div>
        <span className="text-xs text-gray-500">{optionItems.length} options</span>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <input
          type="checkbox"
          id={`${propName}-auto-generate`}
          checked={autoGenerateValue}
          onChange={() => {
            const nextState = !autoGenerateValue
            setAutoGenerateValue(nextState)
            onChange(
              optionItems.map((item: any) => ({
                ...item,
                value: nextState ? slugifyValue(String(item.label || '')) : item.value,
              })),
            )
          }}
          className="h-4 w-4"
        />
        <label htmlFor={`${propName}-auto-generate`} className="text-xs text-gray-600">
          Auto-generate values from label
        </label>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {optionItems.map((item: any, index: number) => (
          <div
            key={item.id || `${propName}-${index}`}
            draggable
            onDragStart={(event) => handleDragStart(index, event)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => handleDrop(index, event)}
            className="border rounded-lg p-3 bg-white hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="cursor-grab select-none" title="Drag to reorder">
                  ⋮⋮
                </span>
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">{index + 1}</span>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => duplicateOptionItem(index)}
                  className="px-2 py-1 text-gray-500 hover:text-green-600 text-xs"
                  title="Duplicate option">
                  ⎘
                </button>
                <button
                  type="button"
                  onClick={() => removeOptionItem(index)}
                  className="px-2 py-1 text-red-500 hover:text-red-700 text-xs"
                  title="Delete option">
                  ×
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Label</label>
                <input
                  type="text"
                  value={item.label ?? ''}
                  onChange={(e) => updateOptionItem(index, 'label', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  placeholder="Option label"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Value</label>
                <input
                  type="text"
                  value={item.value ?? ''}
                  onChange={(e) => updateOptionItem(index, 'value', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  placeholder="Option value"
                />
                <button
                  type="button"
                  className="mt-1 text-xs text-blue-600 hover:text-blue-700"
                  onClick={() => updateOptionItem(index, 'value', slugifyValue(String(item.label || '')))}>
                  Use label as value
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Icon</label>
                <input
                  type="text"
                  value={item.icon ?? ''}
                  onChange={(e) => updateOptionItem(index, 'icon', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  placeholder="Optional icon"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Badge</label>
                <input
                  type="text"
                  value={item.badge ?? ''}
                  onChange={(e) => updateOptionItem(index, 'badge', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  placeholder="Optional badge"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Group</label>
                <input
                  type="text"
                  value={item.group ?? ''}
                  onChange={(e) => updateOptionItem(index, 'group', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  placeholder="Optional group"
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={Boolean(item.disabled)}
                    onChange={(e) => updateOptionItem(index, 'disabled', e.target.checked)}
                    className="h-4 w-4"
                  />
                  Disabled
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addOptionItem}
        className="w-full mt-3 px-4 py-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-blue-400 hover:text-blue-500 flex items-center justify-center gap-2">
        <span>+</span>
        <span>Add option</span>
      </button>
    </div>
  )
}

const AccordionItemsField: React.FC<{
  config: any
  value: any
  onChange: (value: any) => void
}> = ({ config, value, onChange }) => {
  const accordionItems = Array.isArray(value)
    ? value
    : [
        {
          id: '1',
          title: 'Frequently Asked Question 1',
          content: 'This is the detailed answer for the first question.',
          visible: true,
        },
        {
          id: '2',
          title: 'Frequently Asked Question 2',
          content: 'This is the detailed answer for the second question.',
          visible: true,
        },
      ]

  const updateAccordionItem = useCallback(
    (index: number, field: string, newValue: any) => {
      const newItems = [...accordionItems]
      if (newItems[index]?.[field] !== newValue) {
        newItems[index] = { ...newItems[index], [field]: newValue }
        onChange(newItems)
      }
    },
    [accordionItems, onChange],
  )

  const addAccordionItem = useCallback(() => {
    const newItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: 'New Question',
      content: 'Answer goes here...',
      visible: true,
    }
    onChange([...accordionItems, newItem])
  }, [accordionItems, onChange])

  const removeAccordionItem = useCallback(
    (index: number) => {
      const newItems = accordionItems.filter((_: any, i: number) => i !== index)
      onChange(newItems)
    },
    [accordionItems, onChange],
  )

  const moveAccordionItem = useCallback(
    (index: number, direction: 'up' | 'down') => {
      const newItems = [...accordionItems]
      if (direction === 'up' && index > 0) {
        ;[newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]]
      } else if (direction === 'down' && index < newItems.length - 1) {
        ;[newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]]
      }
      onChange(newItems)
    },
    [accordionItems, onChange],
  )

  const [debouncedInputs, setDebouncedInputs] = useState<{ [key: string]: string }>({})
  const debounceTimeoutRef = useRef<NodeJS.Timeout>()

  const handleTitleChange = useCallback(
    (index: number, newValue: string) => {
      setDebouncedInputs((prev) => ({
        ...prev,
        [`title-${index}`]: newValue,
      }))

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }

      debounceTimeoutRef.current = setTimeout(() => {
        updateAccordionItem(index, 'title', newValue)
      }, 500)
    },
    [updateAccordionItem],
  )

  const handleContentChange = useCallback(
    (index: number, newValue: string) => {
      setDebouncedInputs((prev) => ({
        ...prev,
        [`content-${index}`]: newValue,
      }))

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }

      debounceTimeoutRef.current = setTimeout(() => {
        updateAccordionItem(index, 'content', newValue)
      }, 500)
    },
    [updateAccordionItem],
  )

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-3">{config.label}</label>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {accordionItems.map((item: any, index: number) => (
          <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 text-sm">Question {index + 1}</h4>
              <div className="flex gap-1">
                <button
                  onClick={() => moveAccordionItem(index, 'up')}
                  disabled={index === 0}
                  className="px-2 py-1 text-gray-500 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                  title="Move up">
                  ↑
                </button>
                <button
                  onClick={() => moveAccordionItem(index, 'down')}
                  disabled={index === accordionItems.length - 1}
                  className="px-2 py-1 text-gray-500 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                  title="Move down">
                  ↓
                </button>
                <button
                  onClick={() => removeAccordionItem(index)}
                  className="px-2 py-1 text-red-500 hover:text-red-700 text-xs"
                  title="Remove question">
                  ×
                </button>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Question</label>
              <input
                type="text"
                value={debouncedInputs[`title-${index}`] !== undefined ? debouncedInputs[`title-${index}`] : item.title}
                onChange={(e) => handleTitleChange(index, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Enter question..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Answer</label>
              <textarea
                value={debouncedInputs[`content-${index}`] !== undefined ? debouncedInputs[`content-${index}`] : item.content}
                onChange={(e) => handleContentChange(index, e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Enter answer..."
              />
            </div>

            <div className="mt-2 flex items-center">
              <input
                type="checkbox"
                id={`visible-${item.id}`}
                checked={item.visible !== false}
                onChange={(e) => updateAccordionItem(index, 'visible', e.target.checked)}
                className="mr-2 h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={`visible-${item.id}`} className="text-xs text-gray-700">
                Visible
              </label>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addAccordionItem}
        className="w-full mt-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors duration-200 flex items-center justify-center gap-2">
        <span className="text-lg">+</span>
        <span>Add New Question</span>
      </button>

      <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
        <span>Total questions: {accordionItems.length}</span>
        <span>Visible: {accordionItems.filter((item: any) => item.visible !== false).length}</span>
      </div>
    </div>
  )
}

const ActionField: React.FC<{
  propName: string
  config: any
  value: any
  onChange: (value: any) => void
}> = ({ propName, config, value, onChange }) => {
  const parseAction = (val: any) => {
    if (!val) {
      return { type: 'url', url: '', openInNewTab: false, phone: '', email: '', anchor: '', pageSlug: '' }
    }
    if (typeof val === 'string') {
      const raw = val.trim()
      if (/^tel:/i.test(raw)) {
        return { type: 'phone', phone: raw.replace(/^tel:/i, ''), email: '', anchor: '', pageSlug: '', url: '', openInNewTab: false }
      }
      if (/^mailto:/i.test(raw)) {
        return { type: 'email', email: raw.replace(/^mailto:/i, ''), phone: '', anchor: '', pageSlug: '', url: '', openInNewTab: false }
      }
      if (raw.startsWith('#')) {
        return { type: 'anchor', anchor: raw.replace(/^#/, ''), phone: '', email: '', pageSlug: '', url: '', openInNewTab: false }
      }
      if (raw.startsWith('/')) {
        return { type: 'page', pageSlug: raw.replace(/^\//, ''), phone: '', email: '', anchor: '', url: '', openInNewTab: false }
      }
      return { type: 'url', url: raw, openInNewTab: false, phone: '', email: '', anchor: '', pageSlug: '' }
    }
    if (typeof val === 'object') {
      return {
        type: val.type || (val.phone ? 'phone' : val.email ? 'email' : val.anchor ? 'anchor' : val.pageSlug ? 'page' : 'url'),
        url: val.url || '',
        pageSlug: val.pageSlug || '',
        anchor: val.anchor || '',
        phone: val.phone || '',
        email: val.email || '',
        openInNewTab: Boolean(val.openInNewTab),
      }
    }
    return { type: 'url', url: '', openInNewTab: false, phone: '', email: '', anchor: '', pageSlug: '' }
  }

  const [parsed, setParsed] = useState(() => parseAction(value))

  useEffect(() => {
    setParsed(parseAction(value))
  }, [value])

  const emitChange = (data: typeof parsed) => {
    const payload: Record<string, any> = { type: data.type }
    if (data.type === 'phone') {
      payload.phone = data.phone
    } else if (data.type === 'email') {
      payload.email = data.email
    } else if (data.type === 'anchor') {
      payload.anchor = data.anchor
    } else if (data.type === 'page') {
      payload.pageSlug = data.pageSlug
    } else {
      payload.url = data.url
      payload.openInNewTab = Boolean(data.openInNewTab)
    }
    onChange(payload)
  }

  const handleTypeChange = (newType: string) => {
    const updated = { ...parsed, type: newType }
    setParsed(updated)
    emitChange(updated)
  }

  const handleFieldChange = (field: string, val: any) => {
    const updated = { ...parsed, [field]: val }
    setParsed(updated)
    emitChange(updated)
  }

  return (
    <div className="rp-field frow" style={{ display: 'grid', gap: 8 }}>
      <label className="flbl">{config.label || 'Action / Link'}</label>
      <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 8 }}>
        <select
          value={parsed.type}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="rp-select fsel text-xs">
          <option value="url">URL</option>
          <option value="page">Page</option>
          <option value="anchor">Anchor</option>
          <option value="phone">Phone</option>
          <option value="email">Email</option>
        </select>

        {parsed.type === 'phone' ? (
          <input
            type="tel"
            className="rp-input fi"
            value={parsed.phone}
            placeholder="+1 (800) 555-0199"
            onChange={(e) => handleFieldChange('phone', e.target.value)}
          />
        ) : parsed.type === 'email' ? (
          <input
            type="email"
            className="rp-input fi"
            value={parsed.email}
            placeholder="info@example.com"
            onChange={(e) => handleFieldChange('email', e.target.value)}
          />
        ) : parsed.type === 'anchor' ? (
          <input
            type="text"
            className="rp-input fi"
            value={parsed.anchor}
            placeholder="section-id (e.g. contact)"
            onChange={(e) => handleFieldChange('anchor', e.target.value)}
          />
        ) : parsed.type === 'page' ? (
          <input
            type="text"
            className="rp-input fi"
            value={parsed.pageSlug}
            placeholder="about-us or services/hvac"
            onChange={(e) => handleFieldChange('pageSlug', e.target.value)}
          />
        ) : (
          <input
            type="text"
            className="rp-input fi"
            value={parsed.url}
            placeholder="https://example.com"
            onChange={(e) => handleFieldChange('url', e.target.value)}
          />
        )}
      </div>

      {parsed.type === 'url' ? (
        <label className="toggle-row" style={{ marginTop: 2 }}>
          <input
            type="checkbox"
            checked={Boolean(parsed.openInNewTab)}
            onChange={(e) => handleFieldChange('openInNewTab', e.target.checked)}
            className="toggleinp"
          />
          <span className="flbl !mb-0 text-xs">Open in New Tab</span>
        </label>
      ) : null}
    </div>
  )
}

export const PropertyField: React.FC<PropertyFieldProps> = function PropertyField({ propName, config, value, onChange }) {
  const [localValue, setLocalValue] = useState(value ?? '')
  const timeoutRef = useRef<NodeJS.Timeout>()
  const isFocusedRef = useRef(false)
  const lastEmittedValueRef = useRef<any>(value)

  const getColorInputValue = (input: unknown) => {
    const normalized = String(input ?? '').trim()
    return /^#[0-9a-fA-F]{6}$/.test(normalized) ? normalized : '#000000'
  }

  // Update local value when prop changes from parent, but NEVER overwrite when user is actively focused/typing
  useEffect(() => {
    if (!isFocusedRef.current) {
      setLocalValue(value ?? '')
      lastEmittedValueRef.current = value
    }
  }, [value])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleFocus = useCallback(() => {
    isFocusedRef.current = true
  }, [])

  const handleBlur = useCallback(() => {
    isFocusedRef.current = false
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = undefined
    }
    if (localValue !== lastEmittedValueRef.current) {
      lastEmittedValueRef.current = localValue
      onChange(localValue)
    }
  }, [localValue, onChange])

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.target.value
      setLocalValue(newValue)

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        lastEmittedValueRef.current = newValue
        onChange(newValue)
      }, 400)
    },
    [onChange],
  )

  const handleImmediateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    onChange(e.target.value)
  }

  const normalizeSelectValue = (val: any) => {
    return Array.isArray(val) ? val[0] ?? '' : val ?? ''
  }

  switch (config.type) {
    case 'action':
      return <ActionField propName={propName} config={config} value={value} onChange={onChange} />

    case 'text':
      return (
        <div className="rp-field frow">
          <label className="flbl">{config.label}</label>
          <input
            type="text"
            value={localValue}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleTextChange}
            className="rp-input fi"
            placeholder={config.placeholder}
          />
        </div>
      )

    case 'textarea':
      return (
        <div className="rp-field frow">
          <label className="flbl">{config.label}</label>
          <textarea
            value={localValue}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleTextChange}
            rows={4}
            className="rp-input ta"
            placeholder={config.placeholder}
          />
        </div>
      )

    case 'richtext':
      return (
        <div className="rp-field frow">
          <label className="flbl">{config.label}</label>
          <textarea
            value={localValue}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleTextChange}
            rows={6}
            className="rp-input ta"
            placeholder={config.placeholder || 'Write content here'}
          />
        </div>
      )

    case 'select':
      const selectValue = normalizeSelectValue(value)
      return (
        <div className="rp-field frow">
          <label className="flbl">{config.label}</label>
          <select value={selectValue} onChange={handleImmediateChange} className="rp-select fsel">
            {config.options?.map((option: string | { value: string; label: string }) => {
              const optionValue = typeof option === 'string' ? option : option.value
              const optionLabel = typeof option === 'string' ? option : option.label
              return (
                <option key={optionValue} value={optionValue}>
                  {optionLabel}
                </option>
              )
            })}
          </select>
        </div>
      )

    case 'color': {
      const palette = ['#7c6dfa', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#ffffff', '#94a3b8', '#1e293b', '#0f172a']
      return (
        <div className="rp-field frow">
          <label className="flbl">{config.label}</label>
          <div className="color-row">
            <input type="color" value={getColorInputValue(value)} onChange={handleImmediateChange} className="colorinp" />
            <input type="text" value={value ?? '#000000'} onChange={handleImmediateChange} className="rp-input fi" />
          </div>
          <div className="color-quick-swatches" style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
            {palette.map((swatch) => (
              <button
                key={swatch}
                type="button"
                onClick={() => onChange(swatch)}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  backgroundColor: swatch,
                  border: value === swatch ? '2px solid #7c6dfa' : '1px solid rgba(255,255,255,0.12)',
                  cursor: 'pointer',
                  padding: 0,
                  outline: 'none',
                }}
                title={swatch}
              />
            ))}
          </div>
        </div>
      )
    }

    case 'number':
      return (
        <div className="rp-field frow">
          <label className="flbl">{config.label}</label>
          <input
            type="number"
            value={localValue}
            onFocus={handleFocus}
            onBlur={() => {
              isFocusedRef.current = false
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
                timeoutRef.current = undefined
              }
              const parsed = localValue === '' ? '' : Number(localValue)
              const finalVal = Number.isNaN(parsed) ? localValue : parsed
              if (finalVal !== lastEmittedValueRef.current) {
                lastEmittedValueRef.current = finalVal
                onChange(finalVal)
              }
            }}
            onChange={(e) => {
              const val = e.target.value
              setLocalValue(val)
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
              }
              timeoutRef.current = setTimeout(() => {
                if (val === '') {
                  lastEmittedValueRef.current = ''
                  onChange('')
                } else {
                  const parsed = Number(val)
                  const finalVal = Number.isNaN(parsed) ? val : parsed
                  lastEmittedValueRef.current = finalVal
                  onChange(finalVal)
                }
              }, 400)
            }}
            min={config.min}
            max={config.max}
            step={config.step}
            className="rp-input fi"
          />
        </div>
      )

    case 'range':
      return (
        <div className="rp-field frow">
          <label className="flbl">{config.label}</label>
          <div className="range-row">
            <input
              type="range"
              value={value ?? config.default ?? 0}
              onChange={handleImmediateChange}
              min={config.min}
              max={config.max}
              step={config.step}
              className="slider rangeinp"
            />
            <span className="rangeval">{value ?? config.default ?? 0}</span>
          </div>
        </div>
      )

    case 'toggle':
      return (
        <div className="frow">
          <label className="toggle-row">
            <input type="checkbox" checked={value || false} onChange={(e) => onChange(e.target.checked)} className="toggleinp" />
            <span className="flbl !mb-0">{config.label}</span>
          </label>
        </div>
      )

    case 'option-list':
      return <OptionListField propName={propName} config={config} value={value} onChange={onChange} />

    case 'list-items':
      // ✅ FIXED: Declare listItems FIRST at the top
      const listItems = Array.isArray(value) ? value : []

      // ✅ Now define functions that use listItems
      const updateListItem = (index: number, field: string, newValue: any) => {
        const newList = [...listItems]
        newList[index] = { ...newList[index], [field]: newValue }
        onChange(newList)
      }

      const addListItem = () => {
        const newItem = {
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: 'New List Item',
          description: 'Description goes here...',
          visible: true,
          iconType: 'emoji',
          iconEmoji: '⭐',
          iconImage: '',
          iconFontAwesome: 'fas fa-star',
          iconNumber: listItems.length + 1,
          order: listItems.length + 1,
        }
        onChange([...listItems, newItem])
      }

      const removeListItem = (index: number) => {
        const newList = listItems.filter((_: any, i: number) => i !== index)
        const reorderedList = newList.map((item: any, idx: number) => ({
          ...item,
          order: idx + 1,
          iconNumber: idx + 1,
        }))
        onChange(reorderedList)
      }

      const moveListItem = (index: number, direction: 'up' | 'down') => {
        const newList = [...listItems]
        if (direction === 'up' && index > 0) {
          ;[newList[index], newList[index - 1]] = [newList[index - 1], newList[index]]
        } else if (direction === 'down' && index < newList.length - 1) {
          ;[newList[index], newList[index + 1]] = [newList[index + 1], newList[index]]
        }

        const reorderedList = newList.map((item: any, idx: number) => ({
          ...item,
          order: idx + 1,
          iconNumber: idx + 1,
        }))
        onChange(reorderedList)
      }

      const duplicateListItem = (index: number) => {
        const itemToDuplicate = listItems[index]
        const duplicatedItem = {
          ...itemToDuplicate,
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: `${itemToDuplicate.title} (copy)`,
          order: listItems.length + 1,
          iconNumber: listItems.length + 1,
        }
        const newList = [...listItems, duplicatedItem]
        onChange(newList)
      }

      const getIconPreview = (item: any) => {
        switch (item.iconType) {
          case 'image':
            // ✅ FIXED: Show only a placeholder, NOT the actual image
            return <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center text-xs">🖼️</div>
          case 'fontawesome':
            return item.iconFontAwesome ? (
              <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded flex items-center justify-center">
                <i className={item.iconFontAwesome}></i>
              </div>
            ) : (
              <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center text-xs">
                <i className="fas fa-question"></i>
              </div>
            )
          case 'number':
            return (
              <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">
                {item.iconNumber || '1'}
              </div>
            )
          case 'emoji':
          default:
            return <div className="w-6 h-6 text-lg flex items-center justify-center">{item.iconEmoji || '⭐'}</div>
        }
      }

      return (
        <div className="mb-4">
          {/* SIMPLIFIED HEADER */}
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">List Items</label>
            <span className="text-xs text-gray-500">{listItems.length} items</span>
          </div>

          {/* LIST ITEMS */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {listItems
              .sort((a: any, b: any) => a.order - b.order)
              .map((item: any, index: number) => (
                <div key={item.id} className={`border rounded-lg p-4 ${item.visible === false ? 'bg-gray-50 opacity-60' : 'bg-white'}`}>
                  {/* Item Header with Controls */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getIconPreview(item)}
                      <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{item.order}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => moveListItem(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-500 hover:text-blue-500 disabled:opacity-30"
                          title="Move up">
                          ↑
                        </button>
                        <button
                          onClick={() => moveListItem(index, 'down')}
                          disabled={index === listItems.length - 1}
                          className="p-1 text-gray-500 hover:text-blue-500 disabled:opacity-30"
                          title="Move down">
                          ↓
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => duplicateListItem(index)} className="p-1 text-gray-500 hover:text-green-600" title="Duplicate">
                        ⎘
                      </button>
                      <button onClick={() => removeListItem(index)} className="p-1 text-red-500 hover:text-red-700" title="Remove">
                        ×
                      </button>
                    </div>
                  </div>

                  {/* Icon Selection - COMPACT LAYOUT */}
                  {/* Icon Selection - CLEAN VERSION */}
                  <div className="mb-3">
                    {/* Clean header with only icon type selection */}
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs font-medium text-gray-700">Icon Type</span>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <button
                            onClick={() => updateListItem(index, 'iconType', 'emoji')}
                            className={`px-2 py-1.5 border rounded flex items-center justify-center gap-1 text-xs ${
                              item.iconType === 'emoji' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:bg-gray-50'
                            }`}>
                            <span>😀</span>
                            <span>Emoji</span>
                          </button>

                          <button
                            onClick={() => updateListItem(index, 'iconType', 'image')}
                            className={`px-2 py-1.5 border rounded flex items-center justify-center gap-1 text-xs ${
                              item.iconType === 'image' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:bg-gray-50'
                            }`}>
                            <span>🖼️</span>
                            <span>Image</span>
                          </button>

                          <button
                            onClick={() => updateListItem(index, 'iconType', 'fontawesome')}
                            className={`px-2 py-1.5 border rounded flex items-center justify-center gap-1 text-xs ${
                              item.iconType === 'fontawesome' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:bg-gray-50'
                            }`}>
                            <i className="fas fa-font-awesome text-xs"></i>
                            <span>Icon</span>
                          </button>

                          <button
                            onClick={() => updateListItem(index, 'iconType', 'number')}
                            className={`px-2 py-1.5 border rounded flex items-center justify-center gap-1 text-xs ${
                              item.iconType === 'number' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:bg-gray-50'
                            }`}>
                            <span>1️⃣</span>
                            <span>Number</span>
                          </button>
                        </div>
                      </div>

                      {/* Dynamic Input Fields */}
                      <div>
                        {item.iconType === 'emoji' && (
                          <div>
                            <span className="text-xs text-gray-600 mb-1 block">Emoji</span>
                            <input
                              type="text"
                              value={item.iconEmoji || ''}
                              onChange={(e) => updateListItem(index, 'iconEmoji', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-center text-lg"
                              placeholder="Enter emoji"
                              maxLength={2}
                            />
                          </div>
                        )}

                        {item.iconType === 'image' && (
                          <div>
                            <span className="text-xs text-gray-600 mb-1 block">Image</span>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={item.iconImage || ''}
                                onChange={(e) => updateListItem(index, 'iconImage', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="Enter image URL"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const input = document.createElement('input')
                                  input.type = 'file'
                                  input.accept = 'image/*'
                                  input.onchange = (e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0]
                                    if (file) {
                                      const reader = new FileReader()
                                      reader.onload = (event) => {
                                        updateListItem(index, 'iconImage', event.target?.result as string)
                                      }
                                      reader.readAsDataURL(file)
                                    }
                                  }
                                  input.click()
                                }}
                                className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm">
                                Upload
                              </button>
                            </div>
                          </div>
                        )}

                        {item.iconType === 'fontawesome' && (
                          <div>
                            <span className="text-xs text-gray-600 mb-1 block">FontAwesome Icon</span>
                            <input
                              type="text"
                              value={item.iconFontAwesome || ''}
                              onChange={(e) => updateListItem(index, 'iconFontAwesome', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              placeholder="fas fa-heart, fab fa-twitter, etc."
                            />
                          </div>
                        )}

                        {item.iconType === 'number' && (
                          <div>
                            <span className="text-xs text-gray-600 mb-1 block">Number</span>
                            <input
                              type="number"
                              value={item.iconNumber || index + 1}
                              onChange={(e) => updateListItem(index, 'iconNumber', parseInt(e.target.value) || 1)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-center"
                              min="1"
                              max="100"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Title Input */}
                  <div className="mb-3">
                    <label className="block text-xs text-gray-600 mb-1">
                      Title <span className="text-gray-400">({(item.title || '').length}/160)</span>
                    </label>
                    <input
                      type="text"
                      value={item.title || ''}
                      onChange={(e) => updateListItem(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                      placeholder="Item title"
                      maxLength={160}
                    />
                  </div>

                  {/* Description Input */}
                  <div className="mb-3">
                    <label className="block text-xs text-gray-600 mb-1">
                      Description <span className="text-gray-400">({(item.description || '').length}/200)</span>
                    </label>
                    <textarea
                      value={item.description || ''}
                      onChange={(e) => updateListItem(index, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 resize-none"
                      placeholder="Item description"
                      maxLength={200}
                    />
                  </div>

                  {/* Visibility Toggle */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`visible-${item.id}`}
                      checked={item.visible !== false}
                      onChange={(e) => updateListItem(index, 'visible', e.target.checked)}
                      className="mr-2 h-4 w-4 text-blue-600"
                    />
                    <label htmlFor={`visible-${item.id}`} className="text-xs text-gray-700">
                      Visible
                    </label>
                  </div>
                </div>
              ))}
          </div>

          {/* Add Item Button */}
          <button
            onClick={addListItem}
            className="w-full mt-3 px-4 py-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-blue-400 hover:text-blue-500 flex items-center justify-center gap-2">
            <span>+</span>
            <span>Add Item</span>
          </button>

          {/* Simple Footer */}
          <div className="mt-3 text-xs text-gray-500 flex justify-between">
            <span>Total: {listItems.length}</span>
            <span>Visible: {listItems.filter((item: any) => item.visible !== false).length}</span>
            <button
              onClick={() => {
                const newItems = listItems.map((item: any, idx: number) => ({
                  ...item,
                  iconType: 'number',
                  iconNumber: idx + 1,
                  iconImage: '',
                  iconEmoji: '',
                  iconFontAwesome: '',
                }))
                onChange(newItems)
              }}
              className="text-blue-500 hover:text-blue-700"
              title="Number all items">
              Number All
            </button>
          </div>
        </div>
      )

    case 'accordion-items':
      return <AccordionItemsField config={config} value={value} onChange={onChange} />

    case 'carousel-slides':
      const slides = Array.isArray(value) ? value : []

      const addCarouselSlide = () => {
        const newSlide = {
          id: `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          components: [],
        }
        onChange([...slides, newSlide])
      }

      const removeCarouselSlide = (index: number) => {
        if (slides.length <= 1) return
        const newSlides = slides.filter((_: any, i: number) => i !== index)
        onChange(newSlides)
      }

      const moveCarouselSlide = (index: number, direction: 'up' | 'down') => {
        const newSlides = [...slides]
        if (direction === 'up' && index > 0) {
          ;[newSlides[index], newSlides[index - 1]] = [newSlides[index - 1], newSlides[index]]
        } else if (direction === 'down' && index < newSlides.length - 1) {
          ;[newSlides[index], newSlides[index + 1]] = [newSlides[index + 1], newSlides[index]]
        }
        onChange(newSlides)
      }

      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">{config.label}</label>
          <div className="space-y-3">
            {slides.map((slide: any, index: number) => (
              <div key={slide.id} className="border border-gray-200 rounded-lg p-3 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 text-sm">
                    Slide {index + 1}
                    <span className="text-xs text-gray-500 ml-2">({slide.components?.length || 0} components)</span>
                  </h4>
                  <div className="flex gap-1">
                    <button
                      onClick={() => moveCarouselSlide(index, 'up')}
                      disabled={index === 0}
                      className="px-2 py-1 text-gray-500 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                      title="Move up">
                      ↑
                    </button>
                    <button
                      onClick={() => moveCarouselSlide(index, 'down')}
                      disabled={index === slides.length - 1}
                      className="px-2 py-1 text-gray-500 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                      title="Move down">
                      ↓
                    </button>
                    <button
                      onClick={() => removeCarouselSlide(index)}
                      disabled={slides.length <= 1}
                      className="px-2 py-1 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                      title="Remove slide">
                      ×
                    </button>
                  </div>
                </div>

                {/* Slide preview showing empty drop zone or components */}
                <div className="min-h-[60px] border-2 border-dashed border-gray-200 rounded p-2 bg-gray-50">
                  {slide.components && slide.components.length > 0 ? (
                    <div className="space-y-1">
                      {slide.components.map((component: any, compIndex: number) => (
                        <div key={component.id} className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded text-xs">
                          <span className="text-gray-600">{component.type}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500 truncate flex-1">{component.label || 'Unnamed'}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 py-3">
                      <div className="text-lg mb-1">📦</div>
                      <div className="text-xs">Drop components here</div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={addCarouselSlide}
              className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors text-sm">
              + Add Slide Container
            </button>

            <div className="text-xs text-gray-500 mt-2">Each slide is a separate container where you can drag and drop components</div>
          </div>
        </div>
      )

    case 'image':
      return (
        <div className="frow">
          <label className="flbl">{config.label}</label>
          <div className="space-y-2">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={localValue}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={handleTextChange}
                className="fi flex-1 !min-w-0"
                placeholder="Image URL or upload"
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'image/*'
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = (event) => {
                        const dataUrl = event.target?.result as string
                        setLocalValue(dataUrl)
                        lastEmittedValueRef.current = dataUrl
                        onChange(dataUrl)
                      }
                      reader.readAsDataURL(file)
                    }
                  }
                  input.click()
                }}
                className="gbtn primary !py-1.5 !px-2.5 shrink-0 text-xs flex items-center gap-1"
                title="Upload image file">
                <span>📁 Upload</span>
              </button>
            </div>
            {value && String(value).startsWith('data:') && (
              <div className="note-ok !py-1 !px-2 text-[11px] flex items-center gap-1">
                <span>✓ File uploaded successfully</span>
              </div>
            )}
          </div>
        </div>
      )

    default:
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {config.label} ({config.type})
          </label>
          <input
            type="text"
            value={localValue}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleTextChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )
  }
}
