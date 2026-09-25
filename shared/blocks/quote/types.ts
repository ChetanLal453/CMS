export interface CanonicalQuoteContent {
  text?: string
  author?: string
}

export interface CanonicalQuoteStyle {
  align?: 'left' | 'center' | 'right' | string
  alignment?: 'left' | 'center' | 'right' | string
  textAlign?: 'left' | 'center' | 'right' | string
  margin?: string
  color?: string
  fontSize?: string
  lineHeight?: string
  className?: string
}

export interface CanonicalQuoteResponsive {
  desktop?: Record<string, any>
  tablet?: Record<string, any>
  mobile?: Record<string, any>
}

export interface CanonicalQuoteProps {
  version?: number
  content?: CanonicalQuoteContent
  style?: CanonicalQuoteStyle
  responsive?: CanonicalQuoteResponsive
}

export type QuoteProps = CanonicalQuoteProps & {
  text?: string
  author?: string
  caption?: string
  align?: 'left' | 'center' | 'right' | string
  alignment?: 'left' | 'center' | 'right' | string
  textAlign?: 'left' | 'center' | 'right' | string
  margin?: string
  color?: string
  fontSize?: string
  lineHeight?: string
  className?: string
  [key: string]: any
}

export type QuoteViewModel = {
  text: string
  author: string
  align: string
  margin: string
  color: string
  fontSize: string
  lineHeight: string
  className: string
  hasText: boolean
  hasAuthor: boolean
}
