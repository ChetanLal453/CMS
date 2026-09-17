import { normalizeAdvancedHeading } from './normalize'
import type { AdvancedHeadingAlignment, AdvancedHeadingInput, AdvancedHeadingLevel, AdvancedHeadingViewModel } from './types'

const PRESET_STYLES: Record<AdvancedHeadingLevel, { fontSize: string; fontWeight: string; lineHeight: string; color: string }> = {
  h1: { fontSize: '36px', fontWeight: '700', lineHeight: '1.15', color: 'var(--canvas-text, #e8eaf0)' },
  h2: { fontSize: '24px', fontWeight: '700', lineHeight: '1.2', color: 'var(--canvas-text, #e8eaf0)' },
  h3: { fontSize: '17px', fontWeight: '600', lineHeight: '1.3', color: 'var(--canvas-muted, #8b90a8)' },
  h4: { fontSize: '15px', fontWeight: '600', lineHeight: '1.3', color: 'var(--canvas-text, #111111)' },
  h5: { fontSize: '13.5px', fontWeight: '600', lineHeight: '1.35', color: 'var(--canvas-text, #111111)' },
  h6: { fontSize: '12px', fontWeight: '600', lineHeight: '1.4', color: 'var(--canvas-text, #111111)' },
}

function getLevelFontSize(level: AdvancedHeadingLevel, device: 'desktop' | 'mobile' | 'tablet'): string {
  const sizeMap: Record<AdvancedHeadingLevel, { desktop: string; mobile: string; tablet: string }> = {
    h1: { desktop: '36px', mobile: '30px', tablet: '32px' },
    h2: { desktop: '24px', mobile: '22px', tablet: '24px' },
    h3: { desktop: '17px', mobile: '16px', tablet: '17px' },
    h4: { desktop: '15px', mobile: '14px', tablet: '15px' },
    h5: { desktop: '13.5px', mobile: '13px', tablet: '13.5px' },
    h6: { desktop: '12px', mobile: '12px', tablet: '12px' },
  }

  return sizeMap[level]?.[device] || sizeMap.h2[device]
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function stripDangerousTags(value: string): string {
  return value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
}

function stripTags(value: string): string {
  return value.replace(/<[^>]*>/g, '')
}

function injectHighlight(text: string, highlightText: string, highlightColor: string): string {
  const safeText = stripDangerousTags(text)
  if (!highlightText.trim() || /<[^>]*>/.test(safeText)) {
    return safeText
  }

  const pattern = new RegExp(`(${escapeRegExp(highlightText)})`, 'gi')
  return safeText.replace(pattern, `<span style="color:${highlightColor}">$1</span>`)
}

export function createAdvancedHeadingViewModel(input: AdvancedHeadingInput): AdvancedHeadingViewModel {
  const heading = normalizeAdvancedHeading(input)
  const preset = heading.style.usePresetStyles ? PRESET_STYLES[heading.level] : undefined
  const resolvedTag = heading.aria.htmlTag === 'auto' ? heading.aria.semanticLevel || heading.level : heading.aria.htmlTag
  const effectiveColor = heading.style.color || preset?.color || 'var(--canvas-text, #111111)'
  const effectiveFontSize = heading.style.fontSize || preset?.fontSize || getLevelFontSize(heading.level, 'desktop')
  const effectiveFontWeight = heading.style.fontWeight || preset?.fontWeight || '700'
  const effectiveLineHeight = heading.style.lineHeight || preset?.lineHeight || '1.2'
  const html = injectHighlight(heading.text, heading.highlight.text, heading.highlight.color)
  const plainText = stripTags(heading.text).trim()
  const seoWarnings: string[] = []

  if (heading.seo.enabled) {
    if (!plainText) {
      seoWarnings.push('Heading text is empty.')
    }
    if (plainText.length > heading.seo.maxLength) {
      seoWarnings.push(`Heading exceeds recommended SEO length of ${heading.seo.maxLength} characters.`)
    }
  }

  return {
    visible: heading.aria.visible,
    text: heading.text,
    plainText,
    html,
    tag: resolvedTag,
    className: heading.aria.className,
    customId: heading.aria.customId,
    dataTracking: heading.aria.dataTracking,
    ariaLevel: heading.aria.ariaLevel,
    ariaLabel: heading.aria.ariaLabel,
    role: heading.aria.role,
    style: {
      fontFamily: heading.style.fontFamily,
      fontSize: effectiveFontSize,
      fontWeight: effectiveFontWeight,
      lineHeight: effectiveLineHeight,
      letterSpacing: heading.style.letterSpacing,
      textTransform: heading.style.textTransform,
      textDecoration: heading.style.textDecoration,
      fontStyle: heading.style.fontStyle,
      color: effectiveColor,
      hoverColor: heading.style.hoverColor,
      textAlign: heading.style.alignment,
      maxWidth: heading.style.maxWidth,
      margin: heading.style.margin,
      padding: heading.style.padding,
      display: 'block',
      width: '100%',
      transition: 'all 0.2s ease',
    },
    responsive: {
      mobileFontSize: heading.style.fontSizeMobile || getLevelFontSize(heading.level, 'mobile'),
      tabletFontSize: heading.style.fontSizeTablet || getLevelFontSize(heading.level, 'tablet'),
      mobileAlign: (heading.style.textAlignMobile || heading.style.alignment || 'left') as AdvancedHeadingAlignment,
      tabletAlign: (heading.style.textAlignTablet || heading.style.alignment || 'left') as AdvancedHeadingAlignment,
    },
    seoWarnings,
  }
}
