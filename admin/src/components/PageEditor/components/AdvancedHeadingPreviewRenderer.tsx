'use client'

import React from 'react'
import { useDeviceMode } from '../context/DeviceModeContext'
import { createAdvancedHeadingViewModel } from '../../../../../shared/blocks/advancedheading'
import { sanitizeHtml } from '../../../lib/sanitize-markup'

const AdvancedHeadingPreviewRenderer: React.FC<Record<string, any>> = (props) => {
  const view = React.useMemo(() => createAdvancedHeadingViewModel(props), [props])
  const [isHovered, setIsHovered] = React.useState(false)
  const { deviceMode } = useDeviceMode()

  React.useEffect(() => {
    const onSeoWarning = props.onSeoWarning as ((warnings: string[]) => void) | undefined
    onSeoWarning?.(view.seoWarnings)
  }, [props.onSeoWarning, view.seoWarnings])

  if (!view.visible) {
    return null
  }

  const Tag = (view.tag || 'h2') as keyof JSX.IntrinsicElements
  const isDefaultDarkColor =
    !view.style.color ||
    view.style.color === 'var(--canvas-text, #111111)' ||
    view.style.color === '#111111' ||
    view.style.color === '#000000' ||
    view.style.color === '#f1f5f9'

  const activeAlign =
    deviceMode === 'mobile'
      ? (view.responsive.mobileAlign || view.style.textAlign || 'left')
      : deviceMode === 'tablet'
      ? (view.responsive.tabletAlign || view.style.textAlign || 'left')
      : (view.style.textAlign || 'left')

  const activeFontSize =
    deviceMode === 'mobile'
      ? (view.responsive.mobileFontSize || view.style.fontSize)
      : deviceMode === 'tablet'
      ? (view.responsive.tabletFontSize || view.style.fontSize)
      : view.style.fontSize

  const headingStyle: React.CSSProperties = {
    ...view.style,
    textAlign: activeAlign as any,
    fontSize: activeFontSize,
    color: isHovered ? view.style.hoverColor : isDefaultDarkColor ? 'var(--theme-text, #f1f5f9)' : view.style.color,
    fontFamily: view.style.fontFamily || 'var(--theme-heading-font-family, var(--theme-font-family, inherit))',
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

  const headingNode = (
    <>
      <Tag
        id={view.customId || undefined}
        className={`advanced-heading ${view.className || ''}`.trim()}
        style={headingStyle}
        data-tracking={view.dataTracking || undefined}
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
      `}</style>
    </>
  )

  return headingNode
}

export default AdvancedHeadingPreviewRenderer
