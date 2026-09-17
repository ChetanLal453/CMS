'use client'

import React from 'react'
import type { PublicBlockProps } from '../PublicBlocks/shared'
import { getNestedContent } from '../PublicBlocks/shared'
import { reportCmsBoundaryViolation } from '../../../lib/cmsBoundary'

function optionalString(value: string) {
  return value === '' ? undefined : value
}

type ContainerRendererProps = PublicBlockProps & {
  __sharedViewModel?: Record<string, any>
}

export default function PublicContainer(props: ContainerRendererProps) {
  const nested = getNestedContent(props, props.renderComponent)
  const viewModel = props.__sharedViewModel ?? null

  if (!viewModel) {
    return reportCmsBoundaryViolation('container', 'Missing required shared view model.')
  }

  return (
    <div
      className={viewModel.className}
      id={optionalString(viewModel.id)}
      style={{
        width: '100%',
        maxWidth: viewModel.maxWidth,
        margin: viewModel.margin,
        padding: viewModel.padding,
        backgroundColor: viewModel.backgroundColor,
        boxSizing: 'border-box',
      }}>
      {viewModel.content ? <div className="mb-3">{viewModel.content}</div> : null}
      {nested}
    </div>
  )
}
