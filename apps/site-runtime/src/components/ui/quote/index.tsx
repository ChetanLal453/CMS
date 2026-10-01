'use client'

import React from 'react'
import type { PublicBlockProps } from '../PublicBlocks/shared'
import { reportCmsBoundaryViolation } from '../../../lib/cmsBoundary'

type QuoteRendererProps = PublicBlockProps & {
  __sharedViewModel?: Record<string, any>
}

export default function PublicQuote(props: QuoteRendererProps) {
  const viewModel = props.__sharedViewModel ?? null

  if (!viewModel) {
    return reportCmsBoundaryViolation('quote', 'Missing required shared view model.')
  }

  const text = viewModel.text
  const author = viewModel.author

  if (!viewModel.hasText) {
    return null
  }

  return (
    <blockquote
      className={viewModel.className}
      style={{
        textAlign: viewModel.align,
        fontStyle: 'italic',
        borderLeft: '4px solid #d1d5db',
        paddingLeft: '20px',
        margin: viewModel.margin,
        color: viewModel.color,
      }}>
      <p style={{ margin: '0 0 10px 0', fontSize: viewModel.fontSize, lineHeight: viewModel.lineHeight }}>{text}</p>
      {viewModel.hasAuthor ? <cite style={{ fontStyle: 'normal', fontWeight: 600 }}>— {author}</cite> : null}
    </blockquote>
  )
}
