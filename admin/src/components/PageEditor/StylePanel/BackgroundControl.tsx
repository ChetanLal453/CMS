'use client'

import React, { useState } from 'react'

interface BackgroundControlProps {
  background: Record<string, any>
  onChange: (property: string, value: any) => void
}

export const BackgroundControl: React.FC<BackgroundControlProps> = ({
  background,
  onChange
}) => {
  const [bgType, setBgType] = useState<'color' | 'gradient' | 'image' | 'pattern'>('color')

  const gradientTypes = [
    { value: 'linear', label: 'Linear' },
    { value: 'radial', label: 'Radial' },
    { value: 'conic', label: 'Conic' }
  ]

  const patterns = [
    { value: 'none', label: 'None' },
    { value: 'dots', label: 'Dots' },
    { value: 'stripes', label: 'Stripes' },
    { value: 'grid', label: 'Grid' },
    { value: 'diagonal', label: 'Diagonal' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Background Type
        </label>
        <div className="flex gap-2">
          {[
            { value: 'color', label: 'Color' },
            { value: 'gradient', label: 'Gradient' },
            { value: 'image', label: 'Image' },
            { value: 'pattern', label: 'Pattern' }
          ].map(type => (
            <button
              key={type.value}
              onClick={() => setBgType(type.value as any)}
              className={`flex-1 px-3 py-2 text-sm border rounded transition-colors ${
                bgType === type.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {bgType === 'color' && (
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Background Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={background.backgroundColor || '#ffffff'}
              onChange={(e) => onChange('backgroundColor', e.target.value)}
              className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={background.backgroundColor || '#ffffff'}
              onChange={(e) => onChange('backgroundColor', e.target.value)}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="#ffffff"
            />
          </div>
        </div>
      )}

      {bgType === 'gradient' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Gradient Type
            </label>
            <select
              value={background.gradientType || 'linear'}
              onChange={(e) => onChange('gradientType', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {gradientTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Start Color
              </label>
              <input
                type="color"
                value={background.gradientStart || '#ffffff'}
                onChange={(e) => onChange('gradientStart', e.target.value)}
                className="w-full h-8 border border-gray-300 rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                End Color
              </label>
              <input
                type="color"
                value={background.gradientEnd || '#000000'}
                onChange={(e) => onChange('gradientEnd', e.target.value)}
                className="w-full h-8 border border-gray-300 rounded cursor-pointer"
              />
            </div>
          </div>

          {background.gradientType === 'linear' && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Direction (degrees)
              </label>
              <input
                type="number"
                min="0"
                max="360"
                value={background.gradientDirection || 0}
                onChange={(e) => onChange('gradientDirection', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
      )}

      {bgType === 'image' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Background Image URL
            </label>
            <input
              type="text"
              value={background.backgroundImage || ''}
              onChange={(e) => onChange('backgroundImage', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Size
              </label>
              <select
                value={background.backgroundSize || 'cover'}
                onChange={(e) => onChange('backgroundSize', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Position
              </label>
              <select
                value={background.backgroundPosition || 'center'}
                onChange={(e) => onChange('backgroundPosition', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="center">Center</option>
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Repeat
            </label>
            <select
              value={background.backgroundRepeat || 'no-repeat'}
              onChange={(e) => onChange('backgroundRepeat', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="no-repeat">No Repeat</option>
              <option value="repeat">Repeat</option>
              <option value="repeat-x">Repeat X</option>
              <option value="repeat-y">Repeat Y</option>
            </select>
          </div>
        </div>
      )}

      {bgType === 'pattern' && (
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Pattern
          </label>
          <select
            value={background.pattern || 'none'}
            onChange={(e) => onChange('pattern', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {patterns.map(pattern => (
              <option key={pattern.value} value={pattern.value}>
                {pattern.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Overlay
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={background.overlayColor || '#000000'}
            onChange={(e) => onChange('overlayColor', e.target.value)}
            className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
          />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={background.overlayOpacity || 0}
            onChange={(e) => onChange('overlayOpacity', parseFloat(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm text-gray-600 w-12">
            {Math.round((background.overlayOpacity || 0) * 100)}%
          </span>
        </div>
      </div>
    </div>
  )
}
