'use client'

import React from 'react'
import type { AdvancedHeadingViewModel } from '@uadmin/shared/blocks/advancedheading'
import { sanitizeHtml } from '@uadmin/shared/utils/sanitize-markup'
import { reportCmsBoundaryViolation } from '../../../lib/cmsBoundary'

function optionalString(value?: string) {
  return value && value !== '' ? value : undefined
}

type AdvancedHeadingRendererProps = Record<string, any> & {
  __sharedViewModel?: AdvancedHeadingViewModel
}

const AdvancedHeadingComponent: React.FC<AdvancedHeadingRendererProps> = (props) => {
  const view = React.useMemo(() => props.__sharedViewModel ?? null, [props.__sharedViewModel])
  const [isHovered, setIsHovered] = React.useState(false)

  if (!view) {
    return reportCmsBoundaryViolation('advancedheading', 'Missing required shared view model.')
  }

  if (!view.visible) {
    return null
  }

  const Tag = view.tag as keyof JSX.IntrinsicElements
  const headingStyle: React.CSSProperties = {
    ...view.style,
    color: isHovered ? view.style.hoverColor : view.style.color,
  }

  const ariaProps: Record<string, unknown> = {}
  if (view.ariaLevel !== undefined) {
    ariaProps['aria-level'] = view.ariaLevel
  }
  if (view.ariaLabel) {
    ariaProps['aria-label'] = view.ariaLabel
  }
  if (view.role) {
    ariaProps.role = view.role
  }

  return (
    <>
      <Tag
        id={optionalString(view.customId)}
        className={`advanced-heading ${view.className}`.trim()}
        style={headingStyle}
        data-tracking={optionalString(view.dataTracking)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(view.html) }}
        {...ariaProps}
      />
      <style jsx>{`
        .advanced-heading {
          margin: 0;
          padding: 0;
        }

        @media (max-width: 768px) {
          .advanced-heading {
            font-size: ${view.responsive.mobileFontSize} !important;
            ${view.responsive.mobileAlign && view.responsive.mobileAlign !== view.style.textAlign ? `text-align: ${view.responsive.mobileAlign} !important;` : ''}
          }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .advanced-heading {
            font-size: ${view.responsive.tabletFontSize} !important;
            ${view.responsive.tabletAlign && view.responsive.tabletAlign !== view.style.textAlign ? `text-align: ${view.responsive.tabletAlign} !important;` : ''}
          }
        }
      `}</style>
    </>
  )
}

export default AdvancedHeadingComponent
