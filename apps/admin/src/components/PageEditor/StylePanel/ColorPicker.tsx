'use client'

import React, { useState } from 'react'

interface ColorPickerProps {
  colors: Record<string, any>
  onChange: (property: string, value: any) => void
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  colors,
  onChange
}) => {
  const [customColor, setCustomColor] = useState('#000000')

  const presetColors = [
    '#000000', '#ffffff', '#f3f4f6', '#6b7280', '#374151',
    '#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a',
    '#ef4444', '#dc2626', '#b91c1c', '#991b1b',
    '#10b981', '#059669', '#047857', '#065f46',
    '#f59e0b', '#d97706', '#b45309', '#92400e',
    '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6'
  ]

  const colorProperties = [
    { key: 'color', label: 'Text Color' },
    { key: 'backgroundColor', label: 'Background Color' },
    { key: 'borderColor', label: 'Border Color' },
    { key: 'boxShadow', label: 'Shadow Color' }
  ]

  return (
    <div className="space-y-6">
      {colorProperties.map(({ key, label }) => (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            {label}
          </label>

          <div className="flex items-center gap-2 mb-2">
            <input
              type="color"
              value={colors[key] || '#000000'}
              onChange={(e) => onChange(key, e.target.value)}
              className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={colors[key] || '#000000'}
              onChange={(e) => onChange(key, e.target.value)}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="#000000"
            />
          </div>

          <div className="grid grid-cols-8 gap-1">
            {presetColors.map(color => (
              <button
                key={color}
                onClick={() => onChange(key, color)}
                className={`w-6 h-6 rounded border-2 ${
                  colors[key] === color ? 'border-gray-800' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      ))}

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Opacity
        </label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={colors.opacity || 1}
            onChange={(e) => onChange('opacity', parseFloat(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm text-gray-600 w-12">
            {Math.round((colors.opacity || 1) * 100)}%
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Custom Color
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
          />
          <input
            type="text"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="#000000"
          />
          <button
            onClick={() => onChange('color', customColor)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
