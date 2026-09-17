'use client'

import React, { useState } from 'react'

interface MediaItem {
  id: string
  filename: string
  url: string
  type?: string
  size: number
  uploaded_at: string
  alt?: string
  tags?: string[]
}

interface MediaGridProps {
  mediaItems: MediaItem[]
  loading: boolean
  onSelect: (item: MediaItem) => void
  onDelete: (mediaId: string) => void
  selectedItem: MediaItem | null
}

export const MediaGrid: React.FC<MediaGridProps> = ({
  mediaItems,
  loading,
  onSelect,
  onDelete,
  selectedItem
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getSafeType = (type?: unknown) => (typeof type === 'string' ? type : '')
  const isImage = (type?: unknown) => getSafeType(type).toLowerCase().startsWith('image')

  if (loading) {
    return (
      <div className="media-empty-state">
        <div className="media-spinner"></div>
        <p className="media-empty-title">Loading media...</p>
        <p className="media-empty-copy">Fetching your uploaded files.</p>
      </div>
    )
  }

  if (mediaItems.length === 0) {
    return (
      <div className="media-empty-state">
        <div className="media-empty-icon">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="media-empty-title">No media files found</p>
        <p className="media-empty-copy">Upload some images to get started.</p>
      </div>
    )
  }

  return (
    <div className="media-grid-shell">
      <div className="media-grid">
        {mediaItems.map((item) => (
          <div
            key={item.id}
            className={`media-grid-item group cursor-pointer transition-all ${
              selectedItem?.id === item.id
                ? 'is-selected'
                : ''
            }`}
            onClick={() => onSelect(item)}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            {/* Media preview */}
            <div className="media-grid-preview">
              {isImage(item.type) ? (
                <img
                  src={item.url}
                  alt={item.alt || item.filename}
                  className="media-grid-image"
                />
              ) : (
                <div className="media-grid-file">
                  <svg className="media-grid-file-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="media-grid-file-label">{getSafeType(item.type).split('/')[1]?.toUpperCase() || getSafeType(item.type).toUpperCase() || 'FILE'}</p>
                </div>
              )}
            </div>

            {/* Overlay with actions */}
            <div className={`media-grid-overlay ${
              hoveredItem === item.id ? 'bg-opacity-50' : ''
            }`}>
              <div className={`media-grid-actions ${
                hoveredItem === item.id ? 'translate-y-0' : ''
              }`}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelect(item)
                  }}
                  className="media-button media-button-ghost"
                  title="Select"
                >
                  ✓
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (window.confirm('Are you sure you want to delete this file?')) {
                      onDelete(item.id)
                    }
                  }}
                  className="media-button media-button-danger"
                  title="Delete"
                >
                  🗑
                </button>
              </div>
            </div>

            {/* File info */}
            <div className="media-grid-footer">
              <p className="media-grid-name" title={item.filename}>
                {item.filename}
              </p>
              <div className="media-grid-meta">
                <span>{formatFileSize(item.size)}</span>
                <span>•</span>
                <span>{formatDate(item.uploaded_at)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MediaGrid
