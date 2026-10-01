'use client'

import React, { useState } from 'react'
import { BreakpointEditor } from './BreakpointEditor'

interface ResponsiveControlsProps {
  selectedComponent?: any
  onUpdate?: (component: any) => void
  className?: string
}

interface BreakpointConfig {
  min?: number
  max?: number
  label: string
  icon: string
}

export const ResponsiveControls: React.FC<ResponsiveControlsProps> = ({
  selectedComponent,
  onUpdate,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')

  const breakpoints: Record<string, BreakpointConfig> = {
    desktop: { min: 1024, label: 'Desktop', icon: '🖥️' },
    tablet: { min: 768, max: 1023, label: 'Tablet', icon: '📱' },
    mobile: { max: 767, label: 'Mobile', icon: '📱' }
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Responsive Design</h3>
        <p className="text-sm text-gray-600 mt-1">
          Customize how components appear on different screen sizes
        </p>
      </div>

      {/* Breakpoint Tabs */}
      <div className="flex border-b border-gray-200">
        {Object.entries(breakpoints).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="mr-2">{config.icon}</span>
            {config.label}
            <span className="block text-xs text-gray-400 mt-1">
              {config.min ? `≥${config.min}px` : config.max ? `≤${config.max}px` : ''}
            </span>
          </button>
        ))}
      </div>

      {/* Breakpoint Editor */}
      <div className="p-4">
        <BreakpointEditor
          breakpoint={activeTab}
          component={selectedComponent}
          onUpdate={onUpdate}
        />
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-4">
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
            Hide on Mobile
          </button>
          <button className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">
            Stack Vertically
          </button>
          <button className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200">
            Center Content
          </button>
          <button className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200">
            Full Width
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResponsiveControls
