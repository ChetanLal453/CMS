'use client'

import React from 'react'
import { Editor } from '@tiptap/react'

interface ToolbarProps {
  editor: Editor
}

export const Toolbar: React.FC<ToolbarProps> = ({ editor }) => {
  if (!editor) {
    return null
  }

  const addImage = () => {
    const url = window.prompt('Image URL:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const addLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL:', previousUrl)

    if (url === null) {
      return
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="border-b border-gray-200 bg-gray-50 p-2 flex flex-wrap gap-1">
      {/* Text Formatting */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`px-2 py-1 rounded text-sm font-medium ${
          editor.isActive('bold') ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'
        }`}
        title="Bold"
      >
        B
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`px-2 py-1 rounded text-sm font-medium ${
          editor.isActive('italic') ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'
        }`}
        title="Italic"
      >
        I
      </button>

      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`px-2 py-1 rounded text-sm font-medium ${
          editor.isActive('strike') ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'
        }`}
        title="Strikethrough"
      >
        S
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Lists */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-2 py-1 rounded text-sm font-medium ${
          editor.isActive('bulletList') ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'
        }`}
        title="Bullet List"
      >
        •
      </button>

      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`px-2 py-1 rounded text-sm font-medium ${
          editor.isActive('orderedList') ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'
        }`}
        title="Ordered List"
      >
        1.
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Alignment */}
      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`px-2 py-1 rounded text-sm font-medium ${
          editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'
        }`}
        title="Align Left"
      >
        ⬅
      </button>

      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`px-2 py-1 rounded text-sm font-medium ${
          editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'
        }`}
        title="Align Center"
      >
        ⬌
      </button>

      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`px-2 py-1 rounded text-sm font-medium ${
          editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'
        }`}
        title="Align Right"
      >
        ➡
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Links and Images */}
      <button
        onClick={addLink}
        className={`px-2 py-1 rounded text-sm font-medium ${
          editor.isActive('link') ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'
        }`}
        title="Add Link"
      >
        🔗
      </button>

      <button
        onClick={addImage}
        className="px-2 py-1 rounded text-sm font-medium hover:bg-gray-200"
        title="Add Image"
      >
        🖼
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Undo/Redo */}
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="px-2 py-1 rounded text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Undo"
      >
        ↶
      </button>

      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="px-2 py-1 rounded text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Redo"
      >
        ↷
      </button>
    </div>
  )
}

export default Toolbar
