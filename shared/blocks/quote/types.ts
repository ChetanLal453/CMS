export type QuoteProps = {
  text?: string
  content?: string
  author?: string
  caption?: string
  align?: 'left' | 'center' | 'right' | string
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
