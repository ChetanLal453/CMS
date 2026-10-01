'use client'

import React, { useState, useEffect } from 'react'
import SafeHtml from '@/components/SafeHtml'
import { sanitizeHtml } from '@/lib/sanitize-markup'

interface RichTextProps {
  content?: string
  placeholder?: string
  editable?: boolean
  onUpdate?: (content: string) => void
  className?: string
  style?: React.CSSProperties
}

const RichText: React.FC<RichTextProps> = ({
  content = '',
  placeholder = 'Start writing your rich text content here...',
  editable = true,
  onUpdate,
  className = '',
  style = {}
}) => {
  const [currentContent, setCurrentContent] = useState(content)

  useEffect(() => {
    setCurrentContent(content)
  }, [content])

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    // Security: sanitize editor HTML before storing or propagating it.
    const newContent = sanitizeHtml(e.currentTarget.innerHTML)
    setCurrentContent(newContent)
    onUpdate?.(newContent)
  }

  const defaultStyle: React.CSSProperties = {
    minHeight: '200px',
    padding: '16px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    outline: 'none',
    backgroundColor: 'white',
    fontFamily: 'inherit',
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#333333',
    ...style
  }

  if (!editable) {
    return (
      <SafeHtml
        html={currentContent || placeholder}
        className={`prose prose-sm max-w-none ${className}`}
        style={defaultStyle}
      />
    )
  }

  return (
    <div
      contentEditable
      suppressContentEditableWarning
      className={`prose prose-sm max-w-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${className}`}
      style={defaultStyle}
      onInput={handleInput}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(currentContent || `<p>${placeholder}</p>`) }}
      data-placeholder={placeholder}
    />
  )
}

export default RichText
