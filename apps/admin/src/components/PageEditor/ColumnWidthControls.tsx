'use client'

import React, { useState, useEffect } from 'react'
import { PageLayout } from '@/types/page-editor'

interface ColumnWidthControlsProps {
  sectionId: string
  rowId: string
  columnId: string
  layout: PageLayout
  onWidthChange: (sectionId: string, rowId: string, columnId: string, width: string) => void
  onClose?: () => void
}

export const ColumnWidthControls: React.FC<ColumnWidthControlsProps> = ({
  sectionId,
  rowId,
  columnId,
  layout,
  onWidthChange,
  onClose
}) => {
  const [currentWidth, setCurrentWidth] = useState<string>('1fr')
  const [customWidth, setCustomWidth] = useState<string>('')
  
  // Width presets
  const widthPresets = [
    { label: 'Auto', value: 'auto' },
    { label: 'Equal (1fr)', value: '1fr' },
    { label: '60% Width', value: '2fr' },
    { label: '70% Width', value: '3fr' },
    { label: '75% Width', value: '4fr' },
    { label: '80% Width', value: '5fr' },
    { label: 'Full Width', value: '100%' },
  ]

  // Find the column in layout
  const findColumn = () => {
    const section = layout.sections?.find(s => s.id === sectionId)
    if (section) {
      const row = section.container.rows?.find(r => r.id === rowId)
      if (row) {
        const column = row.columns?.find(c => c.id === columnId)
        return column
      }
    }
    return null
  }

  const column = findColumn()
  
  // Get column index
  const getColumnIndex = (): number => {
    const section = layout.sections?.find(s => s.id === sectionId)
    if (section) {
      const row = section.container.rows?.find(r => r.id === rowId)
      if (row && row.columns) {
        return row.columns.findIndex(c => c.id === columnId) + 1
      }
    }
    return 0
  }

  const columnIndex = getColumnIndex()
  const totalColumns = ((): number => {
    const section = layout.sections?.find(s => s.id === sectionId)
    if (section) {
      const row = section.container.rows?.find(r => r.id === rowId)
      return row?.columns?.length || 0
    }
    return 0
  })()

  // Initialize current width
  useEffect(() => {
    if (column?.width) {
      const width = column.width.toString() // ✅ Ensure it's string
      setCurrentWidth(width)
      setCustomWidth(width)
    } else {
      setCurrentWidth('1fr')
      setCustomWidth('')
    }
  }, [column])

  const handlePresetSelect = (width: string) => {
    setCurrentWidth(width)
    setCustomWidth('')
    onWidthChange(sectionId, rowId, columnId, width)
  }

  const handleCustomWidthApply = () => {
    if (customWidth.trim()) {
      setCurrentWidth(customWidth)
      onWidthChange(sectionId, rowId, columnId, customWidth.trim())
    }
  }

  return (
    <div className="space-y-6">
      {/* Column Info */}
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
        <div className="text-sm font-medium text-blue-900 mb-1">
          Column {columnIndex} of {totalColumns}
        </div>
        <div className="text-xs text-blue-700">
          Adjust width and layout properties
        </div>
        <div className="text-xs text-blue-600 mt-1 font-medium">
          Current: {currentWidth}
        </div>
      </div>

      {/* Preset Widths */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Quick Width Presets
        </label>
        <div className="grid grid-cols-2 gap-2">
          {widthPresets.map(preset => (
            <button
              key={preset.value}
              onClick={() => handlePresetSelect(preset.value)}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                currentWidth === preset.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Width */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Custom Width
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customWidth}
            onChange={(e) => setCustomWidth(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCustomWidthApply()
              }
            }}
            placeholder="e.g., 2fr, 30%, 250px"
            className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCustomWidthApply}
            className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
          >
            Apply
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Use <strong>fr</strong> for flexible columns, <strong>%</strong> for percentage, <strong>px</strong> for fixed width
        </p>
      </div>

      {/* Ratio Examples */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Common Column Ratios</h4>
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-16 h-6 bg-blue-200 rounded"></div>
            <span><strong>60-40:</strong> 2fr 1fr = 66% and 33%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-20 h-6 bg-blue-300 rounded"></div>
            <span><strong>70-30:</strong> 3fr 1fr = 75% and 25%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 h-6 bg-blue-400 rounded"></div>
            <span><strong>80-20:</strong> 4fr 1fr = 80% and 20%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-6 bg-blue-100 rounded"></div>
            <span><strong>50-50:</strong> 1fr 1fr = Equal columns</span>
          </div>
        </div>
      </div>
    </div>
  )
}