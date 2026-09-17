'use client'

import React from 'react'

interface SpacingControlProps {
  spacing: Record<string, any>
  onChange: (property: string, value: any) => void
}

export const SpacingControl: React.FC<SpacingControlProps> = ({
  spacing,
  onChange
}) => {
  const spacingProperties = [
    { key: 'marginTop', label: 'Top', icon: '↑' },
    { key: 'marginRight', label: 'Right', icon: '→' },
    { key: 'marginBottom', label: 'Bottom', icon: '↓' },
    { key: 'marginLeft', label: 'Left', icon: '←' }
  ]

  const paddingProperties = [
    { key: 'paddingTop', label: 'Top', icon: '↑' },
    { key: 'paddingRight', label: 'Right', icon: '→' },
    { key: 'paddingBottom', label: 'Bottom', icon: '↓' },
    { key: 'paddingLeft', label: 'Left', icon: '←' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Margin</h4>
        <div className="grid grid-cols-2 gap-3">
          {spacingProperties.map(({ key, label, icon }) => (
            <div key={key}>
              <label className="block text-xs text-gray-600 mb-1">
                {icon} {label}
              </label>
              <input
                type="text"
                value={spacing[key] || '0px'}
                onChange={(e) => onChange(key, e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="0px"
              />
            </div>
          ))}
        </div>
        <div className="mt-2">
          <label className="block text-xs text-gray-600 mb-1">All Sides</label>
          <input
            type="text"
            value={spacing.margin || '0px'}
            onChange={(e) => onChange('margin', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="0px"
          />
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Padding</h4>
        <div className="grid grid-cols-2 gap-3">
          {paddingProperties.map(({ key, label, icon }) => (
            <div key={key}>
              <label className="block text-xs text-gray-600 mb-1">
                {icon} {label}
              </label>
              <input
                type="text"
                value={spacing[key] || '0px'}
                onChange={(e) => onChange(key, e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="0px"
              />
            </div>
          ))}
        </div>
        <div className="mt-2">
          <label className="block text-xs text-gray-600 mb-1">All Sides</label>
          <input
            type="text"
            value={spacing.padding || '0px'}
            onChange={(e) => onChange('padding', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="0px"
          />
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Size</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Width</label>
            <input
              type="text"
              value={spacing.width || 'auto'}
              onChange={(e) => onChange('width', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="auto"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Height</label>
            <input
              type="text"
              value={spacing.height || 'auto'}
              onChange={(e) => onChange('height', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="auto"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
