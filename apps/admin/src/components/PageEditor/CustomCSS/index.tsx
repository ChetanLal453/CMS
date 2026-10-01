'use client'

import React, { useState } from 'react'
import { CSSEditor } from './CSSEditor'

interface CustomCSSProps {
  css: string
  onChange: (css: string) => void
  onClose?: () => void
}

export const CustomCSS: React.FC<CustomCSSProps> = ({
  css,
  onChange,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'presets'>('editor')

  const cssPresets = [
    {
      name: 'Box Shadow',
      css: `box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);`
    },
    {
      name: 'Text Shadow',
      css: `text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);`
    },
    {
      name: 'Gradient Background',
      css: `background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);`
    },
    {
      name: 'Border Radius',
      css: `border-radius: 12px;`
    },
    {
      name: 'Transition',
      css: `transition: all 0.3s ease;`
    },
    {
      name: 'Transform Scale',
      css: `transform: scale(1.05);`
    }
  ]

  const applyPreset = (presetCss: string) => {
    const newCss = css ? `${css}\n${presetCss}` : presetCss
    onChange(newCss)
  }

  return (
    <div className="w-96 bg-white border-l shadow-lg flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Custom CSS</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b bg-gray-50">
        {[
          { id: 'editor' as const, label: 'CSS Editor' },
          { id: 'presets' as const, label: 'Presets' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'editor' && (
          <CSSEditor
            value={css}
            onChange={onChange}
          />
        )}

        {activeTab === 'presets' && (
          <div className="p-4 overflow-y-auto h-full">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">CSS Presets</h4>
              <p className="text-xs text-gray-600 mb-4">
                Click on a preset to add it to your custom CSS.
              </p>

              {cssPresets.map((preset, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium text-gray-900">
                      {preset.name}
                    </h5>
                    <button
                      onClick={() => applyPreset(preset.css)}
                      className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <pre className="text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-x-auto">
                    {preset.css}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          Custom CSS is scoped to this component
        </div>
      </div>
    </div>
  )
}
