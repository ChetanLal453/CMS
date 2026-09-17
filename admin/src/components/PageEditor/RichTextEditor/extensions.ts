import { Extension } from '@tiptap/core'
import { Plugin } from 'prosemirror-state'

// Custom extension for handling paste events
export const CustomPasteHandler = Extension.create({
  name: 'customPasteHandler',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handlePaste: (view, event) => {
            const items = Array.from(event.clipboardData?.items || [])
            const imageItem = items.find(item => item.type.startsWith('image/'))

            if (imageItem) {
              event.preventDefault()
              const file = imageItem.getAsFile()
              if (file) {
                // Handle image paste - you could upload the file here
                console.log('Image pasted:', file)
                // For now, just insert a placeholder
                const { tr } = view.state
                const node = view.state.schema.nodes.image.create({
                  src: URL.createObjectURL(file)
                })
                view.dispatch(tr.replaceSelectionWith(node))
              }
              return true
            }

            return false
          },
        },
      }),
    ]
  },
})

// Custom extension for keyboard shortcuts
export const CustomKeyboardShortcuts = Extension.create({
  name: 'customKeyboardShortcuts',

  addKeyboardShortcuts() {
    return {
      'Mod-b': () => this.editor.commands.toggleBold(),
      'Mod-i': () => this.editor.commands.toggleItalic(),
      'Mod-Shift-x': () => this.editor.commands.toggleStrike(),
      'Mod-Shift-7': () => this.editor.commands.toggleBulletList(),
      'Mod-Shift-8': () => this.editor.commands.toggleOrderedList(),
      'Mod-Shift-9': () => this.editor.commands.toggleBlockquote(),
      'Mod-k': () => {
        const url = window.prompt('URL:')
        if (url) {
          this.editor.commands.setLink({ href: url })
        }
        return true
      },
    }
  },
})
