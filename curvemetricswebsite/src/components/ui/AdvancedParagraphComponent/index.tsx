'use client'

import React from 'react'
import type { AdvancedParagraphViewModel } from '../../../../../shared/blocks/advancedparagraph'
import { reportCmsBoundaryViolation } from '../../../lib/cmsBoundary'

function sanitizeBasicHtml(value: string): string {
  return value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
}

function optionalString(value: string) {
  return value === '' ? undefined : value
}

type AdvancedParagraphRendererProps = Record<string, any> & {
  __sharedViewModel?: AdvancedParagraphViewModel
}

const AdvancedParagraphComponent: React.FC<AdvancedParagraphRendererProps> = (props) => {
  const view = React.useMemo(() => props.__sharedViewModel ?? null, [props.__sharedViewModel])
  const [isHovered, setIsHovered] = React.useState(false)

  if (!view) {
    return reportCmsBoundaryViolation('advancedparagraph', 'Missing required shared view model.')
  }

  if (!view.visible) {
    return null
  }

  const hoverStyle: React.CSSProperties = {}
  if (isHovered) {
    if (view.hover.effect === 'underline') {
      hoverStyle.textDecoration = 'underline'
    }
    if (view.hover.effect === 'color-change') {
      hoverStyle.color = view.resolvedHoverColor
      hoverStyle.backgroundColor = view.resolvedHoverBackgroundColor
    }
    if (view.hover.effect === 'background-change') {
      hoverStyle.backgroundColor = view.resolvedHoverBackgroundColor
    }
  }

  const truncationStyle: React.CSSProperties = {}
  if (view.truncate) {
    if (view.maxLines && view.maxLines > 0) {
      truncationStyle.display = '-webkit-box'
      ;(truncationStyle as React.CSSProperties & { WebkitLineClamp: number }).WebkitLineClamp = view.maxLines
      ;(truncationStyle as React.CSSProperties & { WebkitBoxOrient: 'vertical' }).WebkitBoxOrient = 'vertical'
      truncationStyle.overflow = 'hidden'
    } else {
      truncationStyle.whiteSpace = 'nowrap'
      truncationStyle.overflow = 'hidden'
      truncationStyle.textOverflow = 'ellipsis'
    }
  }

  return (
    <div className="advanced-paragraph-wrap">
      <div
        id={optionalString(view.customId)}
        className={`advanced-paragraph ${view.className}`.trim()}
        style={{
          ...view.style,
          cursor: view.editable ? 'text' : 'inherit',
          userSelect: view.selectable ? 'text' : 'none',
          ...hoverStyle,
          ...truncationStyle,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        dangerouslySetInnerHTML={{ __html: sanitizeBasicHtml(view.html) }}
        aria-label={optionalString(view.ariaLabel)}
        role={optionalString(view.role)}
        tabIndex={view.tabIndex}
        suppressHydrationWarning
      />

      <style jsx>{`
        @media (max-width: 767px) {
          .advanced-paragraph {
            ${view.responsive.fontSizeMobile ? `font-size: ${view.responsive.fontSizeMobile} !important;` : ''}
            ${view.responsive.textAlignMobile ? `text-align: ${view.responsive.textAlignMobile} !important;` : ''}
            ${view.responsive.lineHeightMobile ? `line-height: ${view.responsive.lineHeightMobile} !important;` : ''}
          }
        }

        @media (min-width: 768px) and (max-width: 1024px) {
          .advanced-paragraph {
            ${view.responsive.fontSizeTablet ? `font-size: ${view.responsive.fontSizeTablet} !important;` : ''}
            ${view.responsive.textAlignTablet ? `text-align: ${view.responsive.textAlignTablet} !important;` : ''}
          }
        }
      `}</style>
    </div>
  )
}

export default AdvancedParagraphComponent
