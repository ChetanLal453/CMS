'use client'

import React from 'react'
import { sanitizeHtml } from '../../../lib/sanitize-markup'
import { normalizeAdvancedParagraph, createAdvancedParagraphViewModel } from '../../../../../shared/blocks/advancedparagraph'
import type { AdvancedParagraphInput } from '../../../../../shared/blocks/advancedparagraph'

const AdvancedParagraphPreviewRenderer: React.FC<AdvancedParagraphInput> = (props) => {
  const paragraph = React.useMemo(() => normalizeAdvancedParagraph(props), [props])
  const view = React.useMemo(() => createAdvancedParagraphViewModel(paragraph), [paragraph])
  const [isHovered, setIsHovered] = React.useState(false)
  const [isEditor, setIsEditor] = React.useState(false)

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      setIsEditor(Boolean(document.querySelector('.cm-page-editor')))
    }
  }, [])

  if (!view.visible) {
    return null
  }

  const hoverStyle: React.CSSProperties = {}
  if (isHovered) {
    if (view.hover.effect === 'underline') {
      hoverStyle.textDecoration = 'underline'
    }
    if (view.hover.effect === 'color-change') {
      hoverStyle.color = view.hover.color || view.style.color
      hoverStyle.backgroundColor = view.hover.backgroundColor || view.style.backgroundColor
    }
    if (view.hover.effect === 'background-change') {
      hoverStyle.backgroundColor = view.hover.backgroundColor || view.style.backgroundColor
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

  const isDefaultDarkColor =
    !view.style.color ||
    view.style.color === 'var(--canvas-text, #111111)' ||
    view.style.color === '#111111' ||
    view.style.color === '#000000'

  const paragraphNode = (
    <div className="advanced-paragraph-wrap">
      <div
        id={view.customId || undefined}
        className={`advanced-paragraph ${view.className || ''}`.trim()}
        style={{
          ...view.style,
          color: isDefaultDarkColor ? '#cbd5e1' : view.style.color,
          cursor: view.editable ? 'text' : 'inherit',
          userSelect: view.selectable ? 'text' : 'none',
          ...hoverStyle,
          ...truncationStyle,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(view.html) }}
        aria-label={view.ariaLabel || undefined}
        role={view.role || undefined}
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

  return paragraphNode
}

export default AdvancedParagraphPreviewRenderer
