'use client'

import React, { useRef, useEffect } from 'react'

interface CSSEditorProps {
  value: string
  onChange: (value: string) => void
}

export const CSSEditor: React.FC<CSSEditorProps> = ({
  value,
  onChange
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      // Auto-resize textarea
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  const formatCSS = () => {
    // Basic CSS formatting
    try {
      const formatted = value
        .replace(/;\s*/g, ';\n  ')
        .replace(/{\s*/g, '{\n  ')
        .replace(/}\s*/g, '\n}\n')
        .replace(/\n\s*\n/g, '\n')
        .trim()

      onChange(formatted)
    } catch (error) {
      // If formatting fails, do nothing
    }
  }

  const validateCSS = () => {
    // Basic CSS validation
    const cssRules = [
      /^[\w-]+:\s*[^;]+;?\s*$/, // property: value;
      /^\s*$/, // empty lines
      /^\s*\/\*/, // comments start
      /^\s*\*\//, // comments end
    ]

    const lines = value.split('\n')
    const errors: string[] = []

    lines.forEach((line, index) => {
      const trimmed = line.trim()
      if (trimmed && !cssRules.some(rule => rule.test(trimmed))) {
        if (!trimmed.includes('{') && !trimmed.includes('}') && !trimmed.startsWith('/*') && !trimmed.endsWith('*/')) {
          errors.push(`Line ${index + 1}: Invalid CSS syntax`)
        }
      }
    })

    if (errors.length > 0) {
      alert('CSS Validation Errors:\n' + errors.join('\n'))
    } else {
      alert('CSS is valid!')
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="p-3 border-b bg-gray-50 flex items-center gap-2">
        <button
          onClick={formatCSS}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Format CSS
        </button>
        <button
          onClick={validateCSS}
          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Validate
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 p-4">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          placeholder={`/* Enter your custom CSS here */
/* Example: */
.my-component {
  color: red;
  font-size: 16px;
}`}
          className="w-full h-full min-h-64 p-3 font-mono text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          style={{
            lineHeight: 1.5,
            tabSize: 2
          }}
          spellCheck={false}
        />
      </div>

      {/* Info */}
      <div className="p-3 border-t bg-gray-50">
        <div className="text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <span>Custom CSS Editor</span>
            <span>{value.split('\n').length} lines</span>
          </div>
          <div className="mt-1">
            CSS will be applied with higher specificity to override default styles.
          </div>
        </div>
      </div>
    </div>
  )
}
