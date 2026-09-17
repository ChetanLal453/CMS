'use client'

import React, { useRef, useState } from 'react'
import { createBlockViewModel } from '../../../../../shared/blocks/registry'
import type { LayoutComponent } from '@/types/page-editor'
import { ImagePlus, Link2, Type, UploadCloud } from 'lucide-react'

interface ImageAdminRendererProps {
  component?: LayoutComponent
  onUpdate?: (props: Record<string, any>) => void
}

const ImageAdminRenderer: React.FC<ImageAdminRendererProps & Record<string, any>> = ({ component, onUpdate, ...props }) => {
  const imageProps = component?.props || props || {}
  const imageViewModel = createBlockViewModel('image', imageProps) as any
  const hasPreviewImage = Boolean(imageViewModel.resolvedSrc)
  const [isUploading, setIsUploading] = useState(false)
  const [editingMode, setEditingMode] = useState<'none' | 'src' | 'alt'>('none')
  const [dragOver, setDragOver] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const urlInputRef = useRef<HTMLInputElement>(null)
  const altInputRef = useRef<HTMLInputElement>(null)

  const updateImage = (nextProps: Record<string, any>) => onUpdate?.(nextProps)
  const hasCaption = Boolean(imageViewModel.showCaption && imageViewModel.caption)

  const handleImageClick = (event: React.MouseEvent) => {
    if (event.shiftKey) {
      event.stopPropagation()
      setEditingMode('src')
      setTimeout(() => urlInputRef.current?.focus(), 0)
      return
    }
    // Allow single click to bubble to DraggableComponent for component selection
  }

  const handleImageDoubleClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    fileInputRef.current?.click()
  }

  const handlePlaceholderClick = (event: React.MouseEvent) => {
    if (event.shiftKey) {
      event.stopPropagation()
      setEditingMode('src')
      setTimeout(() => urlInputRef.current?.focus(), 0)
      return
    }
    fileInputRef.current?.click()
  }

  const applyFile = (file: File) => {
    setIsUploading(true)
    const reader = new FileReader()
    reader.onload = (event) => {
      updateImage({ ...imageProps, src: event.target?.result as string, alt: file.name })
      setIsUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      applyFile(file)
    }
  }

  const handleUrlSubmit = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      updateImage({ ...imageProps, src: (event.target as HTMLInputElement).value })
      setEditingMode('none')
    } else if (event.key === 'Escape') {
      setEditingMode('none')
    }
  }

  const handleAltSubmit = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      updateImage({ ...imageProps, alt: (event.target as HTMLInputElement).value })
      setEditingMode('none')
    } else if (event.key === 'Escape') {
      setEditingMode('none')
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
    const file = event.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      applyFile(file)
    }
  }

  const imageStyle: React.CSSProperties = {
    ...imageViewModel.imageStyle,
    ...(isHovered ? imageViewModel.hoverImageStyle : null),
    display: 'block',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  }

  const previewShellStyle: React.CSSProperties = {
    borderRadius: '10px',
    border: '0.5px solid #2e3450',
    background: '#1e2235',
    overflow: 'hidden',
  }

  const imageElement = hasPreviewImage ? (
    <div className="relative group w-full" style={imageViewModel.frameStyle}>
      <img
        id={imageViewModel.customId || undefined}
        className={imageViewModel.resolvedClassName || undefined}
        src={imageViewModel.resolvedSrc}
        alt={imageViewModel.alt}
        style={imageStyle}
        loading={imageViewModel.lazyLoad ? 'lazy' : undefined}
        onClick={(event) => {
          handleImageClick(event)
          if (imageViewModel.showLightbox) {
            setIsLightboxOpen(true)
          }
        }}
        onDoubleClick={handleImageDoubleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      />
      {imageViewModel.showOverlayLayer ? (
        <div style={{ ...imageViewModel.overlayStyle, opacity: isHovered || imageViewModel.showOverlay ? imageViewModel.overlayStyle.opacity : 0 }}>
          {imageViewModel.overlayText ? <span style={imageViewModel.overlayTextStyle}>{imageViewModel.overlayText}</span> : null}
        </div>
      ) : null}
    </div>
  ) : (
    <div style={{ ...previewShellStyle, ...imageViewModel.containerStyle }} onClick={handlePlaceholderClick}>
      <div className="p-[14px]">
        <div className="rounded-[8px] border-[1.5px] border-dashed border-[#3d4460] bg-[#252a40] px-[18px] py-[18px] text-center cursor-pointer hover:border-violet-500 transition-colors">
          <ImagePlus size={28} className="mx-auto mb-[6px] text-[#a89cf5]" />
          <div className="text-[12px] font-medium text-[#c8cce6]">Click to upload an image</div>
          <div className="mt-[2px] text-[10px] text-[#6b7299]">Or hold Shift to paste an image URL</div>
        </div>
      </div>
    </div>
  )

  const wrappedImage = imageViewModel.linkUrl
    ? React.createElement(
        'a',
        {
          href: imageViewModel.linkUrl,
          target: imageViewModel.linkTarget,
          rel: imageViewModel.linkRel,
          style: { display: 'block', width: '100%' },
          onClick: (e: React.MouseEvent) => e.preventDefault(),
        },
        imageElement,
      )
    : imageElement

  return (
    <figure style={{ ...imageViewModel.containerStyle, width: '100%', maxWidth: '100%', margin: imageViewModel.containerStyle?.margin || '0 auto' }}>
      <div
        className={`group relative block w-full ${dragOver ? 'ring-2 ring-violet-400 ring-opacity-60 rounded-[24px]' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}>
        {wrappedImage}
        {imageViewModel.showCaption && imageViewModel.captionPosition === 'top' ? (
          <figcaption className="mb-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm" style={imageViewModel.captionStyle}>
            {imageViewModel.caption}
          </figcaption>
        ) : null}
        {imageViewModel.showCaption && imageViewModel.captionPosition === 'bottom' ? (
          <figcaption className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm" style={imageViewModel.captionStyle}>
            {imageViewModel.caption}
          </figcaption>
        ) : null}

        {editingMode === 'src' && (
          <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[24px] bg-slate-950/74 p-5 backdrop-blur-sm">
            <input
              ref={urlInputRef}
              type="text"
              defaultValue={imageViewModel.src || ''}
              onKeyDown={handleUrlSubmit}
              onBlur={() => setEditingMode('none')}
              className="w-full max-w-md rounded-2xl border border-white/20 bg-white px-4 py-3 text-sm text-slate-900 shadow-lg outline-none"
              placeholder="Image URL"
            />
          </div>
        )}

        {editingMode === 'alt' && (
          <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[24px] bg-slate-950/74 p-5 backdrop-blur-sm">
            <input
              ref={altInputRef}
              type="text"
              defaultValue={imageViewModel.alt || ''}
              onKeyDown={handleAltSubmit}
              onBlur={() => setEditingMode('none')}
              className="w-full max-w-md rounded-2xl border border-white/20 bg-white px-4 py-3 text-sm text-slate-900 shadow-lg outline-none"
              placeholder="Alt text"
            />
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[24px] bg-slate-950/55 backdrop-blur-sm">
            <div className="rounded-full border border-white/20 bg-white/12 px-4 py-2 text-sm font-medium text-white shadow-lg">Uploading...</div>
          </div>
        )}

        {dragOver && (
          <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[24px] border-2 border-dashed border-violet-400 bg-violet-500/18 backdrop-blur-sm">
            <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-violet-700 shadow-lg">Drop image here</div>
          </div>
        )}

        <div className="absolute right-3 top-3 z-20 flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              fileInputRef.current?.click()
            }}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-violet-300 hover:text-violet-700"
            title="Replace Image File">
            <UploadCloud size={12} />
            Replace
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              setEditingMode('src')
              setTimeout(() => urlInputRef.current?.focus(), 0)
            }}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-violet-300 hover:text-violet-700"
            title="Edit URL">
            <Link2 size={12} />
            URL
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              setEditingMode('alt')
              setTimeout(() => altInputRef.current?.focus(), 0)
            }}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-violet-300 hover:text-violet-700"
            title="Edit Alt Text">
            <Type size={12} />
            Alt
          </button>
        </div>
      </div>

      {isLightboxOpen && hasPreviewImage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-85 p-6" onClick={() => setIsLightboxOpen(false)}>
          <img
            src={imageViewModel.resolvedSrc}
            alt={imageViewModel.alt}
            style={{ maxWidth: '92vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: imageViewModel.resolvedBorderRadius }}
          />
        </div>
      ) : null}

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
    </figure>
  )
}

export default ImageAdminRenderer
