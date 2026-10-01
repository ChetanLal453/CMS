'use client'

import React, { useState } from 'react'

interface BreakpointEditorProps {
  breakpoint: 'desktop' | 'tablet' | 'mobile'
  component?: any
  onUpdate?: (component: any) => void
}

export const BreakpointEditor: React.FC<BreakpointEditorProps> = ({
  breakpoint,
  component,
  onUpdate
}) => {
  const [settings, setSettings] = useState({
    display: 'block',
    width: 'auto',
    height: 'auto',
    margin: '0',
    padding: '0',
    fontSize: 'inherit',
    textAlign: 'left',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'stretch'
  })

  const handleSettingChange = (key: string, value: string) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)

    if (onUpdate && component) {
      const updatedComponent = {
        ...component,
        responsive: {
          ...component.responsive,
          [breakpoint]: newSettings
        }
      }
      onUpdate(updatedComponent)
    }
  }

  const displayOptions = [
    { value: 'block', label: 'Block' },
    { value: 'inline-block', label: 'Inline Block' },
    { value: 'flex', label: 'Flex' },
    { value: 'grid', label: 'Grid' },
    { value: 'none', label: 'Hidden' }
  ]

  const textAlignOptions = [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' },
    { value: 'justify', label: 'Justify' }
  ]

  const flexDirectionOptions = [
    { value: 'row', label: 'Horizontal' },
    { value: 'column', label: 'Vertical' }
  ]

  const justifyContentOptions = [
    { value: 'flex-start', label: 'Start' },
    { value: 'center', label: 'Center' },
    { value: 'flex-end', label: 'End' },
    { value: 'space-between', label: 'Space Between' },
    { value: 'space-around', label: 'Space Around' }
  ]

  const alignItemsOptions = [
    { value: 'stretch', label: 'Stretch' },
    { value: 'flex-start', label: 'Start' },
    { value: 'center', label: 'Center' },
    { value: 'flex-end', label: 'End' },
    { value: 'baseline', label: 'Baseline' }
  ]

  return (
    <div className="space-y-6">
      {/* Layout */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Layout</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Display
            </label>
            <select
              value={settings.display}
              onChange={(e) => handleSettingChange('display', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {displayOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Text Align
            </label>
            <select
              value={settings.textAlign}
              onChange={(e) => handleSettingChange('textAlign', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {textAlignOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Dimensions */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Dimensions</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Width
            </label>
            <input
              type="text"
              value={settings.width}
              onChange={(e) => handleSettingChange('width', e.target.value)}
              placeholder="auto, 100%, 300px"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Height
            </label>
            <input
              type="text"
              value={settings.height}
              onChange={(e) => handleSettingChange('height', e.target.value)}
              placeholder="auto, 100%, 200px"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Spacing */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Spacing</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Margin
            </label>
            <input
              type="text"
              value={settings.margin}
              onChange={(e) => handleSettingChange('margin', e.target.value)}
              placeholder="0, 10px, 1rem"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Padding
            </label>
            <input
              type="text"
              value={settings.padding}
              onChange={(e) => handleSettingChange('padding', e.target.value)}
              placeholder="0, 10px, 1rem"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Typography */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Typography</h4>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Font Size
          </label>
          <input
            type="text"
            value={settings.fontSize}
            onChange={(e) => handleSettingChange('fontSize', e.target.value)}
            placeholder="inherit, 16px, 1.2rem"
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Flexbox (if display is flex) */}
      {settings.display === 'flex' && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Flexbox</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Direction
              </label>
              <select
                value={settings.flexDirection}
                onChange={(e) => handleSettingChange('flexDirection', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {flexDirectionOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Justify Content
                </label>
                <select
                  value={settings.justifyContent}
                  onChange={(e) => handleSettingChange('justifyContent', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {justifyContentOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Align Items
                </label>
                <select
                  value={settings.alignItems}
                  onChange={(e) => handleSettingChange('alignItems', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {alignItemsOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visual Indicators */}
      <div className="bg-blue-50 border border-blue-200 rounded p-3">
        <div className="flex items-center">
          <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-blue-800">
            These settings apply only to {breakpoint} screens
          </span>
        </div>
      </div>
    </div>
  )
}

export default BreakpointEditor
