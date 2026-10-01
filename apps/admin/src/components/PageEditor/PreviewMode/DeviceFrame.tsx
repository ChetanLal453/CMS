'use client'

import React from 'react'

interface DeviceFrameProps {
  device: 'desktop' | 'tablet' | 'mobile'
  orientation: 'portrait' | 'landscape'
  width: number
  height: number
  zoom: number
  children: React.ReactNode
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  device,
  orientation,
  width,
  height,
  zoom,
  children
}) => {
  const scale = Math.min(zoom / 100, 1) // Limit scale to max 100% to prevent overflow
  
  // Calculate actual dimensions with scale
  const frameWidth = width * scale
  const frameHeight = height * scale

  const getFrameStyle = () => {
    const baseStyle = {
      position: 'relative' as const,
      width: `${frameWidth}px`,
      height: `${frameHeight}px`,
      maxWidth: '100%',
      maxHeight: '100%',
      overflow: 'hidden',
    }

    switch (device) {
      case 'desktop':
        return {
          ...baseStyle,
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          backgroundColor: '#f9fafb',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        }
      case 'tablet':
        return {
          ...baseStyle,
          border: '12px solid #1f2937',
          borderRadius: '16px',
          backgroundColor: '#1f2937',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        }
      case 'mobile':
        return {
          ...baseStyle,
          border: '8px solid #1f2937',
          borderRadius: '24px',
          backgroundColor: '#1f2937',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        }
      default:
        return baseStyle
    }
  }

  const getScreenStyle = () => {
    return {
      width: '100%',
      height: '100%',
      backgroundColor: 'white',
      overflow: 'hidden',
      borderRadius: device === 'mobile' ? '16px' : device === 'tablet' ? '8px' : '4px',
      position: 'relative' as const,
    }
  }

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Device Label */}
      <div className="mb-4 text-sm font-medium text-gray-600">
        {device.charAt(0).toUpperCase() + device.slice(1)} {orientation === 'landscape' ? '(Landscape)' : '(Portrait)'}
      </div>

      {/* Device Frame Container */}
      <div 
        className="relative flex items-center justify-center"
        style={{
          width: `${frameWidth}px`,
          height: `${frameHeight}px`,
          maxWidth: '100%',
          maxHeight: '100%',
        }}
      >
        {/* Device Frame */}
        <div style={getFrameStyle()}>
          {/* Screen */}
          <div style={getScreenStyle()}>
            {/* Scale container for zoom > 100% */}
            <div 
              style={{
                width: `${width}px`,
                height: `${height}px`,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                overflow: 'auto',
              }}
            >
              {children}
            </div>
          </div>

          {/* Device-specific details */}
          {device === 'mobile' && (
            <>
              {/* Home indicator */}
              <div
                className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-400 rounded-full"
                style={{ borderRadius: '0 0 4px 4px' }}
              />
              {/* Notch (for iPhone-style) */}
              <div
                className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-gray-800 rounded-b-lg"
              />
            </>
          )}

          {device === 'tablet' && (
            <>
              {/* Camera */}
              <div
                className="absolute top-4 right-4 w-3 h-3 bg-gray-600 rounded-full"
              />
              {/* Home button */}
              <div
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gray-600 rounded-full"
              />
            </>
          )}
        </div>
      </div>

      {/* Dimensions */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        {width} × {height}px ({zoom}%)
      </div>
    </div>
  )
}

export default DeviceFrame