'use client'

import React from 'react'
import type { PublicBlockProps } from '../PublicBlocks/shared'
import { getNestedContent } from '../PublicBlocks/shared'
import { reportCmsBoundaryViolation } from '../../../lib/cmsBoundary'

function optionalString(value: string) {
  return value === '' ? undefined : value
}

type FlexboxRendererProps = PublicBlockProps & {
  __sharedViewModel?: Record<string, any>
}

export default function PublicFlexBox(props: FlexboxRendererProps) {
  const nested = getNestedContent(props, props.renderComponent)
  const viewModel = props.__sharedViewModel ?? null

  if (!viewModel) {
    return reportCmsBoundaryViolation('flexbox', 'Missing required shared view model.')
  }

  return (
    <div
      className={viewModel.className}
      id={optionalString(viewModel.id)}
      style={{
        display: 'flex',
        flexDirection: viewModel.direction,
        justifyContent: viewModel.justifyContent,
        alignItems: viewModel.alignItems,
        alignContent: viewModel.alignContent,
        flexWrap: viewModel.wrap,
        gap: viewModel.gap,
        rowGap: viewModel.rowGap,
        columnGap: viewModel.columnGap,
        padding: viewModel.padding,
        minHeight: viewModel.minHeight,
        width: '100%',
        boxSizing: 'border-box',
        backgroundColor: viewModel.backgroundColor,
      }}>
      {nested}
    </div>
  )
}
