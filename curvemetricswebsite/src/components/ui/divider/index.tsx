'use client'

import React from 'react'
import type { PublicBlockProps } from '../PublicBlocks/shared'
import { reportCmsBoundaryViolation } from '../../../lib/cmsBoundary'

type DividerRendererProps = PublicBlockProps & {
  __sharedViewModel?: Record<string, any>
}

export default function PublicDivider(props: DividerRendererProps) {
  const viewModel = props.__sharedViewModel ?? null

  if (!viewModel) {
    return reportCmsBoundaryViolation('divider', 'Missing required shared view model.')
  }

  return (
    <hr
      className={viewModel.className}
      style={{
        border: 'none',
        borderTop: `${viewModel.thickness} solid ${viewModel.color}`,
        width: viewModel.width,
        margin: viewModel.margin,
      }}
    />
  )
}
