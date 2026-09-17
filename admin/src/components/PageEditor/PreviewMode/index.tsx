'use client'

import React, { useState } from 'react'
import { DeviceFrame } from './DeviceFrame'
import { PreviewToolbar } from './PreviewToolbar'
import { PageRenderer } from '@/components/PageRenderer'

interface PreviewModeProps {
  layout: any
  onClose: () => void
  className?: string
  // Optional props for enhanced version
  showEnhancedToolbar?: boolean
  onSave?: () => void
  onUndo?: () => void
  onRedo?: () => void
}

export const PreviewMode: React.FC<PreviewModeProps> = ({
  layout,
  onClose,
  className = '',
  showEnhancedToolbar = false,
  onSave = () => {},
  onUndo = () => {},
  onRedo = () => {}
}) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape')
  const [zoom, setZoom] = useState(100)
  const [isSaved, setIsSaved] = useState(true)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const deviceConfigs = {
    desktop: { width: 1920, height: 1080, name: 'Desktop' },
    tablet: {
      width: orientation === 'portrait' ? 768 : 1024,
      height: orientation === 'portrait' ? 1024 : 768,
      name: 'Tablet'
    },
    mobile: {
      width: orientation === 'portrait' ? 375 : 667,
      height: orientation === 'portrait' ? 667 : 375,
      name: 'Mobile'
    }
  }

  const handleScreenshot = () => {
    // Implementation for screenshot
    alert('Screenshot captured!')
  }

  const handleShare = () => {
    const shareUrl = window.location.href + '?preview=true'
    navigator.clipboard.writeText(shareUrl)
    alert('Preview link copied to clipboard!')
  }

  const handleSave = () => {
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
    onSave()
  }

  const handleUndo = () => {
    setCanRedo(true)
    setCanUndo(false)
    onUndo()
  }

  const handleRedo = () => {
    setCanUndo(true)
    setCanRedo(false)
    onRedo()
  }

  const currentDevice = deviceConfigs[device]
  
  // Calculate max dimensions for container
  const maxContainerWidth = '90vw'  // 90% of viewport width
  const maxContainerHeight = '80vh' // 80% of viewport height

  // Enhanced version with side panel
  if (showEnhancedToolbar) {
    return (
      <div className={`fixed inset-0 bg-gray-900 z-50 flex flex-col ${className}`}>
        {/* Enhanced Toolbar */}
        <PreviewToolbar
          device={device}
          orientation={orientation}
          zoom={zoom}
          isSaved={isSaved}
          onDeviceChange={setDevice}
          onOrientationChange={setOrientation}
          onZoomChange={setZoom}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onSave={handleSave}
          onScreenshot={handleScreenshot}
          onShare={handleShare}
          onClose={onClose}
          canUndo={canUndo}
          canRedo={canRedo}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* Left Panel - Device Info & Custom Sizes */}
          <div className="w-64 bg-gray-800 border-r border-gray-700 p-4">
            <div className="space-y-6">
              {/* Current Device Info */}
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">CURRENT DEVICE</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Type:</span>
                    <span className="text-white font-medium">{currentDevice.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Dimensions:</span>
                    <span className="text-white font-medium">{currentDevice.width} × {currentDevice.height}px</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Zoom:</span>
                    <span className="text-white font-medium">{zoom}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Orientation:</span>
                    <span className="text-white font-medium capitalize">{orientation}</span>
                  </div>
                </div>
              </div>

              {/* Page Sections */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-3">PAGE SECTIONS</h3>
                <div className="space-y-2">
                  {layout.sections?.map((section: any, index: number) => (
                    <div 
                      key={index}
                      className="bg-gray-900 rounded-lg p-3 hover:bg-gray-800 transition-colors cursor-move group"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-medium">{section.title || `Section ${index + 1}`}</span>
                        <button className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-white">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                      <div className="text-xs text-gray-400">
                        {section.type && section.type !== 'custom' ? 'Dynamic section' : section.type === 'grid' ? 'Grid • Multiple components' : 'Content section'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Center - Preview Area with proper constraints */}
          <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
            <div className="relative w-full h-full flex items-center justify-center">
              <div 
                className="flex items-center justify-center max-w-full max-h-full overflow-auto p-4"
                style={{
                  maxWidth: maxContainerWidth,
                  maxHeight: maxContainerHeight
                }}
              >
                <DeviceFrame
                  device={device}
                  orientation={orientation}
                  width={currentDevice.width}
                  height={currentDevice.height}
                  zoom={zoom}
                >
                  <div className="w-full h-full bg-white overflow-auto">
                    <div className="min-h-full">
                      <PageRenderer layout={layout} />
                    </div>
                  </div>
                </DeviceFrame>
              </div>

              {/* Floating Dimensions Info */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900/90 backdrop-blur-sm text-white text-sm px-3 py-2 rounded-lg border border-gray-700 shadow-lg">
                <div className="flex items-center space-x-4">
                  <span>{currentDevice.width} × {currentDevice.height}px</span>
                  <span className="text-gray-400">•</span>
                  <span>{device.charAt(0).toUpperCase() + device.slice(1)}</span>
                  <span className="text-gray-400">•</span>
                  <span>{zoom}% zoom</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Original simple version with fixed overflow
  return (
    <div className={`fixed inset-0 bg-gray-900 z-50 flex flex-col ${className}`}>
      {/* Original Toolbar */}
      <PreviewToolbar
        device={device}
        orientation={orientation}
        zoom={zoom}
        onDeviceChange={setDevice}
        onOrientationChange={setOrientation}
        onZoomChange={setZoom}
        onClose={onClose}
      />

      {/* Preview Area with proper constraints */}
      <div className="flex-1 flex items-center justify-center p-4 bg-gray-100 overflow-hidden">
        <div className="relative w-full h-full flex items-center justify-center">
          <div 
            className="flex items-center justify-center max-w-full max-h-full overflow-auto p-4"
            style={{
              maxWidth: maxContainerWidth,
              maxHeight: maxContainerHeight
            }}
          >
            <DeviceFrame
              device={device}
              orientation={orientation}
              width={currentDevice.width}
              height={currentDevice.height}
              zoom={zoom}
            >
              <div className="w-full h-full bg-white overflow-auto">
                <div className="min-h-full">
                  <PageRenderer layout={layout} />
                </div>
              </div>
            </DeviceFrame>
          </div>

          {/* Dimensions Info */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900/90 backdrop-blur-sm text-white text-sm px-3 py-2 rounded-lg border border-gray-700 shadow-lg">
            <div className="flex items-center space-x-4">
              <span>{currentDevice.width} × {currentDevice.height}px</span>
              <span className="text-gray-400">•</span>
              <span>{device.charAt(0).toUpperCase() + device.slice(1)}</span>
              <span className="text-gray-400">•</span>
              <span>{zoom}% zoom</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Export as default
export default PreviewMode
