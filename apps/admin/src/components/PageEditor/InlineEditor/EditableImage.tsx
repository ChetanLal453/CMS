'use client'

import React, { useState, useRef } from 'react'

interface EditableImageProps {
  src: string
  alt: string
  onSrcChange: (src: string) => void
  onAltChange: (alt: string) => void
  className?: string
  width?: string
  height?: string
}

export const EditableImage: React.FC<EditableImageProps> = ({
  src,
  alt,
  onSrcChange,
  onAltChange,
  className = '',
  width = '100%',
  height = 'auto'
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [tempSrc, setTempSrc] = useState(src)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageClick = () => {
    setShowUrlInput(true)
  }

  const handleUrlSubmit = () => {
    onSrcChange(tempSrc)
    setShowUrlInput(false)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        onSrcChange(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAltEdit = () => {
    const newAlt = window.prompt('Alt text:', alt)
    if (newAlt !== null) {
      onAltChange(newAlt)
    }
  }

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={src}
        alt={alt}
        className={`cursor-pointer ${className}`}
        style={{ width, height, maxWidth: '100%' }}
        onClick={handleImageClick}
      />

      {/* Hover overlay */}
      {isHovered && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
              className="px-3 py-1 bg-white text-black rounded text-sm hover:bg-gray-200"
              title="Upload new image"
            >
              📁 Upload
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleImageClick()
              }}
              className="px-3 py-1 bg-white text-black rounded text-sm hover:bg-gray-200"
              title="Change URL"
            >
              🔗 URL
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleAltEdit()
              }}
              className="px-3 py-1 bg-white text-black rounded text-sm hover:bg-gray-200"
              title="Edit alt text"
            >
              ✏️ Alt
            </button>
          </div>
        </div>
      )}

      {/* URL input modal */}
      {showUrlInput && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Change Image URL</h3>
            <input
              type="url"
              value={tempSrc}
              onChange={(e) => setTempSrc(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded mb-3"
              placeholder="https://example.com/image.jpg"
            />
            <div className="flex gap-2">
              <button
                onClick={handleUrlSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Update
              </button>
              <button
                onClick={() => setShowUrlInput(false)}
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  )
}

export default EditableImage
