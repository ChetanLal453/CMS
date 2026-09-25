import { defaultAdvancedHeadingProps } from './defaults'
import type {
  AdvancedHeading,
  AdvancedHeadingAlignment,
  AdvancedHeadingFontStyle,
  AdvancedHeadingHtmlTag,
  AdvancedHeadingInput,
  AdvancedHeadingLevel,
  AdvancedHeadingTextDecoration,
  AdvancedHeadingTextTransform,
  CanonicalAdvancedHeadingContent,
  CanonicalAdvancedHeadingResponsive,
  CanonicalAdvancedHeadingStyle,
  LegacyAdvancedHeadingProps,
} from './types'
import { deepMerge, isPlainObject, asString, asBoolean, asNumber } from '../../utils/merge'
import type { DeepPartial } from '../../utils/merge'

function asStringOrUndefined(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined
  const str = String(value).trim()
  return str.length > 0 ? str : undefined
}

function asBooleanOrUndefined(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') return undefined
  return Boolean(value)
}

function asNumberOrUndefined(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined
  const num = Number(value)
  return Number.isNaN(num) ? undefined : num
}

function asLevel(value: unknown, fallback: AdvancedHeadingLevel): AdvancedHeadingLevel {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (normalized === 'h1' || normalized === 'h2' || normalized === 'h3' || normalized === 'h4' || normalized === 'h5' || normalized === 'h6') {
    return normalized
  }
  return fallback
}

function asAlignment(value: unknown, fallback: AdvancedHeadingAlignment): AdvancedHeadingAlignment {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (normalized === 'left' || normalized === 'center' || normalized === 'right' || normalized === 'justify') {
    return normalized
  }
  return fallback
}

function asTextTransform(value: unknown, fallback: AdvancedHeadingTextTransform): AdvancedHeadingTextTransform {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (normalized === 'none' || normalized === 'uppercase' || normalized === 'lowercase' || normalized === 'capitalize') {
    return normalized
  }
  return fallback
}

function asTextDecoration(value: unknown, fallback: AdvancedHeadingTextDecoration): AdvancedHeadingTextDecoration {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (normalized === 'none' || normalized === 'underline' || normalized === 'line-through' || normalized === 'overline') {
    return normalized
  }
  return fallback
}

function asFontStyle(value: unknown, fallback: AdvancedHeadingFontStyle): AdvancedHeadingFontStyle {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (normalized === 'normal' || normalized === 'italic' || normalized === 'oblique') {
    return normalized
  }
  return fallback
}

function asHtmlTag(value: unknown, fallback: AdvancedHeadingHtmlTag): AdvancedHeadingHtmlTag {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (normalized === 'auto') return 'auto'
  if (normalized === 'div' || normalized === 'span' || normalized === 'p') return normalized
  if (normalized === 'h1' || normalized === 'h2' || normalized === 'h3' || normalized === 'h4' || normalized === 'h5' || normalized === 'h6') {
    return normalized
  }
  return fallback
}

function compactBoxValues(values: Array<string | undefined>, fallback: string): string {
  return values.map((value) => String(value ?? fallback)).join(' ')
}

function hasStructuredGroups(value: unknown): value is Record<string, unknown> {
  return isPlainObject(value) && ('style' in value || 'highlight' in value || 'seo' in value || 'aria' in value)
}

function hasLegacyStructuredGroups(value: unknown): value is Record<string, unknown> {
  return isPlainObject(value) && ('content' in value || 'layout' in value || 'system' in value)
}

function mapLegacyFlat(input: LegacyAdvancedHeadingProps): DeepPartial<AdvancedHeading> {
      const resolvedFlatAlignment = asAlignment((input as any).alignment ?? input.textAlign ?? (input as any)?.style?.alignment, defaultAdvancedHeadingProps.style.alignment)
      return {
        type: 'advancedheading',
        schemaVersion: 1,
        text: asString(input.text, defaultAdvancedHeadingProps.text),
        level: asLevel(input.level, defaultAdvancedHeadingProps.level),
        style: {
          usePresetStyles: asBoolean(input.usePresetStyles, defaultAdvancedHeadingProps.style.usePresetStyles),
          fontFamily: asString(input.fontFamily, defaultAdvancedHeadingProps.style.fontFamily),
          fontSize: asString(input.fontSize, defaultAdvancedHeadingProps.style.fontSize),
          fontSizeMobile: asString(input.fontSizeMobile ?? input.fontSize, defaultAdvancedHeadingProps.style.fontSizeMobile),
          fontSizeTablet: asString(input.fontSizeTablet ?? input.fontSize, defaultAdvancedHeadingProps.style.fontSizeTablet),
          fontWeight: asString(input.fontWeight, defaultAdvancedHeadingProps.style.fontWeight),
          lineHeight: asString(input.lineHeight, defaultAdvancedHeadingProps.style.lineHeight),
          letterSpacing: asString(input.letterSpacing, defaultAdvancedHeadingProps.style.letterSpacing),
          textTransform: asTextTransform(input.textTransform, defaultAdvancedHeadingProps.style.textTransform),
          textDecoration: asTextDecoration(input.textDecoration, defaultAdvancedHeadingProps.style.textDecoration),
          fontStyle: asFontStyle(input.fontStyle, defaultAdvancedHeadingProps.style.fontStyle),
          color: asString(input.color, defaultAdvancedHeadingProps.style.color),
          hoverColor: asString(input.hoverColor, defaultAdvancedHeadingProps.style.hoverColor),
          alignment: resolvedFlatAlignment,
          textAlignMobile: asAlignment((input as LegacyAdvancedHeadingProps).textAlignMobile ?? (input as any)?.style?.textAlignMobile ?? resolvedFlatAlignment, resolvedFlatAlignment),
          textAlignTablet: asAlignment((input as LegacyAdvancedHeadingProps).textAlignTablet ?? (input as any)?.style?.textAlignTablet ?? resolvedFlatAlignment, resolvedFlatAlignment),
          maxWidth: asString(input.maxWidth, defaultAdvancedHeadingProps.style.maxWidth),
          margin: compactBoxValues([input.marginTop, input.marginRight, input.marginBottom, input.marginLeft], '0'),
          padding: compactBoxValues([input.paddingTop, input.paddingRight, input.paddingBottom, input.paddingLeft], '0'),
        },
        highlight: {
          text: asString(input.highlightText, defaultAdvancedHeadingProps.highlight.text),
          color: asString(input.highlightColor, defaultAdvancedHeadingProps.highlight.color),
        },
        seo: {
          enabled: asBoolean(input.enableSeoChecks, defaultAdvancedHeadingProps.seo.enabled),
          maxLength: asNumber(input.seoMaxLength, defaultAdvancedHeadingProps.seo.maxLength),
        },
        aria: {
          visible: asBoolean(input.visible, defaultAdvancedHeadingProps.aria.visible),
          semanticLevel: asLevel(input.semanticLevel ?? input.level, defaultAdvancedHeadingProps.aria.semanticLevel),
          htmlTag: asHtmlTag(input.htmlTag ?? input.level, defaultAdvancedHeadingProps.aria.htmlTag),
          ariaLevel: input.ariaLevel === undefined ? defaultAdvancedHeadingProps.aria.ariaLevel : asNumber(input.ariaLevel, defaultAdvancedHeadingProps.aria.ariaLevel || 2),
          ariaLabel: asString(input.ariaLabel, defaultAdvancedHeadingProps.aria.ariaLabel),
          role: asString(input.role, defaultAdvancedHeadingProps.aria.role),
          autoId: asBoolean(input.autoId, defaultAdvancedHeadingProps.aria.autoId),
          customId: asString(input.customId, defaultAdvancedHeadingProps.aria.customId),
          className: asString(input.className, defaultAdvancedHeadingProps.aria.className),
          dataTracking: asString(input.dataTracking, defaultAdvancedHeadingProps.aria.dataTracking),
          componentId: asString(input.componentId, defaultAdvancedHeadingProps.aria.componentId),
        },
        meta: {
          migratedFrom: 'legacy-flat',
        },
      }
    }

    function mapLegacyStructured(input: Record<string, unknown>): DeepPartial<AdvancedHeading> {
      const content = isPlainObject(input.content) ? input.content : {}
      const layout = isPlainObject(input.layout) ? input.layout : {}
      const style = isPlainObject(input.style) ? input.style : {}
      const system = isPlainObject(input.system) ? input.system : {}
      const resolvedStructuredAlignment = asAlignment(layout.alignment ?? (style as any)?.alignment ?? input.alignment ?? input.textAlign, defaultAdvancedHeadingProps.style.alignment)
      const resolvedStructuredLevel = asLevel(system.level ?? input.level, defaultAdvancedHeadingProps.level)

      return {
        type: 'advancedheading',
        schemaVersion: 1,
        text: asString(content.text ?? input.text, defaultAdvancedHeadingProps.text),
        level: resolvedStructuredLevel,
        style: {
          usePresetStyles: asBoolean(style.usePresetStyles ?? input.usePresetStyles, defaultAdvancedHeadingProps.style.usePresetStyles),
          fontFamily: asString(style.fontFamily ?? input.fontFamily, defaultAdvancedHeadingProps.style.fontFamily),
          fontSize: asString(style.fontSize ?? input.fontSize, defaultAdvancedHeadingProps.style.fontSize),
          fontSizeMobile: asString(style.fontSizeMobile ?? input.fontSizeMobile ?? style.fontSize ?? input.fontSize, defaultAdvancedHeadingProps.style.fontSizeMobile),
          fontSizeTablet: asString(style.fontSizeTablet ?? input.fontSizeTablet ?? style.fontSize ?? input.fontSize, defaultAdvancedHeadingProps.style.fontSizeTablet),
          fontWeight: asString(style.fontWeight ?? input.fontWeight, defaultAdvancedHeadingProps.style.fontWeight),
          lineHeight: asString(style.lineHeight ?? input.lineHeight, defaultAdvancedHeadingProps.style.lineHeight),
          letterSpacing: asString(style.letterSpacing ?? input.letterSpacing, defaultAdvancedHeadingProps.style.letterSpacing),
          textTransform: asTextTransform(style.textTransform ?? input.textTransform, defaultAdvancedHeadingProps.style.textTransform),
          textDecoration: asTextDecoration(style.textDecoration ?? input.textDecoration, defaultAdvancedHeadingProps.style.textDecoration),
          fontStyle: asFontStyle(style.fontStyle ?? input.fontStyle, defaultAdvancedHeadingProps.style.fontStyle),
          color: asString(style.color ?? input.color ?? input.fontColor, defaultAdvancedHeadingProps.style.color),
          hoverColor: asString(style.hoverColor ?? input.hoverColor, defaultAdvancedHeadingProps.style.hoverColor),
          alignment: resolvedStructuredAlignment,
          textAlignMobile: asAlignment(style.textAlignMobile ?? (layout as any)?.textAlignMobile ?? input.textAlignMobile ?? resolvedStructuredAlignment, resolvedStructuredAlignment),
          textAlignTablet: asAlignment(style.textAlignTablet ?? (layout as any)?.textAlignTablet ?? input.textAlignTablet ?? resolvedStructuredAlignment, resolvedStructuredAlignment),
          maxWidth: asString(layout.maxWidth ?? input.maxWidth, defaultAdvancedHeadingProps.style.maxWidth),
          margin: asString(layout.margin, defaultAdvancedHeadingProps.style.margin),
          padding: asString(layout.padding, defaultAdvancedHeadingProps.style.padding),
        },
        highlight: {
          text: asString(content.highlightText ?? input.highlightText, defaultAdvancedHeadingProps.highlight.text),
          color: asString(content.highlightColor ?? input.highlightColor, defaultAdvancedHeadingProps.highlight.color),
        },
        seo: {
          enabled: asBoolean(system.enableSeoChecks ?? input.enableSeoChecks, defaultAdvancedHeadingProps.seo.enabled),
          maxLength: asNumber(system.seoMaxLength ?? input.seoMaxLength, defaultAdvancedHeadingProps.seo.maxLength),
        },
        aria: {
          visible: asBoolean(system.visible ?? input.visible, defaultAdvancedHeadingProps.aria.visible),
          semanticLevel: asLevel(system.semanticLevel ?? input.semanticLevel ?? resolvedStructuredLevel, defaultAdvancedHeadingProps.aria.semanticLevel),
          htmlTag: asHtmlTag(system.htmlTag ?? input.htmlTag ?? resolvedStructuredLevel, defaultAdvancedHeadingProps.aria.htmlTag),
          ariaLevel: system.ariaLevel === undefined ? (input.ariaLevel === undefined ? defaultAdvancedHeadingProps.aria.ariaLevel : asNumber(input.ariaLevel, defaultAdvancedHeadingProps.aria.ariaLevel || 2)) : asNumber(system.ariaLevel, defaultAdvancedHeadingProps.aria.ariaLevel || 2),
          ariaLabel: asString(system.ariaLabel ?? input.ariaLabel, defaultAdvancedHeadingProps.aria.ariaLabel),
          role: asString(system.role ?? input.role, defaultAdvancedHeadingProps.aria.role),
          autoId: asBoolean(system.autoId ?? input.autoId, defaultAdvancedHeadingProps.aria.autoId),
          customId: asString(system.customId ?? input.customId, defaultAdvancedHeadingProps.aria.customId),
          className: asString(system.className ?? input.className, defaultAdvancedHeadingProps.aria.className),
          dataTracking: asString(system.dataTracking ?? input.dataTracking, defaultAdvancedHeadingProps.aria.dataTracking),
          componentId: asString(system.componentId ?? input.componentId, defaultAdvancedHeadingProps.aria.componentId),
        },
        meta: {
          migratedFrom: 'legacy-structured',
        },
      }
}

export function normalizeAdvancedHeading(input: AdvancedHeadingInput = {}): AdvancedHeading {
  const base = hasLegacyStructuredGroups(input)
    ? mapLegacyStructured(input)
    : hasStructuredGroups(input)
      ? (input as DeepPartial<AdvancedHeading>)
      : mapLegacyFlat(input as LegacyAdvancedHeadingProps)

  const normalized = deepMerge<AdvancedHeading>(defaultAdvancedHeadingProps, base, {
    type: 'advancedheading',
    schemaVersion: 1,
    meta: {
      migratedFrom: hasLegacyStructuredGroups(input)
        ? 'legacy-structured'
        : hasStructuredGroups(input)
          ? 'structured'
          : 'legacy-flat',
    },
  })

  normalized.text = asString(normalized.text, defaultAdvancedHeadingProps.text)
  normalized.level = asLevel(normalized.level, defaultAdvancedHeadingProps.level)
  normalized.style.usePresetStyles = asBoolean(normalized.style.usePresetStyles, defaultAdvancedHeadingProps.style.usePresetStyles)
  normalized.style.fontFamily = asString(normalized.style.fontFamily, defaultAdvancedHeadingProps.style.fontFamily)
  normalized.style.fontSize = asString(normalized.style.fontSize, defaultAdvancedHeadingProps.style.fontSize)
  normalized.style.fontSizeMobile = asString(normalized.style.fontSizeMobile, defaultAdvancedHeadingProps.style.fontSizeMobile)
  normalized.style.fontSizeTablet = asString(normalized.style.fontSizeTablet, defaultAdvancedHeadingProps.style.fontSizeTablet)
  normalized.style.fontWeight = asString(normalized.style.fontWeight, defaultAdvancedHeadingProps.style.fontWeight)
  normalized.style.lineHeight = asString(normalized.style.lineHeight, defaultAdvancedHeadingProps.style.lineHeight)
  normalized.style.letterSpacing = asString(normalized.style.letterSpacing, defaultAdvancedHeadingProps.style.letterSpacing)
  normalized.style.textTransform = asTextTransform(normalized.style.textTransform, defaultAdvancedHeadingProps.style.textTransform)
  normalized.style.textDecoration = asTextDecoration(normalized.style.textDecoration, defaultAdvancedHeadingProps.style.textDecoration)
  normalized.style.fontStyle = asFontStyle(normalized.style.fontStyle, defaultAdvancedHeadingProps.style.fontStyle)
  normalized.style.color = asString(normalized.style.color, defaultAdvancedHeadingProps.style.color)
  normalized.style.hoverColor = asString(normalized.style.hoverColor, defaultAdvancedHeadingProps.style.hoverColor)
  
  const rawAlign = (input as any)?.alignment ?? (input as any)?.textAlign ?? (input as any)?.style?.alignment ?? (base as any)?.style?.alignment ?? (base as any)?.alignment
  normalized.style.alignment = asAlignment(rawAlign ?? normalized.style.alignment, defaultAdvancedHeadingProps.style.alignment)

  const rawMobileAlign = (input as any)?.textAlignMobile ?? (input as any)?.style?.textAlignMobile ?? (base as any)?.style?.textAlignMobile
  normalized.style.textAlignMobile = asAlignment(rawMobileAlign ?? normalized.style.textAlignMobile, defaultAdvancedHeadingProps.style.textAlignMobile)

  const rawTabletAlign = (input as any)?.textAlignTablet ?? (input as any)?.style?.textAlignTablet ?? (base as any)?.style?.textAlignTablet
  normalized.style.textAlignTablet = asAlignment(rawTabletAlign ?? normalized.style.textAlignTablet, defaultAdvancedHeadingProps.style.textAlignTablet)

  normalized.style.maxWidth = asString(normalized.style.maxWidth, defaultAdvancedHeadingProps.style.maxWidth)
  normalized.style.margin = asString(normalized.style.margin, defaultAdvancedHeadingProps.style.margin)
  normalized.style.padding = asString(normalized.style.padding, defaultAdvancedHeadingProps.style.padding)
  normalized.highlight.text = asString(normalized.highlight.text, defaultAdvancedHeadingProps.highlight.text)
  normalized.highlight.color = asString(normalized.highlight.color, defaultAdvancedHeadingProps.highlight.color)
  normalized.seo.enabled = asBoolean(normalized.seo.enabled, defaultAdvancedHeadingProps.seo.enabled)
  normalized.seo.maxLength = asNumber(normalized.seo.maxLength, defaultAdvancedHeadingProps.seo.maxLength)
  normalized.aria.visible = asBoolean(normalized.aria.visible, defaultAdvancedHeadingProps.aria.visible)
  normalized.aria.semanticLevel = asLevel(normalized.aria.semanticLevel, normalized.level)
  normalized.aria.htmlTag = asHtmlTag(normalized.aria.htmlTag, defaultAdvancedHeadingProps.aria.htmlTag)
  normalized.aria.ariaLevel = normalized.aria.ariaLevel === undefined ? defaultAdvancedHeadingProps.aria.ariaLevel : asNumber(normalized.aria.ariaLevel, defaultAdvancedHeadingProps.aria.ariaLevel || 2)
  normalized.aria.ariaLabel = asString(normalized.aria.ariaLabel, defaultAdvancedHeadingProps.aria.ariaLabel)
  normalized.aria.role = asString(normalized.aria.role, defaultAdvancedHeadingProps.aria.role)
  normalized.aria.autoId = asBoolean(normalized.aria.autoId, defaultAdvancedHeadingProps.aria.autoId)
  normalized.aria.customId = asString(normalized.aria.customId, defaultAdvancedHeadingProps.aria.customId)
  normalized.aria.className = asString(normalized.aria.className, defaultAdvancedHeadingProps.aria.className)
  normalized.aria.dataTracking = asString(normalized.aria.dataTracking, defaultAdvancedHeadingProps.aria.dataTracking)
  normalized.aria.componentId = asString(normalized.aria.componentId, defaultAdvancedHeadingProps.aria.componentId)

  const contentInput = (input as any).content && typeof (input as any).content === 'object' ? (input as any).content : {}
  const styleInput = (input as any).style && typeof (input as any).style === 'object' ? (input as any).style : {}
  const responsiveInput = (input as any).responsive && typeof (input as any).responsive === 'object' ? (input as any).responsive : {}

  const rawText = contentInput.text ?? (input as any).text
  const rawLevel = contentInput.level ?? (input as any).level
  const rawHighlightText = contentInput.highlightText ?? (input as any).highlightText ?? (input as any).highlight?.text
  const rawHighlightColor = contentInput.highlightColor ?? (input as any).highlightColor ?? (input as any).highlight?.color
  const rawSeoEnabled = contentInput.seoEnabled ?? (input as any).enableSeoChecks ?? (input as any).seo?.enabled
  const rawSeoMaxLength = contentInput.seoMaxLength ?? (input as any).seoMaxLength ?? (input as any).seo?.maxLength

  const content: CanonicalAdvancedHeadingContent = {}
  if (asStringOrUndefined(rawText) !== undefined) content.text = asStringOrUndefined(rawText)
  if (rawLevel !== undefined) content.level = asLevel(rawLevel, 'h2')
  if (asStringOrUndefined(rawHighlightText) !== undefined) content.highlightText = asStringOrUndefined(rawHighlightText)
  if (asStringOrUndefined(rawHighlightColor) !== undefined) content.highlightColor = asStringOrUndefined(rawHighlightColor)
  if (asBooleanOrUndefined(rawSeoEnabled) !== undefined) content.seoEnabled = asBooleanOrUndefined(rawSeoEnabled)
  if (asNumberOrUndefined(rawSeoMaxLength) !== undefined) content.seoMaxLength = asNumberOrUndefined(rawSeoMaxLength)

  const rawUsePreset = styleInput.usePresetStyles ?? (input as any).usePresetStyles
  const rawFontFamily = styleInput.fontFamily ?? (input as any).fontFamily
  const rawFontSize = styleInput.fontSize ?? (input as any).fontSize
  const rawFontWeight = styleInput.fontWeight ?? (input as any).fontWeight
  const rawLineHeight = styleInput.lineHeight ?? (input as any).lineHeight
  const rawLetterSpacing = styleInput.letterSpacing ?? (input as any).letterSpacing
  const rawTextTransform = styleInput.textTransform ?? (input as any).textTransform
  const rawTextDecoration = styleInput.textDecoration ?? (input as any).textDecoration
  const rawFontStyle = styleInput.fontStyle ?? (input as any).fontStyle
  const rawColor = styleInput.color ?? (input as any).color ?? (input as any).fontColor
  const rawHoverColor = styleInput.hoverColor ?? (input as any).hoverColor
  const rawAlignment = styleInput.alignment ?? (input as any).alignment ?? (input as any).textAlign
  const rawMaxWidth = styleInput.maxWidth ?? (input as any).maxWidth
  const rawMargin = styleInput.margin ?? (input as any).margin
  const rawPadding = styleInput.padding ?? (input as any).padding
  const rawClassName = styleInput.className ?? (input as any).className ?? (input as any).aria?.className
  const rawCustomId = styleInput.customId ?? (input as any).customId ?? (input as any).aria?.customId
  const rawHtmlTag = styleInput.htmlTag ?? (input as any).htmlTag ?? (input as any).aria?.htmlTag
  const rawAriaLevel = styleInput.ariaLevel ?? (input as any).ariaLevel ?? (input as any).aria?.ariaLevel
  const rawAriaLabel = styleInput.ariaLabel ?? (input as any).ariaLabel ?? (input as any).aria?.ariaLabel
  const rawRole = styleInput.role ?? (input as any).role ?? (input as any).aria?.role
  const rawVisible = styleInput.visible ?? (input as any).visible ?? (input as any).aria?.visible

  const style: CanonicalAdvancedHeadingStyle = {}
  if (asBooleanOrUndefined(rawUsePreset) !== undefined) style.usePresetStyles = asBooleanOrUndefined(rawUsePreset)
  if (asStringOrUndefined(rawFontFamily) !== undefined) style.fontFamily = asStringOrUndefined(rawFontFamily)
  if (asStringOrUndefined(rawFontSize) !== undefined) style.fontSize = asStringOrUndefined(rawFontSize)
  if (asStringOrUndefined(rawFontWeight) !== undefined) style.fontWeight = asStringOrUndefined(rawFontWeight)
  if (asStringOrUndefined(rawLineHeight) !== undefined) style.lineHeight = asStringOrUndefined(rawLineHeight)
  if (asStringOrUndefined(rawLetterSpacing) !== undefined) style.letterSpacing = asStringOrUndefined(rawLetterSpacing)
  if (asStringOrUndefined(rawTextTransform) !== undefined) style.textTransform = asTextTransform(rawTextTransform, 'none')
  if (asStringOrUndefined(rawTextDecoration) !== undefined) style.textDecoration = asTextDecoration(rawTextDecoration, 'none')
  if (asStringOrUndefined(rawFontStyle) !== undefined) style.fontStyle = asFontStyle(rawFontStyle, 'normal')
  if (asStringOrUndefined(rawColor) !== undefined) style.color = asStringOrUndefined(rawColor)
  if (asStringOrUndefined(rawHoverColor) !== undefined) style.hoverColor = asStringOrUndefined(rawHoverColor)
  if (asStringOrUndefined(rawAlignment) !== undefined) style.alignment = asAlignment(rawAlignment, 'left')
  if (asStringOrUndefined(rawMaxWidth) !== undefined) style.maxWidth = asStringOrUndefined(rawMaxWidth)
  if (asStringOrUndefined(rawMargin) !== undefined) style.margin = asStringOrUndefined(rawMargin)
  if (asStringOrUndefined(rawPadding) !== undefined) style.padding = asStringOrUndefined(rawPadding)
  if (asStringOrUndefined(rawClassName) !== undefined) style.className = asStringOrUndefined(rawClassName)
  if (asStringOrUndefined(rawCustomId) !== undefined) style.customId = asStringOrUndefined(rawCustomId)
  if (asStringOrUndefined(rawHtmlTag) !== undefined) style.htmlTag = asHtmlTag(rawHtmlTag, 'auto')
  if (asNumberOrUndefined(rawAriaLevel) !== undefined) style.ariaLevel = asNumberOrUndefined(rawAriaLevel)
  if (asStringOrUndefined(rawAriaLabel) !== undefined) style.ariaLabel = asStringOrUndefined(rawAriaLabel)
  if (asStringOrUndefined(rawRole) !== undefined) style.role = asStringOrUndefined(rawRole)
  if (asBooleanOrUndefined(rawVisible) !== undefined) style.visible = asBooleanOrUndefined(rawVisible)

  const rawFontSizeMobile = responsiveInput.fontSizeMobile ?? styleInput.fontSizeMobile ?? (input as any).fontSizeMobile
  const rawFontSizeTablet = responsiveInput.fontSizeTablet ?? styleInput.fontSizeTablet ?? (input as any).fontSizeTablet
  const rawTextAlignMobile = responsiveInput.textAlignMobile ?? styleInput.textAlignMobile ?? (input as any).textAlignMobile
  const rawTextAlignTablet = responsiveInput.textAlignTablet ?? styleInput.textAlignTablet ?? (input as any).textAlignTablet

  const responsive: CanonicalAdvancedHeadingResponsive = {
    ...(asStringOrUndefined(rawFontSizeMobile) !== undefined ? { fontSizeMobile: asStringOrUndefined(rawFontSizeMobile) } : {}),
    ...(asStringOrUndefined(rawFontSizeTablet) !== undefined ? { fontSizeTablet: asStringOrUndefined(rawFontSizeTablet) } : {}),
    ...(asStringOrUndefined(rawTextAlignMobile) !== undefined ? { textAlignMobile: asAlignment(rawTextAlignMobile, 'center') } : {}),
    ...(asStringOrUndefined(rawTextAlignTablet) !== undefined ? { textAlignTablet: asAlignment(rawTextAlignTablet, 'left') } : {}),
    desktop: responsiveInput.desktop && typeof responsiveInput.desktop === 'object' ? responsiveInput.desktop : {},
    tablet: responsiveInput.tablet && typeof responsiveInput.tablet === 'object' ? responsiveInput.tablet : {},
    mobile: responsiveInput.mobile && typeof responsiveInput.mobile === 'object' ? responsiveInput.mobile : {},
  }

  normalized.version = 1
  normalized.content = content
  normalized.style = style as any
  normalized.responsive = responsive

  return normalized
}
