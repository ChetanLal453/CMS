import { normalizeQuote } from './normalize'
import type { QuoteViewModel } from './types'

export function createQuoteViewModel(props: Record<string, any> = {}): QuoteViewModel {
  const normalized = normalizeQuote(props)

  const text = String(normalized.content?.text || normalized.text || '')
  const author = String(normalized.content?.author || normalized.author || '')
  const align = String(normalized.style?.align || normalized.align || 'center')
  const margin = String(normalized.style?.margin || normalized.margin || '20px 0')
  const color = String(normalized.style?.color || normalized.color || '#374151')
  const fontSize = String(normalized.style?.fontSize || normalized.fontSize || '18px')
  const lineHeight = String(normalized.style?.lineHeight || normalized.lineHeight || '1.7')
  const className = String(normalized.style?.className || normalized.className || '')

  return {
    text,
    author,
    align,
    margin,
    color,
    fontSize,
    lineHeight,
    className,
    hasText: Boolean(text.trim()),
    hasAuthor: Boolean(author.trim()),
  }
}
