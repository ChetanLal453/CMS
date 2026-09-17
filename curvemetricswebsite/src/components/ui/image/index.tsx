'use client'

import React from 'react'
import Link from 'next/link'
import { reportCmsBoundaryViolation } from '../../../lib/cmsBoundary'

function optionalString(value?: string) {
  return value && value !== '' ? value : undefined
}

function isExternalUrl(href?: string) {
  return typeof href === 'string' && /^https?:\/\//i.test(href.trim())
}

const PublicImage: React.FC<Record<string, any>> = (props) => {
  const viewModel = props.__sharedViewModel ?? null

  if (!viewModel) {
    return reportCmsBoundaryViolation('image', 'Missing required shared view model.')
  }

  const [isHovered, setIsHovered] = React.useState(false)
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false)

  if (!viewModel.isRenderable) {
    return null
  }

  const resolvedSrc = String(viewModel.resolvedSrc).trim()

  if (!resolvedSrc) {
    return reportCmsBoundaryViolation('image', 'Resolved image source is empty.')
  }

  const image = (
    <div style={viewModel.frameStyle}>
      <img
        src={resolvedSrc}
        alt={viewModel.alt}
        style={{
          ...viewModel.imageStyle,
          ...(isHovered ? viewModel.hoverImageStyle : null),
        }}
        id={optionalString(viewModel.customId)}
        className={`public-image ${viewModel.resolvedClassName}`.trim()}
        loading={viewModel.lazyLoad ? 'lazy' : undefined}
        onClick={() => {
          if (viewModel.showLightbox) {
            setIsLightboxOpen(true)
          }
        }}
      />
      {viewModel.showOverlayLayer ? (
        <div
          style={{
            ...viewModel.overlayStyle,
            opacity: isHovered ? viewModel.overlayStyle.opacity : (viewModel.showOverlay ? viewModel.overlayStyle.opacity : 0),
          }}>
          {viewModel.overlayText ? <span style={viewModel.overlayTextStyle}>{viewModel.overlayText}</span> : null}
        </div>
      ) : null}
    </div>
  )

  return (
    <figure
      style={viewModel.containerStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      {viewModel.showCaption && viewModel.captionPosition === 'top' ? <figcaption style={viewModel.captionStyle}>{viewModel.caption}</figcaption> : null}
      {viewModel.hasLink ? (
        isExternalUrl(viewModel.linkUrl) ? (
          <a href={viewModel.linkUrl} target={viewModel.linkTarget} rel={viewModel.linkRel} style={{ display: 'inline-block' }}>
            {image}
          </a>
        ) : (
            <Link href={viewModel.linkUrl} target={viewModel.linkTarget} rel={viewModel.linkRel} style={{ display: 'inline-block' }}>
            {image}
          </Link>
        )
      ) : (
        image
      )}
      {viewModel.showCaption && viewModel.captionPosition === 'bottom' ? <figcaption style={viewModel.captionStyle}>{viewModel.caption}</figcaption> : null}
      {isLightboxOpen && viewModel.hasImage ? (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: 'rgba(0,0,0,0.88)', zIndex: 2000, padding: '24px' }}
          onClick={() => setIsLightboxOpen(false)}>
          <img
            src={resolvedSrc}
            alt={viewModel.alt}
            style={{
              maxWidth: '92vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: viewModel.resolvedBorderRadius,
            }}
          />
        </div>
      ) : null}
    </figure>
  )
}

export default PublicImage
