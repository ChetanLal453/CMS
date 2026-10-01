'use client'

import React, { useState } from 'react'

interface PreviewToolbarProps {
  device: 'desktop' | 'tablet' | 'mobile'
  orientation: 'portrait' | 'landscape'
  zoom: number
  onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void
  onOrientationChange: (orientation: 'portrait' | 'landscape') => void
  onZoomChange: (zoom: number) => void
  onClose: () => void
  // Optional props for the enhanced version
  isSaved?: boolean
  onUndo?: () => void
  onRedo?: () => void
  onSave?: () => void
  onScreenshot?: () => void
  onShare?: () => void
  canUndo?: boolean
  canRedo?: boolean
}

export const PreviewToolbar: React.FC<PreviewToolbarProps> = ({
  device,
  orientation,
  zoom,
  onDeviceChange,
  onOrientationChange,
  onZoomChange,
  onClose,
  // Optional props with defaults
  isSaved = true,
  onUndo = () => {},
  onRedo = () => {},
  onSave = () => {},
  onScreenshot = () => alert('Screenshot functionality would be implemented here'),
  onShare = () => {
    const shareUrl = window.location.href + '?preview=true'
    navigator.clipboard.writeText(shareUrl)
    alert('Preview link copied to clipboard: ' + shareUrl)
  },
  canUndo = false,
  canRedo = false
}) => {
  const [showHistory, setShowHistory] = useState(false)

  // Check if enhanced mode should be used by checking if optional props were provided
  // (excluding the required ones that always have values)
  const useEnhancedToolbar = onUndo !== (() => {}) || 
                           onRedo !== (() => {}) || 
                           onSave !== (() => {}) ||
                           typeof isSaved !== 'boolean' // isSaved has default value, so if it's passed, it might be different

  if (!useEnhancedToolbar) {
    // Original simple toolbar
    return (
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Device Selection */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Device:</span>
            <div className="flex rounded-lg border border-gray-300 p-1">
              <button
                onClick={() => onDeviceChange('desktop')}
                className={`px-3 py-1 text-sm rounded ${
                  device === 'desktop' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                🖥️ Desktop
              </button>
              <button
                onClick={() => onDeviceChange('tablet')}
                className={`px-3 py-1 text-sm rounded ${
                  device === 'tablet' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                📱 Tablet
              </button>
              <button
                onClick={() => onDeviceChange('mobile')}
                className={`px-3 py-1 text-sm rounded ${
                  device === 'mobile' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                📱 Mobile
              </button>
            </div>
          </div>

          {/* Orientation (for tablet and mobile) */}
          {(device === 'tablet' || device === 'mobile') && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Orientation:</span>
              <div className="flex rounded-lg border border-gray-300 p-1">
                <button
                  onClick={() => onOrientationChange('portrait')}
                  className={`px-3 py-1 text-sm rounded ${
                    orientation === 'portrait' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  📱 Portrait
                </button>
                <button
                  onClick={() => onOrientationChange('landscape')}
                  className={`px-3 py-1 text-sm rounded ${
                    orientation === 'landscape' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  📱 Landscape
                </button>
              </div>
            </div>
          )}

          {/* Zoom Control */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Zoom:</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onZoomChange(Math.max(25, zoom - 25))}
                className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
              >
                -
              </button>
              <span className="text-sm font-medium min-w-[3rem] text-center">{zoom}%</span>
              <button
                onClick={() => onZoomChange(Math.min(200, zoom + 25))}
                className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onScreenshot}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Screenshot</span>
          </button>

          <button
            onClick={onShare}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            <span>Share</span>
          </button>

          <div className="w-px h-6 bg-gray-300" />

          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Exit Preview</span>
          </button>
        </div>
      </div>
    )
  }

  // Enhanced toolbar (when optional props are provided)
  return (
    <div className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between border-b border-gray-800">
      {/* Left Section: Title and Status */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold text-lg">Page Preview</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <span className={`px-2 py-1 rounded ${isSaved ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
              {isSaved ? '✓ Saved' : '● Unsaved'}
            </span>
          </div>
        </div>

        {/* Edit Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-2 rounded ${canUndo ? 'hover:bg-gray-800 text-gray-300' : 'text-gray-600 cursor-not-allowed'}`}
            title="Undo"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-2 rounded ${canRedo ? 'hover:bg-gray-800 text-gray-300' : 'text-gray-600 cursor-not-allowed'}`}
            title="Redo"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>

          <button
            onClick={onSave}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium flex items-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Save</span>
          </button>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-sm font-medium flex items-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>History</span>
          </button>
        </div>
      </div>

      {/* Center Section: Device Controls */}
      <div className="flex items-center space-x-8">
        {/* Device Selection */}
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-400">Viewport:</span>
          <div className="flex bg-gray-800 rounded-lg p-1">
            {(['desktop', 'tablet', 'mobile'] as const).map((dev) => (
              <button
                key={dev}
                onClick={() => onDeviceChange(dev)}
                className={`px-4 py-1.5 text-sm rounded-md flex items-center space-x-2 ${
                  device === dev 
                    ? 'bg-blue-600 text-white shadow' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {dev === 'desktop' && <span className="text-lg">🖥️</span>}
                {dev === 'tablet' && <span className="text-lg">📱</span>}
                {dev === 'mobile' && <span className="text-lg">📱</span>}
                <span className="capitalize">{dev}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Orientation (when applicable) */}
        {(device === 'tablet' || device === 'mobile') && (
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-400">Orientation:</span>
            <div className="flex bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => onOrientationChange('portrait')}
                className={`px-4 py-1.5 text-sm rounded-md flex items-center space-x-2 ${
                  orientation === 'portrait' 
                    ? 'bg-blue-600 text-white shadow' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span>Portrait</span>
              </button>
              <button
                onClick={() => onOrientationChange('landscape')}
                className={`px-4 py-1.5 text-sm rounded-md flex items-center space-x-2 ${
                  orientation === 'landscape' 
                    ? 'bg-blue-600 text-white shadow' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                </svg>
                <span>Landscape</span>
              </button>
            </div>
          </div>
        )}

        {/* Zoom Control */}
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-400">Zoom:</span>
          <div className="flex items-center space-x-2 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => onZoomChange(Math.max(25, zoom - 25))}
              className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
              title="Zoom out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="px-2 text-sm font-medium min-w-[3rem] text-center text-white">{zoom}%</span>
            <button
              onClick={() => onZoomChange(Math.min(200, zoom + 25))}
              className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
              title="Zoom in"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Right Section: Action Buttons */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onScreenshot}
          className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-white rounded-md flex items-center space-x-2 transition-colors"
          title="Take screenshot"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Screenshot</span>
        </button>

        <button
          onClick={onShare}
          className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-white rounded-md flex items-center space-x-2 transition-colors"
          title="Share preview"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
          <span>Share</span>
        </button>

        <div className="w-px h-6 bg-gray-700" />

        <button
          onClick={onClose}
          className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center space-x-2 transition-colors"
          title="Exit preview"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>Exit Preview</span>
        </button>
      </div>
    </div>
  )
}

export default PreviewToolbar