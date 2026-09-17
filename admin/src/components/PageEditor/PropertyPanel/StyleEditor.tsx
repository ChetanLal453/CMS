'use client'

import React from 'react'

interface StyleEditorProps {
  styles: any
  onStyleChange: (property: string, value: any) => void
}

export const StyleEditor: React.FC<StyleEditorProps> = ({
  styles,
  onStyleChange
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Style Editor</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Background Color
          </label>
          <input
            type="color"
            value={styles?.backgroundColor || '#ffffff'}
            onChange={(e) => onStyleChange('backgroundColor', e.target.value)}
            className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Text Color
          </label>
          <input
            type="color"
            value={styles?.color || '#000000'}
            onChange={(e) => onStyleChange('color', e.target.value)}
            className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Padding
          </label>
          <input
            type="text"
            value={styles?.padding || '0px'}
            onChange={(e) => onStyleChange('padding', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 10px 20px"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Margin
          </label>
          <input
            type="text"
            value={styles?.margin || '0px'}
            onChange={(e) => onStyleChange('margin', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 10px 20px"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Border Radius
        </label>
        <input
          type="text"
          value={styles?.borderRadius || '0px'}
          onChange={(e) => onStyleChange('borderRadius', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., 4px"
        />
      </div>
    </div>
  )
}
