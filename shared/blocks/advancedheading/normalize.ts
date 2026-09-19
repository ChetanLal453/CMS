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
  LegacyAdvancedHeadingProps,
} from './types'
import { deepMerge, isPlainObject, asString, asBoolean, asNumber } from '../../utils/merge'
import type { DeepPartial } from '../../utils/merge'


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

  return normalized
}
