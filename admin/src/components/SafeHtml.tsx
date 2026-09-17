'use client'

import type { CSSProperties } from 'react'
import { useMemo } from 'react'
import { sanitizeHtml, sanitizeSvgMarkup } from '@/lib/sanitize-markup'

interface SafeHtmlProps {
  html: string
  className?: string
  style?: CSSProperties
  tagName?: keyof JSX.IntrinsicElements
  mode?: 'html' | 'svg'
  [key: string]: any
}

export default function SafeHtml({
  html,
  className,
  style,
  tagName = 'div',
  mode = 'html',
  ...rest
}: SafeHtmlProps) {
  const sanitizedMarkup = useMemo(
    () => (mode === 'svg' ? sanitizeSvgMarkup(html) : sanitizeHtml(html)),
    [html, mode],
  )
  const TagName = tagName

  // Security: all rich markup is sanitized through an explicit allowlist before render.
  return <TagName {...rest} className={className} style={style} dangerouslySetInnerHTML={{ __html: sanitizedMarkup }} />
}
