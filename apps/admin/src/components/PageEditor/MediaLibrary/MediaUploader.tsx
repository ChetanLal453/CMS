'use client'

import React, { useRef, useState } from 'react'

interface MediaUploaderProps {
  onUpload: (files: FileList) => void
  uploading: boolean
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  onUpload,
  uploading
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      onUpload(files)
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onUpload(files)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="media-uploader-shell">
      <div
        className={`media-uploader-card text-center transition-colors ${
          dragOver
            ? 'is-dragover'
            : ''
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {uploading ? (
          <div>
            <div className="media-spinner"></div>
            <p className="media-uploader-title">Uploading...</p>
            <p className="media-uploader-copy">Please wait while we process your files</p>
          </div>
        ) : (
          <div>
            <div className="media-uploader-icon">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>

            <h3 className="media-uploader-title">
              Upload Media Files
            </h3>

            <p className="media-uploader-copy">
              Drag and drop your files here, or click to browse
            </p>

            <button
              onClick={handleClick}
              className="media-button media-button-primary"
            >
              Choose Files
            </button>

            <p className="media-uploader-foot">
              Supports images, videos, and documents
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  )
}

export default MediaUploader
