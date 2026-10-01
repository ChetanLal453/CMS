'use client'

import React, { useState, useEffect } from 'react'
import { MediaGrid } from './MediaGrid'
import { MediaUploader } from './MediaUploader'
import { MediaDetails } from './MediaDetails'

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

interface MediaLibraryProps {
  onSelect?: (media: MediaItem) => void
  selectedMedia?: MediaItem | null
  className?: string
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({
  onSelect,
  selectedMedia,
  className = ''
}) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)
  const [showUploader, setShowUploader] = useState(false)

  const getSafeType = (type?: string) => (typeof type === 'string' ? type : '')
  const isImageType = (type?: string) => getSafeType(type).toLowerCase().startsWith('image')

  useEffect(() => {
    fetchMediaItems()
  }, [])

  useEffect(() => {
    setSelectedItem(selectedMedia || null)
  }, [selectedMedia])
  const fetchMediaItems = async () => {
    try {
      const response = await fetch('/api/media/list', { credentials: 'include' })
      const data = await response.json()
      if (data.success) {
        const normalizedMedia = Array.isArray(data.media)
          ? data.media.map((item: any) => ({
              ...item,
              type: item?.type || item?.mimeType || item?.fileType || '',
              uploaded_at: item?.uploaded_at || item?.created_at || new Date().toISOString(),
            }))
          : []
        setMediaItems(normalizedMedia)
      }
    } catch (error) {
      console.error('Error fetching media:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (files: FileList) => {
    setUploading(true)
    const formData = new FormData()

    Array.from(files).forEach(file => {
      formData.append('files', file)
    })

    try {
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      const data = await response.json()
      if (data.success) {
        setMediaItems(prev => [...data.uploaded, ...prev])
        setShowUploader(false)
      }
    } catch (error) {
      console.error('Error uploading media:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (mediaId: string) => {
    try {
      const response = await fetch(`/api/media/delete?id=${mediaId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await response.json()
      if (data.success) {
        setMediaItems(prev => prev.filter(item => item.id !== mediaId))
        if (selectedItem?.id === mediaId) {
          setSelectedItem(null)
        }
      }
    } catch (error) {
      console.error('Error deleting media:', error)
    }
  }

  const filteredMedia = mediaItems.filter(item =>
    item.filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )
  return (
    <div className={`media-library-shell ${className}`.trim()}>
      <div className="media-library-main">
        <div className="media-library-top">
          <div>
            <div className="media-eyebrow">Assets</div>
            <h2 className="media-title">Media Library</h2>
            <p className="media-subtitle">Upload, preview, search, and reuse media across the editor.</p>
          </div>

          <button
            onClick={() => setShowUploader(!showUploader)}
            className={`media-button media-button-primary ${showUploader ? 'is-active' : ''}`}>
            {showUploader ? 'Close uploader' : 'Upload media'}
          </button>
        </div>

        <div className="media-toolbar">
          <div className="media-stat">
            <span className="media-stat-label">Total</span>
            <span className="media-stat-value">{mediaItems.length}</span>
          </div>
          <div className="media-stat">
            <span className="media-stat-label">Images</span>
            <span className="media-stat-value">{mediaItems.filter((item) => isImageType(item.type)).length}</span>
          </div>
          <div className="media-stat">
            <span className="media-stat-label">Filtered</span>
            <span className="media-stat-value">{filteredMedia.length}</span>
          </div>
          <div className="media-search">
            <input
              type="text"
              placeholder="Search media, tags, filename..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="media-input"
            />
          </div>
        </div>

        <div className="media-library-content">
          {showUploader ? (
            <MediaUploader
              onUpload={handleUpload}
              uploading={uploading}
            />
          ) : (
            <MediaGrid
              mediaItems={filteredMedia}
              loading={loading}
              onSelect={(item) => {
                setSelectedItem(item)
                onSelect?.(item)
              }}
              onDelete={handleDelete}
              selectedItem={selectedItem}
            />
          )}
        </div>
      </div>

      {selectedItem && (
        <aside className="media-library-aside">
          <MediaDetails
            media={selectedItem}
            onUpdate={(updatedMedia) => {
              setMediaItems((prev) =>
                prev.map((item) => (item.id === updatedMedia.id ? updatedMedia : item)),
              )
              setSelectedItem(updatedMedia)
            }}
            onClose={() => setSelectedItem(null)}
          />
        </aside>
      )}
    </div>
  )
}

export default MediaLibrary


