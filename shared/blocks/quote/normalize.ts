import { defaultQuoteProps } from './defaults'
import type {
  CanonicalQuoteContent,
  CanonicalQuoteProps,
  CanonicalQuoteResponsive,
  CanonicalQuoteStyle,
  QuoteProps,
} from './types'

function asStringOrUndefined(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined
  const str = String(value).trim()
  return str.length > 0 ? str : undefined
}

export function normalizeQuote(props: Record<string, any> = {}): QuoteProps {
  const contentInput = props.content && typeof props.content === 'object' ? props.content : {}
  const styleInput = props.style && typeof props.style === 'object' ? props.style : {}
  const responsiveInput = props.responsive && typeof props.responsive === 'object' ? props.responsive : {}

  const rawText =
    contentInput.text ??
    (typeof props.content === 'string' ? props.content : undefined) ??
    props.text
  const text = asStringOrUndefined(rawText)

  const rawAuthor = contentInput.author ?? props.author ?? props.caption
  const author = asStringOrUndefined(rawAuthor)

  const content: CanonicalQuoteContent = {}
  if (text !== undefined) content.text = text
  if (author !== undefined) content.author = author

  const rawAlign =
    styleInput.align ??
    styleInput.alignment ??
    styleInput.textAlign ??
    props.align ??
    props.alignment ??
    props.textAlign
  const align = asStringOrUndefined(rawAlign)

  const rawMargin = styleInput.margin ?? props.margin
  const margin = asStringOrUndefined(rawMargin)

  const rawColor = styleInput.color ?? props.color
  const color = asStringOrUndefined(rawColor)

  const rawFontSize = styleInput.fontSize ?? props.fontSize
  const fontSize = asStringOrUndefined(rawFontSize)

  const rawLineHeight = styleInput.lineHeight ?? props.lineHeight
  const lineHeight = asStringOrUndefined(rawLineHeight)

  const rawClassName = styleInput.className ?? props.className
  const className = asStringOrUndefined(rawClassName)

  const style: CanonicalQuoteStyle = {}
  if (align !== undefined) {
    style.align = align
    style.alignment = align
    style.textAlign = align
  }
  if (margin !== undefined) style.margin = margin
  if (color !== undefined) style.color = color
  if (fontSize !== undefined) style.fontSize = fontSize
  if (lineHeight !== undefined) style.lineHeight = lineHeight
  if (className !== undefined) style.className = className

  const responsive: CanonicalQuoteResponsive = {
    desktop: responsiveInput.desktop && typeof responsiveInput.desktop === 'object' ? responsiveInput.desktop : {},
    tablet: responsiveInput.tablet && typeof responsiveInput.tablet === 'object' ? responsiveInput.tablet : {},
    mobile: responsiveInput.mobile && typeof responsiveInput.mobile === 'object' ? responsiveInput.mobile : {},
  }

  return {
    ...defaultQuoteProps,
    ...props,
    version: 1,
    content,
    style,
    responsive,
    text: text ?? defaultQuoteProps.text,
    author: author ?? defaultQuoteProps.author,
    align: align ?? defaultQuoteProps.align,
    alignment: align ?? defaultQuoteProps.align,
    textAlign: align ?? defaultQuoteProps.align,
    margin: margin ?? defaultQuoteProps.margin,
    color: color ?? defaultQuoteProps.color,
    fontSize: fontSize ?? defaultQuoteProps.fontSize,
    lineHeight: lineHeight ?? defaultQuoteProps.lineHeight,
    className: className ?? '',
  }
}
