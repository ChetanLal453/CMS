import React, { useState, useEffect } from 'react'
import SafeHtml from '@/components/SafeHtml'
import { sanitizeSvgMarkup } from '@/lib/sanitize-markup'

interface IconPickerProps {
  isOpen: boolean
  onClose: () => void
  onSelectIcon: (iconName: string, library: string) => void
  onUploadCustom: (svgCode: string) => void
  currentIcon?: string
  currentLibrary?: string
}

const IconPicker: React.FC<IconPickerProps> = ({
  isOpen,
  onClose,
  onSelectIcon,
  onUploadCustom,
  currentIcon = 'star',
  currentLibrary = 'fa'
}) => {
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLibrary, setSelectedLibrary] = useState(currentLibrary)
  const [customSvg, setCustomSvg] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const sanitizedCustomSvg = sanitizeSvgMarkup(customSvg)

  // FontAwesome icons (common ones)
  const faIcons = [
    'star', 'heart', 'user', 'home', 'search', 'envelope', 'phone', 'map-marker',
    'calendar', 'clock', 'check', 'times', 'plus', 'minus', 'arrow-left', 'arrow-right',
    'arrow-up', 'arrow-down', 'chevron-left', 'chevron-right', 'chevron-up', 'chevron-down',
    'play', 'pause', 'stop', 'forward', 'backward', 'fast-forward', 'fast-backward',
    'step-forward', 'step-backward', 'eject', 'cog', 'wrench', 'sliders', 'share',
    'download', 'upload', 'inbox', 'edit', 'copy', 'save', 'trash', 'folder', 'folder-open',
    'file', 'file-text', 'image', 'video', 'music', 'headphones', 'volume-up', 'volume-down',
    'qrcode', 'barcode', 'tag', 'tags', 'book', 'bookmark', 'print', 'camera', 'font',
    'bold', 'italic', 'text-height', 'text-width', 'align-left', 'align-center', 'align-right',
    'list', 'list-ol', 'list-ul', 'indent', 'dedent', 'table', 'th-large', 'th', 'th-list',
    'strikethrough', 'underline', 'superscript', 'subscript', 'header', 'paragraph',
    'code', 'quote-left', 'quote-right', 'spinner', 'circle', 'dot-circle', 'square',
    'check-square', 'minus-square', 'plus-square', 'caret-down', 'caret-up', 'caret-left',
    'caret-right', 'columns', 'sort', 'sort-down', 'sort-up', 'sort-alpha-asc', 'sort-alpha-desc',
    'sort-amount-asc', 'sort-amount-desc', 'sort-numeric-asc', 'sort-numeric-desc',
    'thumbs-up', 'thumbs-down', 'star-half', 'heart-o', 'sign-in', 'sign-out', 'external-link',
    'share-square', 'compass', 'toggle-down', 'toggle-up', 'toggle-right', 'euro', 'gbp',
    'dollar', 'yen', 'rouble', 'won', 'bitcoin', 'file-pdf', 'file-word', 'file-excel',
    'file-powerpoint', 'file-image', 'file-zip', 'file-audio', 'file-video', 'file-code',
    'life-bouy', 'life-buoy', 'life-saver', 'support', 'heart-pulse', 'ambulance', 'medkit',
    'h-square', 'plus-square', 'user-md', 'stethoscope', 'hospital', 'building', 'child',
    'paw', 'spoon', 'cube', 'cubes', 'recycle', 'car', 'taxi', 'truck', 'bus', 'bicycle',
    'motorcycle', 'plane', 'rocket', 'ship', 'anchor', 'fighter-jet', 'bomb', 'certificate',
    'trophy', 'shield', 'beer', 'glass', 'coffee', 'cutlery', 'birthday-cake', 'magic',
    'eye', 'eye-slash', 'warning', 'bullhorn', 'bell', 'bell-o', 'bell-slash', 'bell-slash-o',
    'rss', 'rss-square', 'feed', 'wifi', 'desktop', 'laptop', 'tablet', 'mobile', 'tv',
    'gamepad', 'keyboard', 'mouse', 'microphone', 'headphones', 'volume-off', 'microphone-slash',
    'lightbulb', 'battery-full', 'battery-three-quarters', 'battery-half', 'battery-quarter',
    'battery-empty', 'power-off', 'plug', 'fire', 'sun', 'moon', 'umbrella', 'cloud',
    'tint', 'leaf', 'tree', 'seedling', 'paw', 'bug', 'coffee', 'beer', 'glass', 'music',
    'film', 'camera-retro', 'key', 'lock', 'unlock', 'unlock-alt', 'map', 'tint', 'thermometer',
    'dashboard', 'tachometer', 'bolt', 'flash', 'sitemap', 'umbrella', 'cloud-upload', 'cloud-download',
    'exchange', 'cloud', 'suitcase', 'road', 'train', 'subway', 'car', 'taxi', 'truck', 'ship',
    'motorcycle', 'bicycle', 'bus', 'plane', 'rocket', 'anchor', 'wheelchair', 'child', 'blind',
    'paw', 'spoon', 'cube', 'cubes', 'recycle', 'tree', 'leaf', 'seedling', 'bug', 'coffee',
    'cutlery', 'birthday-cake', 'magic', 'eye', 'eye-slash', 'exclamation-triangle', 'bullhorn',
    'bell', 'certificate', 'trophy', 'shield', 'beer', 'glass', 'magic', 'eye', 'eye-slash',
    'warning', 'bullhorn', 'bell', 'certificate', 'trophy', 'shield', 'beer', 'glass'
  ]

  // Material Design icons (subset)
  const materialIcons = [
    'face', 'account_circle', 'add', 'add_circle', 'add_circle_outline', 'arrow_back',
    'arrow_forward', 'arrow_upward', 'arrow_downward', 'check', 'check_circle', 'check_circle_outline',
    'clear', 'close', 'create', 'delete', 'done', 'edit', 'email', 'favorite', 'favorite_border',
    'home', 'info', 'info_outline', 'location_on', 'lock', 'lock_outline', 'menu', 'more_horiz',
    'more_vert', 'notifications', 'notifications_none', 'person', 'person_add', 'phone', 'place',
    'refresh', 'search', 'send', 'settings', 'share', 'shopping_cart', 'star', 'star_border',
    'star_half', 'thumb_up', 'thumb_down', 'visibility', 'visibility_off', 'volume_up', 'volume_down',
    'volume_mute', 'volume_off', 'warning', 'error', 'error_outline', 'help', 'help_outline'
  ]

  // Heroicons (subset)
  const heroIcons = [
    'home', 'user', 'search', 'heart', 'star', 'check', 'x', 'plus', 'minus', 'arrow-left',
    'arrow-right', 'arrow-up', 'arrow-down', 'chevron-left', 'chevron-right', 'chevron-up', 'chevron-down'
  ]

  if (!isOpen) return null

  const filteredIcons = selectedLibrary === 'fa' ? faIcons.filter(icon =>
    icon.toLowerCase().includes(searchTerm.toLowerCase())
  ) : selectedLibrary === 'material' ? materialIcons.filter(icon =>
    icon.toLowerCase().includes(searchTerm.toLowerCase())
  ) : heroIcons.filter(icon =>
    icon.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setCustomSvg(event.target?.result as string)
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Select Icon</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('library')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'library'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Icon Library
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'upload'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Upload Custom
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {activeTab === 'library' ? (
            <>
              {/* Library Selection */}
              <div className="mb-4 flex gap-2">
                <select
                  value={selectedLibrary}
                  onChange={(e) => setSelectedLibrary(e.target.value)}
                  className="px-3 py-2 border rounded focus:outline-none focus:border-blue-400"
                >
                  <option value="fa">FontAwesome</option>
                  <option value="material">Material Design</option>
                  <option value="heroicons">Heroicons</option>
                </select>
                <input
                  type="text"
                  placeholder="Search icons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded focus:outline-none focus:border-blue-400"
                />
              </div>

              {/* Icons Grid */}
              <div className="grid grid-cols-8 gap-4">
                {filteredIcons.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => onSelectIcon(icon, selectedLibrary)}
                    className="flex flex-col items-center p-3 border rounded hover:bg-gray-50 transition-colors"
                  >
                    <i className={`${
                      selectedLibrary === 'fa' ? 'fa fa-' :
                      selectedLibrary === 'material' ? 'material-icons' :
                      'h-6 w-6'
                    } text-2xl mb-2`}>
                      {selectedLibrary === 'material' ? icon : ''}
                    </i>
                    <span className="text-xs text-gray-600 truncate w-full">{icon}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Upload Custom SVG */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Upload SVG File</label>
                  <input
                    type="file"
                    accept=".svg"
                    onChange={handleFileUpload}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Or Paste SVG Code</label>
                  <textarea
                    value={customSvg}
                    onChange={(e) => setCustomSvg(e.target.value)}
                    placeholder="<svg>...</svg>"
                    className="w-full h-32 px-3 py-2 border rounded focus:outline-none focus:border-blue-400 font-mono text-sm"
                  />
                </div>
                {sanitizedCustomSvg && (
                  <div className="flex justify-center p-4 border rounded bg-gray-50">
                    <SafeHtml html={sanitizedCustomSvg} mode="svg" />
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          {activeTab === 'upload' && sanitizedCustomSvg && (
            <button
              onClick={() => {
                // Security: upload only sanitized SVG markup from the picker.
                onUploadCustom(sanitizedCustomSvg)
                onClose()
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Upload Icon
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default IconPicker
