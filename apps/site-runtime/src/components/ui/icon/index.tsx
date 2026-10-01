'use client'

import React from 'react'
import type { PublicBlockProps } from '../PublicBlocks/shared'
import { resolveIconComponent, toNumber } from '../PublicBlocks/shared'
import { reportCmsBoundaryViolation } from '../../../lib/cmsBoundary'

type IconRendererProps = PublicBlockProps & {
  __sharedViewModel?: Record<string, any>
}

export default function PublicIcon(props: IconRendererProps) {
  const viewModel = props.__sharedViewModel ?? null

  if (!viewModel) {
    return reportCmsBoundaryViolation('icon', 'Missing required shared view model.')
  }

  const IconComponent = resolveIconComponent(viewModel.iconName)
  const size = toNumber(viewModel.size, viewModel.numericSize)

  return (
    <span
      className={viewModel.className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 0,
      }}>
      <IconComponent size={size} color={viewModel.color} />
    </span>
  )
}
