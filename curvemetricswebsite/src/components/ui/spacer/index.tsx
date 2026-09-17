'use client'

import React from 'react'
import type { PublicBlockProps } from '../PublicBlocks/shared'
import { reportCmsBoundaryViolation } from '../../../lib/cmsBoundary'

type SpacerRendererProps = PublicBlockProps & {
  __sharedViewModel?: Record<string, any>
}

export default function PublicSpacer(props: SpacerRendererProps) {
  const viewModel = props.__sharedViewModel ?? null

  if (!viewModel) {
    return reportCmsBoundaryViolation('spacer', 'Missing required shared view model.')
  }

  if (viewModel.visible === false) {
    return null
  }

  const mobileHeight = viewModel.mobileHeight
  const tabletHeight = viewModel.tabletHeight
  const desktopHeight = viewModel.desktopHeight
  const backgroundColor = viewModel.editorBackgroundColor

  return (
    <>
      <div
        aria-hidden="true"
        className={viewModel.className}
        data-component-type="spacer"
        style={{
          width: '100%',
          height: desktopHeight,
          minHeight: '1px',
          backgroundColor,
        }}
      />
      <style jsx>{`
        div[data-component-type='spacer'] {
          height: ${desktopHeight};
        }

        @media (max-width: 1024px) {
          div[data-component-type='spacer'] {
            height: ${tabletHeight};
          }
        }

        @media (max-width: 767px) {
          div[data-component-type='spacer'] {
            height: ${mobileHeight};
          }
        }
      `}</style>
    </>
  )
}
