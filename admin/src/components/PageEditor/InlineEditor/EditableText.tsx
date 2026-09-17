'use client'

import React, { useState, useRef, useEffect } from 'react'
import { InlineEditor } from './index'

interface EditableTextProps {
  text: string
  onChange: (text: string) => void
  tag?: keyof JSX.IntrinsicElements
  className?: string
  placeholder?: string
  multiline?: boolean
}

export const EditableText: React.FC<EditableTextProps> = ({
  text,
  onChange,
  tag: Tag = 'div',
  className = '',
  placeholder = 'Click to edit text...',
  multiline = false
}) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <InlineEditor
        value={text}
        onChange={onChange}
        placeholder={placeholder}
        multiline={multiline}
        className={className}
      />
      {isHovered && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center opacity-75">
          <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
      )}
    </div>
  )
}

export default EditableText
