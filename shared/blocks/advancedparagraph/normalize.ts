import { defaultAdvancedParagraphProps } from './defaults'
import type {
  AdvancedParagraph,
  AdvancedParagraphAlignment,
  AdvancedParagraphFontStyle,
  AdvancedParagraphInput,
  AdvancedParagraphTextDecoration,
  AdvancedParagraphTextTransform,
  DeepPartial,
  LegacyAdvancedParagraphProps,
} from './types'

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]'
}

function cloneValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item)) as T
  }

  if (isPlainObject(value)) {
    const output: Record<string, unknown> = {}
    Object.entries(value).forEach(([key, nestedValue]) => {
      output[key] = cloneValue(nestedValue)
    })
    return output as T
  }

  return value
}

function deepMerge<T>(...sources: Array<DeepPartial<T> | T | undefined>): T {
  const result: Record<string, unknown> = {}

  sources.forEach((source) => {
    if (!source || !isPlainObject(source)) {
      return
    }

    Object.entries(source).forEach(([key, value]) => {
      const current = result[key]

      if (Array.isArray(value)) {
        result[key] = value.map((item) => cloneValue(item))
        return
      }

      if (isPlainObject(value)) {
        result[key] = isPlainObject(current)
          ? deepMerge(current as Record<string, unknown>, value as Record<string, unknown>)
          : deepMerge({}, value as Record<string, unknown>)
        return
      }

      if (value !== undefined) {
        result[key] = value
      }
    })
  })

  return result as T
}

function asString(value: unknown, fallback: string): string {
  const normalized = String(value ?? '').trim()
  return normalized || fallback
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  if (value === undefined || value === null) {
    return fallback
  }

  if (typeof value === 'boolean') {
    return value
  }

  const normalized = String(value).trim().toLowerCase()
  if (!normalized) {
    return fallback
  }

  if (['true', '1', 'yes', 'on'].includes(normalized)) return true
  if (['false', '0', 'no', 'off'].includes(normalized)) return false
  return Boolean(value)
}

function asNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  const parsed = Number.parseFloat(String(value ?? '').trim())
  return Number.isFinite(parsed) ? parsed : fallback
}

function asStringArray(value: unknown, fallback: string[]): string[] {
  if (Array.isArray(value)) {
    const normalized = value
      .map((item) => String(item ?? '').trim())
      .filter(Boolean)

    return normalized.length ? normalized : [...fallback]
  }

  if (typeof value === 'string') {
    const normalized = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

    return normalized.length ? normalized : [...fallback]
  }

  return [...fallback]
}

function asAlignment(value: unknown, fallback: AdvancedParagraphAlignment): AdvancedParagraphAlignment {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (normalized === 'left' || normalized === 'center' || normalized === 'right' || normalized === 'justify') {
    return normalized
  }
  return fallback
}

function asTextTransform(value: unknown, fallback: AdvancedParagraphTextTransform): AdvancedParagraphTextTransform {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (normalized === 'none' || normalized === 'uppercase' || normalized === 'lowercase' || normalized === 'capitalize') {
    return normalized
  }
  return fallback
}

function asTextDecoration(value: unknown, fallback: AdvancedParagraphTextDecoration): AdvancedParagraphTextDecoration {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (normalized === 'none' || normalized === 'underline' || normalized === 'line-through' || normalized === 'overline') {
    return normalized
  }
  return fallback
}

function asFontStyle(value: unknown, fallback: AdvancedParagraphFontStyle): AdvancedParagraphFontStyle {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (normalized === 'normal' || normalized === 'italic' || normalized === 'oblique') {
    return normalized
  }
  return fallback
}

function compactBoxValues(values: Array<string | undefined>, fallback: string): string {
  return values.map((value) => String(value ?? fallback)).join(' ')
}

function hasStructuredGroups(value: unknown): value is Record<string, unknown> {
  return isPlainObject(value) && ('content' in value || 'layout' in value || 'style' in value || 'interaction' in value || 'aria' in value)
}

function hasLegacyStructuredGroups(value: unknown): value is Record<string, unknown> {
  return isPlainObject(value) && ('system' in value)
}

function resolveLegacyText(input: LegacyAdvancedParagraphProps): string {
  const sources = [input.content, input.html, input.text]
  const match = sources.find((value) => typeof value === 'string' && value.trim())
  return String(match ?? '')
}

function mapLegacyFlat(input: LegacyAdvancedParagraphProps): DeepPartial<AdvancedParagraph> {
  return {
    type: 'advancedparagraph',
    schemaVersion: 1,
    content: {
      text: resolveLegacyText(input),
    },
    layout: {
      alignment: asAlignment(input.textAlign ?? input.align, defaultAdvancedParagraphProps.layout.alignment),
    },
    style: {
      color: asString(input.textColor ?? input.fontColor ?? input.color, defaultAdvancedParagraphProps.style.color),
      fontSize: asString(input.fontSize, defaultAdvancedParagraphProps.style.fontSize),
      fontWeight: asString(input.fontWeight, defaultAdvancedParagraphProps.style.fontWeight),
      fontFamily: asString(input.fontFamily, defaultAdvancedParagraphProps.style.fontFamily),
      lineHeight: asString(input.lineHeight, defaultAdvancedParagraphProps.style.lineHeight),
      lineHeightMobile: asString(input.lineHeightMobile, defaultAdvancedParagraphProps.style.lineHeightMobile),
      letterSpacing: asString(input.letterSpacing, defaultAdvancedParagraphProps.style.letterSpacing),
      maxWidth: asString(input.maxWidth, defaultAdvancedParagraphProps.style.maxWidth),
      backgroundColor: asString(input.backgroundColor, defaultAdvancedParagraphProps.style.backgroundColor),
      margin:
        input.margin ||
        compactBoxValues([input.marginTop, input.marginRight, input.marginBottom, input.marginLeft], '0'),
      padding:
        input.padding ||
        compactBoxValues([input.paddingTop, input.paddingRight, input.paddingBottom, input.paddingLeft], '0'),
      width: asString(input.width, defaultAdvancedParagraphProps.style.width),
      minHeight: asString(input.minHeight, defaultAdvancedParagraphProps.style.minHeight),
      display: asString(input.display, defaultAdvancedParagraphProps.style.display) as AdvancedParagraph['style']['display'],
      border: asString(input.border, defaultAdvancedParagraphProps.style.border),
      borderRadius: asString(input.borderRadius, defaultAdvancedParagraphProps.style.borderRadius),
      borderColor: asString(input.borderColor, defaultAdvancedParagraphProps.style.borderColor),
      textShadow: asString(input.textShadow, defaultAdvancedParagraphProps.style.textShadow),
      boxShadow: asString(input.boxShadow, defaultAdvancedParagraphProps.style.boxShadow),
      opacity: asNumber(input.opacity, defaultAdvancedParagraphProps.style.opacity),
      fontSizeMobile: asString(input.fontSizeMobile, defaultAdvancedParagraphProps.style.fontSizeMobile),
      fontSizeTablet: asString(input.fontSizeTablet, defaultAdvancedParagraphProps.style.fontSizeTablet),
      textAlignMobile: asAlignment(input.textAlignMobile, defaultAdvancedParagraphProps.style.textAlignMobile),
      textAlignTablet: asAlignment(input.textAlignTablet, defaultAdvancedParagraphProps.style.textAlignTablet),
      textTransform: asTextTransform(input.textTransform, defaultAdvancedParagraphProps.style.textTransform),
      textDecoration: asTextDecoration(input.textDecoration, defaultAdvancedParagraphProps.style.textDecoration),
      fontStyle: asFontStyle(input.fontStyle, defaultAdvancedParagraphProps.style.fontStyle),
      transition: asString(input.transition, defaultAdvancedParagraphProps.style.transition),
    },
    interaction: {
      hover: {
        effect: input.hoverEffect ?? defaultAdvancedParagraphProps.interaction.hover.effect,
        color: asString(input.hoverTextColor ?? input.hoverColor, defaultAdvancedParagraphProps.interaction.hover.color),
        backgroundColor: asString(input.hoverBackgroundColor, defaultAdvancedParagraphProps.interaction.hover.backgroundColor),
      },
    },
    aria: {
      visible: asBoolean(input.visible, defaultAdvancedParagraphProps.aria.visible),
      ariaLabel: asString(input.ariaLabel, defaultAdvancedParagraphProps.aria.ariaLabel),
      role: asString(input.role, defaultAdvancedParagraphProps.aria.role),
      tabIndex: asNumber(input.tabIndex, defaultAdvancedParagraphProps.aria.tabIndex),
      className: asString(input.className, defaultAdvancedParagraphProps.aria.className),
      customId: asString(input.customId, defaultAdvancedParagraphProps.aria.customId),
      selectable: asBoolean(input.selectable, defaultAdvancedParagraphProps.aria.selectable),
      editable: asBoolean(input.editable, defaultAdvancedParagraphProps.aria.editable),
      truncate: asBoolean(input.truncate, defaultAdvancedParagraphProps.aria.truncate),
      maxLines: input.maxLines === undefined ? defaultAdvancedParagraphProps.aria.maxLines : asNumber(input.maxLines, 0),
      enableRichText: asBoolean(input.enableRichText, defaultAdvancedParagraphProps.aria.enableRichText),
      allowedFormats: asStringArray(input.allowedFormats, defaultAdvancedParagraphProps.aria.allowedFormats),
      componentId: asString(input.componentId, defaultAdvancedParagraphProps.aria.componentId),
    },
    meta: {
      migratedFrom: 'legacy-flat',
    },
  }
}

function mapLegacyStructured(input: Record<string, unknown>): DeepPartial<AdvancedParagraph> {
  const content = isPlainObject(input.content) ? input.content : {}
  const layout = isPlainObject(input.layout) ? input.layout : {}
  const style = isPlainObject(input.style) ? input.style : {}
  const interaction = isPlainObject(input.interaction) ? input.interaction : {}
  const hover = isPlainObject(interaction.hover) ? interaction.hover : {}
  const system = isPlainObject((input as Record<string, unknown>).system) ? (input as Record<string, unknown>).system : {}

  return {
    type: 'advancedparagraph',
    schemaVersion: 1,
    content: {
      text: asString(content.text ?? input.text ?? input.content ?? input.html, defaultAdvancedParagraphProps.content.text),
    },
    layout: {
      alignment: asAlignment(layout.alignment ?? input.textAlign ?? input.align, defaultAdvancedParagraphProps.layout.alignment),
    },
    style: {
      color: asString(style.color ?? input.textColor ?? input.fontColor ?? input.color, defaultAdvancedParagraphProps.style.color),
      fontSize: asString(style.fontSize ?? input.fontSize, defaultAdvancedParagraphProps.style.fontSize),
      fontWeight: asString(style.fontWeight ?? input.fontWeight, defaultAdvancedParagraphProps.style.fontWeight),
      fontFamily: asString(style.fontFamily ?? input.fontFamily, defaultAdvancedParagraphProps.style.fontFamily),
      lineHeight: asString(style.lineHeight ?? input.lineHeight, defaultAdvancedParagraphProps.style.lineHeight),
      lineHeightMobile: asString(style.lineHeightMobile ?? input.lineHeightMobile, defaultAdvancedParagraphProps.style.lineHeightMobile),
      letterSpacing: asString(style.letterSpacing ?? input.letterSpacing, defaultAdvancedParagraphProps.style.letterSpacing),
      maxWidth: asString(style.maxWidth ?? input.maxWidth, defaultAdvancedParagraphProps.style.maxWidth),
      backgroundColor: asString(style.backgroundColor ?? input.backgroundColor, defaultAdvancedParagraphProps.style.backgroundColor),
      margin: asString(style.margin ?? layout.margin, defaultAdvancedParagraphProps.style.margin),
      padding: asString(style.padding ?? layout.padding, defaultAdvancedParagraphProps.style.padding),
      width: asString(style.width ?? input.width, defaultAdvancedParagraphProps.style.width),
      minHeight: asString(style.minHeight ?? input.minHeight, defaultAdvancedParagraphProps.style.minHeight),
      display: asString(style.display ?? input.display, defaultAdvancedParagraphProps.style.display) as AdvancedParagraph['style']['display'],
      border: asString(style.border ?? input.border, defaultAdvancedParagraphProps.style.border),
      borderRadius: asString(style.borderRadius ?? input.borderRadius, defaultAdvancedParagraphProps.style.borderRadius),
      borderColor: asString(style.borderColor ?? input.borderColor, defaultAdvancedParagraphProps.style.borderColor),
      textShadow: asString(style.textShadow ?? input.textShadow, defaultAdvancedParagraphProps.style.textShadow),
      boxShadow: asString(style.boxShadow ?? input.boxShadow, defaultAdvancedParagraphProps.style.boxShadow),
      opacity: asNumber(style.opacity ?? input.opacity, defaultAdvancedParagraphProps.style.opacity),
      fontSizeMobile: asString(style.fontSizeMobile ?? input.fontSizeMobile, defaultAdvancedParagraphProps.style.fontSizeMobile),
      fontSizeTablet: asString(style.fontSizeTablet ?? input.fontSizeTablet, defaultAdvancedParagraphProps.style.fontSizeTablet),
      textAlignMobile: asAlignment(style.textAlignMobile ?? input.textAlignMobile, defaultAdvancedParagraphProps.style.textAlignMobile),
      textAlignTablet: asAlignment(style.textAlignTablet ?? input.textAlignTablet, defaultAdvancedParagraphProps.style.textAlignTablet),
      textTransform: asTextTransform(style.textTransform ?? input.textTransform, defaultAdvancedParagraphProps.style.textTransform),
      textDecoration: asTextDecoration(style.textDecoration ?? input.textDecoration, defaultAdvancedParagraphProps.style.textDecoration),
      fontStyle: asFontStyle(style.fontStyle ?? input.fontStyle, defaultAdvancedParagraphProps.style.fontStyle),
      transition: asString(style.transition ?? input.transition, defaultAdvancedParagraphProps.style.transition),
    },
    interaction: {
      hover: {
        effect: (hover.effect as AdvancedParagraph['interaction']['hover']['effect']) || (input.hoverEffect as AdvancedParagraph['interaction']['hover']['effect']) || defaultAdvancedParagraphProps.interaction.hover.effect,
        color: asString(hover.color ?? input.hoverTextColor ?? input.hoverColor, defaultAdvancedParagraphProps.interaction.hover.color),
        backgroundColor: asString(hover.backgroundColor ?? input.hoverBackgroundColor, defaultAdvancedParagraphProps.interaction.hover.backgroundColor),
      },
    },
    aria: {
      visible: asBoolean(system.visible ?? input.visible, defaultAdvancedParagraphProps.aria.visible),
      ariaLabel: asString(system.ariaLabel ?? input.ariaLabel, defaultAdvancedParagraphProps.aria.ariaLabel),
      role: asString(system.role ?? input.role, defaultAdvancedParagraphProps.aria.role),
      tabIndex: asNumber(system.tabIndex ?? input.tabIndex, defaultAdvancedParagraphProps.aria.tabIndex),
      className: asString(system.className ?? input.className, defaultAdvancedParagraphProps.aria.className),
      customId: asString(system.customId ?? input.customId, defaultAdvancedParagraphProps.aria.customId),
      selectable: asBoolean(system.selectable ?? input.selectable, defaultAdvancedParagraphProps.aria.selectable),
      editable: asBoolean(system.editable ?? input.editable, defaultAdvancedParagraphProps.aria.editable),
      truncate: asBoolean(system.truncate ?? input.truncate, defaultAdvancedParagraphProps.aria.truncate),
      maxLines: system.maxLines === undefined
        ? (input.maxLines === undefined ? defaultAdvancedParagraphProps.aria.maxLines : asNumber(input.maxLines, 0))
        : asNumber(system.maxLines, 0),
      enableRichText: asBoolean(system.enableRichText ?? input.enableRichText, defaultAdvancedParagraphProps.aria.enableRichText),
      allowedFormats: asStringArray(system.allowedFormats ?? input.allowedFormats, defaultAdvancedParagraphProps.aria.allowedFormats),
      componentId: asString(system.componentId ?? input.componentId, defaultAdvancedParagraphProps.aria.componentId),
    },
    meta: {
      migratedFrom: 'legacy-structured',
    },
  }
}

export function normalizeAdvancedParagraph(input: AdvancedParagraphInput = {}): AdvancedParagraph {
  const base = hasLegacyStructuredGroups(input)
    ? mapLegacyStructured(input)
    : hasStructuredGroups(input)
      ? (input as DeepPartial<AdvancedParagraph>)
      : mapLegacyFlat(input as LegacyAdvancedParagraphProps)

  const normalized = deepMerge<AdvancedParagraph>(defaultAdvancedParagraphProps, base, {
    type: 'advancedparagraph',
    schemaVersion: 1,
    meta: {
      migratedFrom: hasLegacyStructuredGroups(input)
        ? 'legacy-structured'
        : hasStructuredGroups(input)
          ? 'structured'
          : 'legacy-flat',
    },
  })

  normalized.content.text = asString(normalized.content.text, defaultAdvancedParagraphProps.content.text)
  normalized.layout.alignment = asAlignment(normalized.layout.alignment, defaultAdvancedParagraphProps.layout.alignment)
  normalized.style.color = asString(normalized.style.color, defaultAdvancedParagraphProps.style.color)
  normalized.style.fontSize = asString(normalized.style.fontSize, defaultAdvancedParagraphProps.style.fontSize)
  normalized.style.fontWeight = asString(normalized.style.fontWeight, defaultAdvancedParagraphProps.style.fontWeight)
  normalized.style.fontFamily = asString(normalized.style.fontFamily, defaultAdvancedParagraphProps.style.fontFamily)
  normalized.style.lineHeight = asString(normalized.style.lineHeight, defaultAdvancedParagraphProps.style.lineHeight)
  normalized.style.lineHeightMobile = asString(normalized.style.lineHeightMobile, defaultAdvancedParagraphProps.style.lineHeightMobile)
  normalized.style.letterSpacing = asString(normalized.style.letterSpacing, defaultAdvancedParagraphProps.style.letterSpacing)
  normalized.style.maxWidth = asString(normalized.style.maxWidth, defaultAdvancedParagraphProps.style.maxWidth)
  normalized.style.backgroundColor = asString(normalized.style.backgroundColor, defaultAdvancedParagraphProps.style.backgroundColor)
  normalized.style.margin = asString(normalized.style.margin, defaultAdvancedParagraphProps.style.margin)
  normalized.style.padding = asString(normalized.style.padding, defaultAdvancedParagraphProps.style.padding)
  normalized.style.width = asString(normalized.style.width, defaultAdvancedParagraphProps.style.width)
  normalized.style.minHeight = asString(normalized.style.minHeight, defaultAdvancedParagraphProps.style.minHeight)
  normalized.style.display = asString(normalized.style.display, defaultAdvancedParagraphProps.style.display) as AdvancedParagraph['style']['display']
  normalized.style.border = asString(normalized.style.border, defaultAdvancedParagraphProps.style.border)
  normalized.style.borderRadius = asString(normalized.style.borderRadius, defaultAdvancedParagraphProps.style.borderRadius)
  normalized.style.borderColor = asString(normalized.style.borderColor, defaultAdvancedParagraphProps.style.borderColor)
  normalized.style.textShadow = asString(normalized.style.textShadow, defaultAdvancedParagraphProps.style.textShadow)
  normalized.style.boxShadow = asString(normalized.style.boxShadow, defaultAdvancedParagraphProps.style.boxShadow)
  normalized.style.opacity = asNumber(normalized.style.opacity, defaultAdvancedParagraphProps.style.opacity)
  normalized.style.fontSizeMobile = asString(normalized.style.fontSizeMobile, defaultAdvancedParagraphProps.style.fontSizeMobile)
  normalized.style.fontSizeTablet = asString(normalized.style.fontSizeTablet, defaultAdvancedParagraphProps.style.fontSizeTablet)
  normalized.style.textAlignMobile = asAlignment(normalized.style.textAlignMobile, defaultAdvancedParagraphProps.style.textAlignMobile)
  normalized.style.textAlignTablet = asAlignment(normalized.style.textAlignTablet, defaultAdvancedParagraphProps.style.textAlignTablet)
  normalized.style.textTransform = asTextTransform(normalized.style.textTransform, defaultAdvancedParagraphProps.style.textTransform)
  normalized.style.textDecoration = asTextDecoration(normalized.style.textDecoration, defaultAdvancedParagraphProps.style.textDecoration)
  normalized.style.fontStyle = asFontStyle(normalized.style.fontStyle, defaultAdvancedParagraphProps.style.fontStyle)
  normalized.style.transition = asString(normalized.style.transition, defaultAdvancedParagraphProps.style.transition)
  normalized.interaction.hover.effect = normalized.interaction.hover.effect || defaultAdvancedParagraphProps.interaction.hover.effect
  normalized.interaction.hover.color = asString(normalized.interaction.hover.color, defaultAdvancedParagraphProps.interaction.hover.color)
  normalized.interaction.hover.backgroundColor = asString(normalized.interaction.hover.backgroundColor, defaultAdvancedParagraphProps.interaction.hover.backgroundColor)
  normalized.aria.visible = asBoolean(normalized.aria.visible, defaultAdvancedParagraphProps.aria.visible)
  normalized.aria.ariaLabel = asString(normalized.aria.ariaLabel, defaultAdvancedParagraphProps.aria.ariaLabel)
  normalized.aria.role = asString(normalized.aria.role, defaultAdvancedParagraphProps.aria.role)
  normalized.aria.tabIndex = asNumber(normalized.aria.tabIndex, defaultAdvancedParagraphProps.aria.tabIndex)
  normalized.aria.className = asString(normalized.aria.className, defaultAdvancedParagraphProps.aria.className)
  normalized.aria.customId = asString(normalized.aria.customId, defaultAdvancedParagraphProps.aria.customId)
  normalized.aria.selectable = asBoolean(normalized.aria.selectable, defaultAdvancedParagraphProps.aria.selectable)
  normalized.aria.editable = asBoolean(normalized.aria.editable, defaultAdvancedParagraphProps.aria.editable)
  normalized.aria.truncate = asBoolean(normalized.aria.truncate, defaultAdvancedParagraphProps.aria.truncate)
  normalized.aria.maxLines = normalized.aria.maxLines === undefined ? defaultAdvancedParagraphProps.aria.maxLines : asNumber(normalized.aria.maxLines, 0)
  normalized.aria.enableRichText = asBoolean(normalized.aria.enableRichText, defaultAdvancedParagraphProps.aria.enableRichText)
  normalized.aria.allowedFormats = asStringArray(normalized.aria.allowedFormats, defaultAdvancedParagraphProps.aria.allowedFormats)
  normalized.aria.componentId = asString(normalized.aria.componentId, defaultAdvancedParagraphProps.aria.componentId)

  return normalized
}
