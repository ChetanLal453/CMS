import { defaultQuoteProps } from './defaults'
import type { QuoteProps } from './types'

function asString(value: unknown, fallback: string) {
  const normalized = String(value ?? '').trim()
  return normalized || fallback
}

export function normalizeQuote(props: Record<string, any> = {}): QuoteProps {
  const text = asString(props.text ?? props.content, defaultQuoteProps.text || '')
  const author = asString(props.author ?? props.caption, defaultQuoteProps.author || '')

  return {
    ...defaultQuoteProps,
    ...props,
    text,
    content: text,
    author,
    caption: author,
    align: asString(props.align, defaultQuoteProps.align || 'center'),
    margin: asString(props.margin, defaultQuoteProps.margin || '20px 0'),
    color: asString(props.color, defaultQuoteProps.color || '#374151'),
    fontSize: asString(props.fontSize, defaultQuoteProps.fontSize || '18px'),
    lineHeight: asString(props.lineHeight, defaultQuoteProps.lineHeight || '1.7'),
    className: asString(props.className, defaultQuoteProps.className || ''),
  }
}
