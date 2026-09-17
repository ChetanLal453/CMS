'use client'

import React, { useState, useCallback } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import toast from 'react-hot-toast'

interface JSONViewProps {
  layout: any
  onLayoutChange: (newLayout: any) => void
  isOpen: boolean
  onToggle: () => void
}

export const JSONView: React.FC<JSONViewProps> = ({
  layout,
  onLayoutChange,
  isOpen,
  onToggle
}) => {
  const [jsonText, setJsonText] = useState(() => JSON.stringify(layout, null, 2))
  const [error, setError] = useState<string | null>(null)
  const [isReadOnly, setIsReadOnly] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState<Record<string, boolean>>({})

  const handleJsonChange = useCallback((value: string) => {
    setJsonText(value)
    try {
      const parsed = JSON.parse(value)
      onLayoutChange(parsed)
      setError(null)
    } catch (err) {
      setError('Invalid JSON')
    }
  }, [onLayoutChange])

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(jsonText)
      toast.success('JSON copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy to clipboard')
    }
  }, [jsonText])

  const toggleNode = useCallback((path: string) => {
    setIsCollapsed(prev => ({
      ...prev,
      [path]: !prev[path]
    }))
  }, [])

  const renderCollapsibleJSON = useCallback((obj: any, path = '', level = 0): React.ReactNode => {
    if (typeof obj !== 'object' || obj === null) {
      return <span className="text-green-400">{JSON.stringify(obj)}</span>
    }

    const isArray = Array.isArray(obj)
    const entries = Object.entries(obj)
    const collapsed = isCollapsed[path]

    if (collapsed) {
      return (
        <span>
          {isArray ? '[' : '{'}...{isArray ? ']' : '}'}
          <button
            onClick={() => toggleNode(path)}
            className="ml-2 text-blue-400 hover:text-blue-300 text-xs"
          >
            [+]
          </button>
        </span>
      )
    }

    return (
      <div className="ml-4">
        <span>
          {isArray ? '[' : '{'}
          <button
            onClick={() => toggleNode(path)}
            className="ml-2 text-blue-400 hover:text-blue-300 text-xs"
          >
            [-]
          </button>
        </span>
        <div className="ml-4">
          {entries.map(([key, value], index) => (
            <div key={key} className="py-1">
              {!isArray && <span className="text-blue-400">"{key}"</span>}
              {!isArray && <span className="text-white">: </span>}
              {renderCollapsibleJSON(value, `${path}.${key}`, level + 1)}
              {index < entries.length - 1 && <span className="text-white">,</span>}
            </div>
          ))}
        </div>
        <span>{isArray ? ']' : '}'}</span>
      </div>
    )
  }, [isCollapsed, toggleNode])

  return (
    <div className="border-t border-slate-200 bg-slate-50">
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-200">
        <span className="text-sm font-medium text-slate-700">JSON Editor</span>
        <div className="flex gap-2">
          <button
            onClick={() => setIsReadOnly(!isReadOnly)}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              isReadOnly
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
            title={isReadOnly ? 'Switch to edit mode' : 'Switch to read-only mode'}
          >
            {isReadOnly ? '🔒 Read-only' : '✏️ Editable'}
          </button>
          <button
            onClick={copyToClipboard}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors"
            title="Copy JSON to clipboard"
          >
            📋 Copy
          </button>
          <button
            onClick={onToggle}
            className="px-3 py-1 text-xs bg-slate-200 hover:bg-slate-300 rounded transition-colors"
          >
            {isOpen ? 'Hide' : 'Show'} JSON
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-4">
          {error && (
            <div className="mb-2 px-3 py-2 bg-red-100 border border-red-300 rounded text-sm text-red-700">
              {error}
            </div>
          )}

          {isReadOnly ? (
            <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-96">
              <SyntaxHighlighter
                language="json"
                style={oneDark}
                customStyle={{
                  margin: 0,
                  background: 'transparent',
                  fontSize: '0.875rem'
                }}
              >
                {jsonText}
              </SyntaxHighlighter>
            </div>
          ) : (
            <textarea
              value={jsonText}
              onChange={(e) => handleJsonChange(e.target.value)}
              className="w-full h-64 font-mono text-sm border border-slate-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-900 text-green-400"
              placeholder="Paste your JSON layout here..."
              spellCheck={false}
            />
          )}

          <div className="mt-2 text-xs text-slate-500">
            {isReadOnly
              ? 'Read-only mode: View formatted JSON with syntax highlighting.'
              : 'Edit mode: Modify the JSON directly. Changes are reflected in real-time.'
            }
          </div>
        </div>
      )}
    </div>
  )
}
