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

interface MediaDetailsProps {
  media: MediaItem
  onUpdate: (media: MediaItem) => void
  onClose: () => void
}

export const MediaDetails: React.FC<MediaDetailsProps> = ({
  media,
  onUpdate,
  onClose
}) => {
  const [alt, setAlt] = useState(media.alt || '')
  const [tags, setTags] = useState(media.tags || [])
  const [tagInput, setTagInput] = useState('')

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/media/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: media.id,
          alt,
          tags
        })
      })

      const data = await response.json()
      if (data.success) {
        onUpdate({
          ...media,
          alt,
          tags
        })
      }
    } catch (error) {
      console.error('Error updating media:', error)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const mediaType = typeof media.type === 'string' ? media.type : ''
  const isImage = mediaType.toLowerCase().startsWith('image')
  return (
    <div className="media-details-shell">
      <div className="media-details-top">
        <div>
          <div className="media-eyebrow">Selected asset</div>
          <h3 className="media-title media-title-sm">Media Details</h3>
        </div>
        <button onClick={onClose} className="media-icon-button" aria-label="Close details">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="media-details-body">
        {/* Preview */}
        <div className="mb-6">
          <div className="media-preview-frame mb-4">
            {isImage ? (
              <img
                src={media.url}
                alt={alt || media.filename}
                className="media-preview-image"
              />
            ) : (
              <div className="media-preview-file">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* File Info */}
        <div className="media-details-grid">
          <div className="media-details-field">
            <label className="media-field-label">
              Filename
            </label>
            <p className="media-field-value">
              {media.filename}
            </p>
          </div>

          <div className="media-details-field">
            <label className="media-field-label">
              File Type
            </label>
            <p className="media-field-value">
              {mediaType || 'Unknown'}
            </p>
          </div>

          <div className="media-details-field">
            <label className="media-field-label">
              File Size
            </label>
            <p className="media-field-value">
              {formatFileSize(media.size)}
            </p>
          </div>

          <div className="media-details-field">
            <label className="media-field-label">
              Uploaded
            </label>
            <p className="media-field-value">
              {new Date(media.uploaded_at).toLocaleString()}
            </p>
          </div>

          {/* Alt Text */}
          <div className="media-details-field">
            <label className="media-field-label">
              Alt Text
            </label>
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              className="media-input"
              placeholder="Describe the image for accessibility"
            />
          </div>

          {/* Tags */}
          <div className="media-details-field">
            <label className="media-field-label">
              Tags
            </label>
            <div className="media-tag-row">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className="media-input"
                placeholder="Add a tag"
              />
              <button
                onClick={addTag}
                className="media-button media-button-primary"
              >
                Add
              </button>
            </div>
            <div className="media-tag-list">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="media-tag"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="media-tag-remove"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* URL */}
          <div className="media-details-field">
            <label className="media-field-label">
              URL
            </label>
            <div className="media-url-row">
              <input
                type="text"
                value={media.url}
                readOnly
                className="media-input is-readonly"
              />
              <button
                onClick={() => navigator.clipboard.writeText(media.url)}
                className="media-button media-button-secondary"
                title="Copy URL"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="media-details-footer">
        <button
          onClick={handleSave}
          className="media-button media-button-primary w-full"
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}

export default MediaDetails
