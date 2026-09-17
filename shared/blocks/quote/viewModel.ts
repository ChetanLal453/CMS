import { normalizeQuote } from './normalize'
import type { QuoteViewModel } from './types'

export function createQuoteViewModel(props: Record<string, any> = {}): QuoteViewModel {
  const normalized = normalizeQuote(props)

  return {
    text: String(normalized.text || ''),
    author: String(normalized.author || ''),
    align: String(normalized.align || 'center'),
    margin: String(normalized.margin || '20px 0'),
    color: String(normalized.color || '#374151'),
    fontSize: String(normalized.fontSize || '18px'),
    lineHeight: String(normalized.lineHeight || '1.7'),
    className: String(normalized.className || ''),
    hasText: Boolean(String(normalized.text || '').trim()),
    hasAuthor: Boolean(String(normalized.author || '').trim()),
  }
}
