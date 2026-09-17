'use client'

import React from 'react'

interface BorderControlProps {
  border: Record<string, any>
  onChange: (property: string, value: any) => void
}

export const BorderControl: React.FC<BorderControlProps> = ({
  border,
  onChange
}) => {
  const borderStyles = [
    { value: 'none', label: 'None' },
    { value: 'solid', label: 'Solid' },
    { value: 'dashed', label: 'Dashed' },
    { value: 'dotted', label: 'Dotted' },
    { value: 'double', label: 'Double' },
    { value: 'groove', label: 'Groove' },
    { value: 'ridge', label: 'Ridge' },
    { value: 'inset', label: 'Inset' },
    { value: 'outset', label: 'Outset' }
  ]

  const borderSides = [
    { key: 'borderTopWidth', label: 'Top Width' },
    { key: 'borderRightWidth', label: 'Right Width' },
    { key: 'borderBottomWidth', label: 'Bottom Width' },
    { key: 'borderLeftWidth', label: 'Left Width' }
  ]

  const borderRadii = [
    { key: 'borderTopLeftRadius', label: 'Top Left' },
    { key: 'borderTopRightRadius', label: 'Top Right' },
    { key: 'borderBottomRightRadius', label: 'Bottom Right' },
    { key: 'borderBottomLeftRadius', label: 'Bottom Left' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Border Style
        </label>
        <select
          value={border.borderStyle || 'none'}
          onChange={(e) => onChange('borderStyle', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {borderStyles.map(style => (
            <option key={style.value} value={style.value}>
              {style.label}
            </option>
          ))}
        </select>
      </div>

      {border.borderStyle && border.borderStyle !== 'none' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Border Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={border.borderColor || '#000000'}
                onChange={(e) => onChange('borderColor', e.target.value)}
                className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={border.borderColor || '#000000'}
                onChange={(e) => onChange('borderColor', e.target.value)}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="#000000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Border Width
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">All Sides</label>
                <input
                  type="text"
                  value={border.borderWidth || '1px'}
                  onChange={(e) => onChange('borderWidth', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="1px"
                />
              </div>
              <div></div>
            </div>

            <div className="mt-2">
              <label className="block text-xs text-gray-600 mb-2">Individual Sides</label>
              <div className="grid grid-cols-2 gap-3">
                {borderSides.map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-xs text-gray-600 mb-1">{label}</label>
                    <input
                      type="text"
                      value={border[key] || '0px'}
                      onChange={(e) => onChange(key, e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="0px"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Border Radius
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">All Corners</label>
                <input
                  type="text"
                  value={border.borderRadius || '0px'}
                  onChange={(e) => onChange('borderRadius', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="0px"
                />
              </div>
              <div></div>
            </div>

            <div className="mt-2">
              <label className="block text-xs text-gray-600 mb-2">Individual Corners</label>
              <div className="grid grid-cols-2 gap-3">
                {borderRadii.map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-xs text-gray-600 mb-1">{label}</label>
                    <input
                      type="text"
                      value={border[key] || '0px'}
                      onChange={(e) => onChange(key, e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="0px"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
