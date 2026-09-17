'use client'

import React from 'react'
import type { PublicBlockProps } from '../PublicBlocks/shared'
import type { VideoViewModel } from '../../../../../shared/blocks/video'
import { reportCmsBoundaryViolation } from '../../../lib/cmsBoundary'

type VideoRendererProps = PublicBlockProps & {
  __sharedViewModel?: VideoViewModel
}

export default function PublicVideo(props: VideoRendererProps) {
  const viewModel = props.__sharedViewModel ?? null

  if (!viewModel) {
    return reportCmsBoundaryViolation('video', 'Missing required shared view model.')
  }

  if (viewModel.resolvedSource.src.trim() === '') {
    return reportCmsBoundaryViolation('video', 'Missing required video source.')
  }

  return (
    <div
      className={viewModel.className}
      style={{
        ...(viewModel.width ? { width: viewModel.width } : {}),
        ...(viewModel.maxWidth ? { maxWidth: viewModel.maxWidth } : {}),
        ...(viewModel.aspectRatio ? { aspectRatio: viewModel.aspectRatio } : {}),
        position: 'relative',
        overflow: 'hidden',
        ...(viewModel.borderRadius != null ? { borderRadius: `${viewModel.borderRadius}px` } : {}),
        border: `1px solid ${viewModel.borderColorWithOpacity}`,
        background: '#22263a',
        boxSizing: 'border-box',
      }}>
      {viewModel.isMp4 ? (
          <video
          src={viewModel.resolvedSource.src}
          autoPlay={Boolean(viewModel.autoplay)}
          muted={viewModel.shouldMute}
          loop={Boolean(viewModel.loop)}
          controls={viewModel.controls !== false}
          playsInline
          style={{
            width: '100%',
            height: '100%',
            ...(viewModel.objectFit ? { objectFit: viewModel.objectFit } : {}),
            display: 'block',
          }}
        />
      ) : (
        <iframe
          src={viewModel.resolvedSource.src}
          title={viewModel.resolvedTitle}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{
            width: '100%',
            height: '100%',
            border: 0,
            display: 'block',
          }}
        />
      )}
    </div>
  )
}
