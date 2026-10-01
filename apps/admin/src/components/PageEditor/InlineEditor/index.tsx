'use client'

import React, { useState, useRef, useEffect } from 'react'

interface InlineEditorProps {
  value: string
  onChange: (value: string) => void
  onSave?: () => void
  placeholder?: string
  className?: string
  multiline?: boolean
}

export const InlineEditor: React.FC<InlineEditorProps> = ({
  value,
  onChange,
  onSave,
  placeholder = 'Click to edit...',
  className = '',
  multiline = false
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleStartEdit = () => {
    setEditValue(value)
    setIsEditing(true)
  }

  const handleSave = () => {
    onChange(editValue)
    setIsEditing(false)
    onSave?.()
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (isEditing) {
    const commonProps = {
      ref: inputRef as any,
      value: editValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setEditValue(e.target.value),
      onKeyDown: handleKeyDown,
      onBlur: handleSave,
      className: `border-2 border-blue-500 rounded px-2 py-1 focus:outline-none ${className}`,
      placeholder
    }

    return multiline ? (
      <textarea {...commonProps} rows={3} />
    ) : (
      <input {...commonProps} type="text" />
    )
  }

  return (
    <div
      onClick={handleStartEdit}
      className={`cursor-pointer hover:bg-gray-100 rounded px-2 py-1 min-h-[2rem] flex items-center ${className}`}
      title="Click to edit"
    >
      {value || <span className="text-gray-400 italic">{placeholder}</span>}
    </div>
  )
}

export default InlineEditor
