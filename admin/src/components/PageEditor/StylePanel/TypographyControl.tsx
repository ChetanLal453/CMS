'use client'

import React from 'react'

interface TypographyControlProps {
  typography: Record<string, any>
  onChange: (property: string, value: any) => void
}

export const TypographyControl: React.FC<TypographyControlProps> = ({
  typography,
  onChange
}) => {
  const fontFamilies = [
    'Arial, sans-serif',
    'Helvetica, sans-serif',
    'Georgia, serif',
    'Times New Roman, serif',
    'Courier New, monospace',
    'Verdana, sans-serif',
    'Tahoma, sans-serif',
    'Trebuchet MS, sans-serif'
  ]

  const fontWeights = [
    { value: 'normal', label: 'Normal' },
    { value: 'bold', label: 'Bold' },
    { value: '100', label: 'Thin' },
    { value: '200', label: 'Extra Light' },
    { value: '300', label: 'Light' },
    { value: '400', label: 'Regular' },
    { value: '500', label: 'Medium' },
    { value: '600', label: 'Semi Bold' },
    { value: '700', label: 'Bold' },
    { value: '800', label: 'Extra Bold' },
    { value: '900', label: 'Black' }
  ]

  const textAligns = [
    { value: 'left', label: 'Left', icon: '⬅' },
    { value: 'center', label: 'Center', icon: '⬌' },
    { value: 'right', label: 'Right', icon: '➡' },
    { value: 'justify', label: 'Justify', icon: '⬌' }
  ]

  const textTransforms = [
    { value: 'none', label: 'None' },
    { value: 'capitalize', label: 'Capitalize' },
    { value: 'uppercase', label: 'Uppercase' },
    { value: 'lowercase', label: 'Lowercase' }
  ]

  const textDecorations = [
    { value: 'none', label: 'None' },
    { value: 'underline', label: 'Underline' },
    { value: 'overline', label: 'Overline' },
    { value: 'line-through', label: 'Strikethrough' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Font Family
        </label>
        <select
          value={typography.fontFamily || 'Arial, sans-serif'}
          onChange={(e) => onChange('fontFamily', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {fontFamilies.map(font => (
            <option key={font} value={font}>
              {font.split(',')[0]}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Font Size
          </label>
          <input
            type="text"
            value={typography.fontSize || '16px'}
            onChange={(e) => onChange('fontSize', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="16px"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Font Weight
          </label>
          <select
            value={typography.fontWeight || 'normal'}
            onChange={(e) => onChange('fontWeight', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {fontWeights.map(weight => (
              <option key={weight.value} value={weight.value}>
                {weight.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Line Height
          </label>
          <input
            type="text"
            value={typography.lineHeight || '1.5'}
            onChange={(e) => onChange('lineHeight', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="1.5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Letter Spacing
          </label>
          <input
            type="text"
            value={typography.letterSpacing || '0px'}
            onChange={(e) => onChange('letterSpacing', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="0px"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Text Alignment
        </label>
        <div className="flex gap-2">
          {textAligns.map(align => (
            <button
              key={align.value}
              onClick={() => onChange('textAlign', align.value)}
              className={`flex-1 px-3 py-2 text-sm border rounded transition-colors ${
                typography.textAlign === align.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {align.icon} {align.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Text Transform
          </label>
          <select
            value={typography.textTransform || 'none'}
            onChange={(e) => onChange('textTransform', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {textTransforms.map(transform => (
              <option key={transform.value} value={transform.value}>
                {transform.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Text Decoration
          </label>
          <select
            value={typography.textDecoration || 'none'}
            onChange={(e) => onChange('textDecoration', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {textDecorations.map(decoration => (
              <option key={decoration.value} value={decoration.value}>
                {decoration.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
