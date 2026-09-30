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

  const isAbsolute = viewModel.position === 'absolute'
  const uniqueClass = `cnt-${(viewModel.id || props.id || Math.random().toString(36).slice(2, 7)).replace(/[^a-z0-9]/gi, '-')}`

  const mobilePosition = viewModel.mobilePosition ?? (viewModel.responsive?.mobile?.position)
  const mobileTop = viewModel.mobileTop ?? (viewModel.responsive?.mobile?.top)
  const mobileRight = viewModel.mobileRight ?? (viewModel.responsive?.mobile?.right)
  const mobileBottom = viewModel.mobileBottom ?? (viewModel.responsive?.mobile?.bottom)
  const mobileLeft = viewModel.mobileLeft ?? (viewModel.responsive?.mobile?.left)

  let responsiveCss = ''
  if (mobilePosition || mobileTop || mobileRight || mobileBottom || mobileLeft) {
    responsiveCss = `
      @media (max-width: 768px) {
        .${uniqueClass} {
          ${mobilePosition ? `position: ${mobilePosition} !important;` : ''}
          ${mobileTop ? `top: ${mobileTop} !important;` : ''}
          ${mobileRight ? `right: ${mobileRight} !important;` : ''}
          ${mobileBottom ? `bottom: ${mobileBottom} !important;` : ''}
          ${mobileLeft ? `left: ${mobileLeft} !important;` : ''}
        }
      }
    `
  } else if (isAbsolute) {
    // Default backward-compatible safety on small mobile (< 576px) so badges don't overflow right edge
    responsiveCss = `
      @media (max-width: 576px) {
        .${uniqueClass} {
          max-width: calc(100vw - 32px) !important;
        }
      }
    `
  }

  return (
    <>
      {responsiveCss ? (
        <style
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: responsiveCss }}
        />
      ) : null}
      <div
        className={`${uniqueClass}${viewModel.className ? ` ${viewModel.className}` : ''}`}
        id={optionalString(viewModel.id)}
        style={{
          width: viewModel.width || '100%',
          maxWidth: viewModel.maxWidth,
          minHeight: viewModel.minHeight,
          margin: viewModel.margin,
          padding: viewModel.padding,
          backgroundColor: viewModel.backgroundColor,
          borderRadius: viewModel.borderRadius && viewModel.borderRadius !== '0px' ? viewModel.borderRadius : undefined,
          border: viewModel.border && viewModel.border !== 'none' ? viewModel.border : undefined,
          borderColor: viewModel.borderColor,
          boxShadow: viewModel.boxShadow && viewModel.boxShadow !== 'none' ? viewModel.boxShadow : (viewModel.shadow && viewModel.shadow !== 'none' ? viewModel.shadow : undefined),
          position: viewModel.position,
          top: viewModel.top,
          right: viewModel.right,
          bottom: viewModel.bottom,
          left: viewModel.left,
          zIndex: viewModel.zIndex,
          overflow: viewModel.overflow,
          boxSizing: 'border-box',
        }}>
        {typeof viewModel.content === 'string' &&
        viewModel.content.trim() &&
        viewModel.content !== '[object Object]' &&
        (!nested || (Array.isArray(nested) && nested.length === 0)) ? (
          <div className="mb-3">{viewModel.content}</div>
        ) : null}
        {nested}
      </div>
    </>
  )
}
