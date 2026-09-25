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

  const stackOnMobile = viewModel.stackOnMobile !== false
  const mobileDirection = viewModel.directionMobile || 'column'
  const mobileGap = viewModel.mobileGap || viewModel.gap || '12px'

  // Generate a unique class name for this flexbox so responsive CSS can target it
  const uniqueClass = `fx-${(viewModel.id || props.id || Math.random().toString(36).slice(2, 7)).replace(/[^a-z0-9]/gi, '-')}`

  const responsiveCss = stackOnMobile
    ? `
      @media (max-width: 768px) {
        .${uniqueClass} {
          flex-direction: ${mobileDirection} !important;
          gap: ${mobileGap} !important;
        }
      }
    `
    : ''

  return (
    <>
      {responsiveCss && (
        <style
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: responsiveCss }}
        />
      )}
      <div
        className={`${uniqueClass}${viewModel.className ? ` ${viewModel.className}` : ''}`}
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
          width: viewModel.width || '100%',
          maxWidth: viewModel.maxWidth || undefined,
          borderRadius: viewModel.borderRadius || undefined,
          border: viewModel.border && viewModel.border !== 'none' ? viewModel.border : undefined,
          boxShadow: viewModel.boxShadow || undefined,
          boxSizing: 'border-box',
          backgroundColor: viewModel.backgroundColor,
        }}
      >
        {nested}
      </div>
    </>
  )
}
