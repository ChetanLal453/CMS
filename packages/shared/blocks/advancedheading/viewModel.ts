import { defaultAdvancedHeadingProps } from './defaults'
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
  const resolvedLevel = heading.content?.level ?? heading.level ?? defaultAdvancedHeadingProps.level
  const usePreset = heading.style?.usePresetStyles ?? heading.usePresetStyles ?? defaultAdvancedHeadingProps.style.usePresetStyles
  const preset = usePreset ? PRESET_STYLES[resolvedLevel] : undefined
  const resolvedTag =
    (heading.style?.htmlTag ?? heading.aria?.htmlTag) === 'auto'
      ? heading.aria?.semanticLevel || resolvedLevel
      : (heading.style?.htmlTag ?? heading.aria?.htmlTag ?? resolvedLevel)
  const effectiveColor = heading.style?.color ?? heading.color ?? preset?.color ?? defaultAdvancedHeadingProps.style.color
  const effectiveFontSize = heading.style?.fontSize ?? heading.fontSize ?? preset?.fontSize ?? getLevelFontSize(resolvedLevel, 'desktop')
  const effectiveFontWeight = heading.style?.fontWeight ?? heading.fontWeight ?? preset?.fontWeight ?? '700'
  const effectiveLineHeight = heading.style?.lineHeight ?? heading.lineHeight ?? preset?.lineHeight ?? '1.2'
  const text = heading.content?.text ?? heading.text ?? defaultAdvancedHeadingProps.text
  const highlightText = heading.content?.highlightText ?? heading.highlight?.text ?? defaultAdvancedHeadingProps.highlight.text
  const highlightColor = heading.content?.highlightColor ?? heading.highlight?.color ?? defaultAdvancedHeadingProps.highlight.color
  const html = injectHighlight(text, highlightText, highlightColor)
  const plainText = stripTags(text).trim()
  const seoWarnings: string[] = []

  const seoEnabled = heading.content?.seoEnabled ?? heading.seo?.enabled ?? defaultAdvancedHeadingProps.seo.enabled
  const seoMaxLength = heading.content?.seoMaxLength ?? heading.seo?.maxLength ?? defaultAdvancedHeadingProps.seo.maxLength

  if (seoEnabled) {
    if (!plainText) {
      seoWarnings.push('Heading text is empty.')
    }
    if (plainText.length > seoMaxLength) {
      seoWarnings.push(`Heading exceeds recommended SEO length of ${seoMaxLength} characters.`)
    }
  }

  return {
    visible: heading.style?.visible ?? heading.aria?.visible ?? defaultAdvancedHeadingProps.aria.visible,
    text,
    plainText,
    html,
    tag: resolvedTag,
    className: heading.style?.className ?? heading.aria?.className ?? defaultAdvancedHeadingProps.aria.className,
    customId: heading.style?.customId ?? heading.aria?.customId ?? defaultAdvancedHeadingProps.aria.customId,
    dataTracking: heading.style?.dataTracking ?? heading.aria?.dataTracking ?? defaultAdvancedHeadingProps.aria.dataTracking,
    ariaLevel: heading.style?.ariaLevel ?? heading.aria?.ariaLevel ?? defaultAdvancedHeadingProps.aria.ariaLevel,
    ariaLabel: heading.style?.ariaLabel ?? heading.aria?.ariaLabel ?? defaultAdvancedHeadingProps.aria.ariaLabel,
    role: heading.style?.role ?? heading.aria?.role ?? defaultAdvancedHeadingProps.aria.role,
    style: {
      fontFamily: heading.style?.fontFamily ?? defaultAdvancedHeadingProps.style.fontFamily,
      fontSize: effectiveFontSize,
      fontWeight: effectiveFontWeight,
      lineHeight: effectiveLineHeight,
      letterSpacing: heading.style?.letterSpacing ?? defaultAdvancedHeadingProps.style.letterSpacing,
      textTransform: heading.style?.textTransform ?? defaultAdvancedHeadingProps.style.textTransform,
      textDecoration: heading.style?.textDecoration ?? defaultAdvancedHeadingProps.style.textDecoration,
      fontStyle: heading.style?.fontStyle ?? defaultAdvancedHeadingProps.style.fontStyle,
      color: effectiveColor,
      hoverColor: heading.style?.hoverColor ?? defaultAdvancedHeadingProps.style.hoverColor,
      textAlign: heading.style?.alignment ?? heading.alignment ?? defaultAdvancedHeadingProps.style.alignment,
      maxWidth: heading.style?.maxWidth ?? defaultAdvancedHeadingProps.style.maxWidth,
      margin: heading.style?.margin ?? defaultAdvancedHeadingProps.style.margin,
      padding: heading.style?.padding ?? defaultAdvancedHeadingProps.style.padding,
      display: 'block',
      width: '100%',
      transition: 'all 0.2s ease',
    },
    responsive: {
      mobileFontSize:
        heading.responsive?.fontSizeMobile ||
        heading.style?.fontSizeMobile ||
        getLevelFontSize(resolvedLevel, 'mobile'),
      tabletFontSize:
        heading.responsive?.fontSizeTablet ||
        heading.style?.fontSizeTablet ||
        getLevelFontSize(resolvedLevel, 'tablet'),
      mobileAlign: (heading.responsive?.textAlignMobile ||
        heading.style?.textAlignMobile ||
        heading.style?.alignment ||
        defaultAdvancedHeadingProps.style.textAlignMobile) as AdvancedHeadingAlignment,
      tabletAlign: (heading.responsive?.textAlignTablet ||
        heading.style?.textAlignTablet ||
        heading.style?.alignment ||
        defaultAdvancedHeadingProps.style.textAlignTablet) as AdvancedHeadingAlignment,
    },
    seoWarnings,
  }
}
