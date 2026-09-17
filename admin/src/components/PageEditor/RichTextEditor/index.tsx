'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Color from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import { Toolbar } from './Toolbar'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  className?: string
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  className = ''
}) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg shadow-sm',
        },
      }),
      TextAlign.configure({
        types: ['paragraph'],
      }),
      Color,
      TextStyle,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4 border border-gray-200 rounded-lg ${className}`,
      },
    },
  })

  if (!editor) {
    return <div className="min-h-[200px] p-4 border border-gray-200 rounded-lg bg-gray-50">Loading editor...</div>
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} className="min-h-[200px]" />
    </div>
  )
}

export default RichTextEditor
