import React, { useState, useRef } from 'react'

interface ImageComponentProps {
  src?: string
  alt?: string
  width?: string
  height?: string
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  borderRadius?: string
  className?: string
  style?: React.CSSProperties
  onUpdate?: (props: any) => void
  [key: string]: any
}

const ImageComponent: React.FC<ImageComponentProps> = ({
  src = 'https://via.placeholder.com/400x300?text=Click+to+upload',
  alt = 'Image',
  width = '100%',
  height = 'auto',
  objectFit = 'cover',
  borderRadius = '0px',
  className = '',
  style = {},
  onUpdate,
  ...props
}) => {
  const [isUploading, setIsUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploading(true)
      const reader = new FileReader()
      reader.onload = (event) => {
        onUpdate?.({ src: event.target?.result as string, alt: file.name })
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('image/')) {
        setIsUploading(true)
        const reader = new FileReader()
        reader.onload = (event) => {
          onUpdate?.({ src: event.target?.result as string, alt: file.name })
          setIsUploading(false)
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const imageStyle: React.CSSProperties = {
    width,
    height,
    objectFit,
    borderRadius,
    cursor: 'pointer',
    ...style
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <img
        src={src}
        alt={alt}
        style={imageStyle}
        onClick={handleImageClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        {...props}
      />

      {/* Upload overlay */}
      {isUploading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
          <div className="text-white text-sm">Uploading...</div>
        </div>
      )}

      {/* Drag overlay */}
      {dragOver && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-20 border-2 border-dashed border-blue-400 flex items-center justify-center rounded">
          <div className="text-blue-600 font-medium">Drop image here</div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}

export default ImageComponent
