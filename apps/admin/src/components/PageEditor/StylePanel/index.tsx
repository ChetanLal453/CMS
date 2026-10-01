'use client'

import React, { useState } from 'react'
import { SpacingControl } from './SpacingControl.tsx'
import { ColorPicker } from './ColorPicker.tsx'
import { TypographyControl } from './TypographyControl.tsx'
import { BackgroundControl } from './BackgroundControl.tsx'
import { BorderControl } from './BorderControl.tsx'
import { AnimationControl } from './AnimationControl.tsx'

interface StylePanelProps {
  styles: Record<string, any>
  onStyleChange: (property: string, value: any) => void
  onClose?: () => void
}

type StyleTab = 'spacing' | 'typography' | 'colors' | 'background' | 'border' | 'animation'

export const StylePanel: React.FC<StylePanelProps> = ({
  styles,
  onStyleChange,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<StyleTab>('spacing')

  const tabs = [
    { id: 'spacing' as StyleTab, label: 'Spacing', icon: '↔' },
    { id: 'typography' as StyleTab, label: 'Typography', icon: 'A' },
    { id: 'colors' as StyleTab, label: 'Colors', icon: '🎨' },
    { id: 'background' as StyleTab, label: 'Background', icon: '◼' },
    { id: 'border' as StyleTab, label: 'Border', icon: '▭' },
    { id: 'animation' as StyleTab, label: 'Animation', icon: '⚡' }
  ]

  return (
    <div className="w-80 bg-white border-l shadow-lg flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Advanced Styling</h3>
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
      <div className="flex border-b bg-gray-50 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {activeTab === 'spacing' && (
            <SpacingControl
              spacing={styles}
              onChange={onStyleChange}
            />
          )}

          {activeTab === 'typography' && (
            <TypographyControl
              typography={styles}
              onChange={onStyleChange}
            />
          )}

          {activeTab === 'colors' && (
            <ColorPicker
              colors={styles}
              onChange={onStyleChange}
            />
          )}

          {activeTab === 'background' && (
            <BackgroundControl
              background={styles}
              onChange={onStyleChange}
            />
          )}

          {activeTab === 'border' && (
            <BorderControl
              border={styles}
              onChange={onStyleChange}
            />
          )}

          {activeTab === 'animation' && (
            <AnimationControl
              animation={styles}
              onChange={onStyleChange}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          Changes are applied automatically
        </div>
      </div>
    </div>
  )
}
