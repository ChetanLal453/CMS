'use client'

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { DndContext } from '@dnd-kit/core'
import { componentRegistry, initializeComponentRegistry } from '@/lib/componentRegistry'
import { LayoutComponent, PageLayout, Page, Section } from '@/types/page-editor'
import { usePageData } from './hooks/usePageData'
import { useUIState } from './hooks/useUIState'
import { useLayoutActions } from './hooks/useLayoutActions'
import { useUndoRedo } from '@/hooks/useUndoRedo'
import { useAutoSave } from '@/hooks/useAutoSave'
import { PageEditorCanvas, CanvasToolbar } from './components/PageEditorCanvas'
import { LeftSidebar } from './components/LeftSidebar'
import { PropertyPanel } from './PropertyPanel'
import { JSONView } from './components/JSONView'
import { ConfirmationModal } from './components/ConfirmationModal'
import { DragDropProvider } from './DragDropProvider'
import { VersionHistory } from './VersionHistory'
import { TemplateManager } from './TemplateManager'

interface PageEditorProps {
  initialLayout?: any
  onSave?: (layout: any) => void
  onCancel?: () => void
  isModal?: boolean
  showSaveButton?: boolean
  pageId?: string
}

const debugLog = (..._args: unknown[]) => {}

const getApiErrorMessage = (payload: any, fallback: string) => {
  const message = typeof payload?.error === 'string'
    ? payload.error
    : typeof payload?.error?.message === 'string'
      ? payload.error.message
      : typeof payload?.message === 'string'
        ? payload.message
        : ''

  return message || fallback
}

const formatSaveStatus = (lastSaved: Date | null, isSaving: boolean, hasPendingChanges: boolean, hasSaveConflict: boolean) => {
  if (isSaving) return 'Saving...'
  if (hasSaveConflict) return 'Reload required'
  if (!lastSaved) return hasPendingChanges ? 'Unsaved changes' : 'Not saved yet'

  const seconds = Math.max(0, Math.floor((Date.now() - lastSaved.getTime()) / 1000))
  if (seconds < 5) return 'Saved just now'
  if (seconds < 60) return `Saved ${seconds}s ago`

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `Saved ${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  return `Saved ${hours}h ago`
}

const moveItem = <T,>(items: T[], fromIndex: number, toIndex: number): T[] => {
  const nextItems = [...items]
  const [movedItem] = nextItems.splice(fromIndex, 1)

  if (movedItem === undefined) {
    return items
  }

  nextItems.splice(toIndex, 0, movedItem)
  return nextItems
}

const getSectionRows = (section: Section | undefined | null) => {
  if (Array.isArray(section?.container?.rows)) {
    return section.container.rows
  }

  if (Array.isArray((section as any)?.rows)) {
    return (section as any).rows
  }

  return []
}

type ComponentLocation = {
  sectionIndex: number
  rowIndex: number
  colIndex: number
  componentIndex: number
  columnId: string
}

const findComponentLocation = (layout: PageLayout | undefined, componentId: string): ComponentLocation | null => {
  const sections = Array.isArray(layout?.sections) ? layout.sections : []

  for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex += 1) {
    const section = sections[sectionIndex]
    const rows = getSectionRows(section)

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
      const row = rows[rowIndex]
      const columns = Array.isArray(row?.columns) ? row.columns : []

      for (let colIndex = 0; colIndex < columns.length; colIndex += 1) {
        const column = columns[colIndex]
        const componentIndex = Array.isArray(column?.components)
          ? column.components.findIndex((component: LayoutComponent | null) => component?.id === componentId)
          : -1

        if (componentIndex !== -1) {
          return {
            sectionIndex,
            rowIndex,
            colIndex,
            componentIndex,
            columnId: String(column?.id || ''),
          }
        }
      }
    }
  }

  return null
}

const parseColumnDroppableId = (droppableId: string) => {
  const parts = String(droppableId).split(':')
  if (parts[0] !== 'column') return null

  const [, sectionId, containerId, rowId, columnId] = parts
  if (!sectionId || !rowId || !columnId) return null

  return {
    sectionId,
    containerId: containerId || '',
    rowId,
    columnId,
  }
}

const createEditorId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

const cloneComponentTreeWithNewIds = (component: any): any => {
  if (!component || typeof component !== 'object') {
    return component
  }

  const cloned = {
    ...component,
    id: createEditorId(component.type || 'component'),
  }

  if (Array.isArray(component.props?.components)) {
    cloned.props = {
      ...(cloned.props || {}),
      components: component.props.components.map((nested: any) => cloneComponentTreeWithNewIds(nested)),
    }
  }

  if (Array.isArray(component.props?.slides)) {
    cloned.props = {
      ...(cloned.props || {}),
      slides: component.props.slides.map((slide: any) => ({
        ...slide,
        id: createEditorId('slide'),
        components: Array.isArray(slide?.components) ? slide.components.map((nested: any) => cloneComponentTreeWithNewIds(nested)) : [],
      })),
    }
  }

  if (Array.isArray(component.props?.cells)) {
    cloned.props = {
      ...(cloned.props || {}),
      cells: component.props.cells.map((row: any[]) =>
        Array.isArray(row)
          ? row.map((cell: any) => ({
              ...cell,
              component: cell?.component ? cloneComponentTreeWithNewIds(cell.component) : null,
            }))
          : row,
      ),
    }
  }

  return cloned
}

const cloneSectionWithNewIds = (section: Section): Section => {
  const clonedSection = JSON.parse(JSON.stringify(section))

  return {
    ...clonedSection,
    id: createEditorId('section'),
    name: `${section.name || 'Section'} Copy`,
    container: {
      ...(clonedSection.container || {}),
      id: createEditorId('container'),
      rows: Array.isArray(clonedSection.container?.rows)
        ? clonedSection.container.rows.map((row: any) => ({
            ...row,
            id: createEditorId('row'),
            columns: Array.isArray(row?.columns)
              ? row.columns.map((column: any) => ({
                  ...column,
                  id: createEditorId('col'),
                  components: Array.isArray(column?.components)
                    ? column.components.map((component: any) => cloneComponentTreeWithNewIds(component))
                    : [],
                }))
              : [],
          }))
        : [],
    },
  }
}

const formatPublishedStatus = (publishedAt: string | null) => {
  if (!publishedAt) {
    return 'Not published yet'
  }

  const publishedDate = new Date(publishedAt)
  if (Number.isNaN(publishedDate.getTime())) {
    return 'Published'
  }

  return `Published ${publishedDate.toLocaleString()}`
}

// Column Selection Modal Component
const ColumnSelectionModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  onSelect: (columnCount: number) => void
}> = ({ isOpen, onSelect, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="editor-modal-backdrop fixed inset-0 flex items-center justify-center z-[9999]">
      <div className="editor-modal editor-choice-modal w-96 max-w-md">
        <div className="editor-modal-top">
          <h3 className="editor-modal-title">Create New Section</h3>
          <button onClick={onClose} className="editor-modal-close" type="button" aria-label="Close section creator">
            ✕
          </button>
        </div>

        <p className="editor-modal-copy">How many columns do you want in this section?</p>

        <div className="editor-choice-grid">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => {
                onSelect(num)
                onClose()
              }}
              className={`editor-choice-card ${num === 1 ? 'is-wide' : ''} ${num <= 3 ? 'is-featured' : ''}`}>
              <span className="editor-choice-count">{num}</span>
              <span className="editor-choice-label">{num === 1 ? 'Single Column' : `${num} Columns`}</span>
            </button>
          ))}
        </div>

        <div className="editor-modal-actions">
          <button onClick={onClose} className="gbtn ghost" type="button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

const PageEditor: React.FC<PageEditorProps> = ({ initialLayout, onSave, onCancel, isModal = false, showSaveButton = true, pageId }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedSectionId, setSelectedSectionId] = useState<string | undefined>()
  const [canvasZoom, setCanvasZoom] = useState(100)
  const [showCanvasGrid, setShowCanvasGrid] = useState(true)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [selectedComponent, setSelectedComponent] = useState<{
    sectionId: string
    containerId: string
    rowId: string
    colId: string
    compId: string
    component: LayoutComponent
    carouselId?: string
    slideIndex?: number
    gridId?: string
    cellRow?: number
    cellCol?: number
  } | null>(null)

  const [showColumnModal, setShowColumnModal] = useState(false)
  const [showJsonView, setShowJsonView] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [headerOptions, setHeaderOptions] = useState<Array<{ id: number; slug: string; name: string }>>([])
  const [footerOptions, setFooterOptions] = useState<Array<{ id: number; slug: string; name: string }>>([])
  const [selectedHeaderSlug, setSelectedHeaderSlug] = useState('')
  const [selectedFooterSlug, setSelectedFooterSlug] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [metaImage, setMetaImage] = useState('')
  const [lastPublishedAt, setLastPublishedAt] = useState<string | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isSavingSeo, setIsSavingSeo] = useState(false)
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    type?: 'danger' | 'warning' | 'info'
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  })

  // Custom hooks
  const {
    pages,
    currentPageId,
    setCurrentPageId,
    layout: baseLayout,
    setLayout: setBaseLayout,
    loading,
    error,
    saveLayout,
    autosaveLayout,
    saveConflict,
    applyTemplate,
    createPage,
    deletePage,
    disablePage,
    renamePage,
  } = usePageData(pageId)

  const currentPage = useMemo(
    () => pages.find((page) => String(page.id) === String(currentPageId)),
    [pages, currentPageId],
  )

  // Undo/Redo for layout
  const {
    state: layout,
    setState: setLayout,
    undo,
    redo,
    canUndo,
    canRedo,
    reset: resetHistory,
  } = useUndoRedo(baseLayout, 50)

  // Sync base layout changes to undo/redo
  const currentLayoutRef = useRef(layout)
  const seoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    currentLayoutRef.current = layout
  }, [layout])

  const lastHistoryPageIdRef = useRef<string | null>(null)
  useEffect(() => {
    const layoutPageId = baseLayout?.id == null ? null : String(baseLayout.id)
    if (!layoutPageId) return
    if (lastHistoryPageIdRef.current === layoutPageId) {
      return
    }

    resetHistory(baseLayout)
    lastHistoryPageIdRef.current = layoutPageId
  }, [baseLayout, resetHistory])

  const {
    leftSidebarWidth,
    setLeftSidebarWidth,
    rightSidebarWidth,
    setRightSidebarWidth,
    isResizingLeft,
    setIsResizingLeft,
    isResizingRight,
    setIsResizingRight,
    isMobile,
    leftSidebarVisible,
    setLeftSidebarVisible,
    rightSidebarVisible,
    setRightSidebarVisible,
  } = useUIState()

  const {
    handleDragEnd: layoutActionsHandleDragEnd,
    handleComponentUpdate: layoutActionsHandleComponentUpdate,
    handleSetSectionRows,
    handleSetSectionColumns,
    handleComponentAdd,
    handleSectionDelete,
    deleteComponent,
    handleColumnDelete,
  } = useLayoutActions(layout, setLayout, saveLayout)

  const saveLayoutSilently = useCallback(async (targetLayout: PageLayout) => {
    return autosaveLayout(targetLayout)
  }, [autosaveLayout])

  const {
    lastSaved,
    isSaving: isAutoSaving,
    hasPendingChanges,
    saveNow,
  } = useAutoSave({
    data: layout,
    onSave: saveLayoutSilently,
    interval: 30000,
    debounceMs: 800,
    enabled: Boolean(currentPageId) && !loading && !saveConflict && String(layout?.id ?? '') === String(currentPageId),
    identityKey: `${currentPageId ?? ''}:${loading ? 'loading' : 'ready'}`,
  })

  useEffect(() => {
    let cancelled = false

    const loadLayoutOptions = async () => {
      try {
        const [headersResponse, footersResponse] = await Promise.all([
          fetch('/api/headers'),
          fetch('/api/footers'),
        ])
        const [headersData, footersData] = await Promise.all([
          headersResponse.json(),
          footersResponse.json(),
        ])

        if (cancelled) {
          return
        }

        setHeaderOptions(
          (headersData.headers || []).map((header: any) => ({
            id: header.id,
            slug: header.slug,
            name: header.name,
          })),
        )
        setFooterOptions(
          (footersData.footers || footersData.items || []).map((footer: any) => ({
            id: footer.id,
            slug: footer.slug,
            name: footer.name,
          })),
        )
      } catch (error) {
        console.error('Failed to load header/footer options:', error)
      }
    }

    const handleFooterUpdated = () => {
      void loadLayoutOptions()
    }

    void loadLayoutOptions()
    window.addEventListener('cm-footer-updated', handleFooterUpdated)

    return () => {
      cancelled = true
      window.removeEventListener('cm-footer-updated', handleFooterUpdated)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadCurrentPageAssignments = async () => {
      if (!currentPageId) {
        setSelectedHeaderSlug('')
        setSelectedFooterSlug('')
        setMetaTitle('')
        setMetaDescription('')
        setMetaImage('')
        setLastPublishedAt(null)
        return
      }

      try {
        if (!currentPage?.id) {
          setSelectedHeaderSlug('')
          setSelectedFooterSlug('')
          return
        }

        const response = await fetch(`/api/pages/${encodeURIComponent(String(currentPage.id))}`)
        const data = await response.json()
        if (!cancelled && data.success) {
          setSelectedHeaderSlug(data.page?.header_slug || '')
          setSelectedFooterSlug(data.page?.footer_slug || '')
          setMetaTitle(data.page?.meta_title || '')
          setMetaDescription(data.page?.meta_description || '')
          setMetaImage(data.page?.meta_image || '')
          setLastPublishedAt(data.page?.published_at || null)
        }
      } catch (error) {
        console.error('Failed to load page header/footer assignment:', error)
      }
    }

    void loadCurrentPageAssignments()

    return () => {
      cancelled = true
    }
  }, [currentPage, currentPageId])

  useEffect(() => {
    return () => {
      if (seoSaveTimeoutRef.current) {
        clearTimeout(seoSaveTimeoutRef.current)
      }
    }
  }, [])

  const handlePreviewDraft = useCallback(async () => {
    if (typeof window === 'undefined') {
      return
    }

    if (!currentPage?.slug) {
      toast.error('Select a page before previewing')
      return
    }

    if (hasPendingChanges) {
      const saved = await saveNow(true)
      if (!saved) {
        toast.error('Save the draft first or resolve the conflict before previewing')
        return
      }
    }

    const previewUrl = `/preview/${encodeURIComponent(currentPage.slug)}`
    window.open(previewUrl, '_blank', 'noopener,noreferrer')
  }, [currentPage?.slug, hasPendingChanges, saveNow])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isTypingTarget =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable

      if (isTypingTarget) {
        return
      }

      const modifier = event.ctrlKey || event.metaKey
      if (!modifier) {
        return
      }

      const key = event.key.toLowerCase()
      if (key === 'z' && !event.shiftKey) {
        event.preventDefault()
        undo()
      } else if (key === 'y' || (key === 'z' && event.shiftKey)) {
        event.preventDefault()
        redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [redo, undo])

  // Helper function to get component definition
  const getComponentDefinition = (componentType: string) => {
    if (typeof componentRegistry.getComponent === 'function') {
      return componentRegistry.getComponent(componentType)
    }
    return null
  }

  // 🆕 Helper function for default section names
  const getDefaultSectionName = useCallback((columnCount: number): string => {
    const defaultNames: Record<number, string> = {
      1: 'Full Width Section',
      2: 'Two Column Layout',
      3: 'Three Column Grid',
      4: 'Four Column Section',
      5: 'Five Column Layout',
      6: 'Six Column Grid',
    }

    return defaultNames[columnCount] || `Section with ${columnCount} Columns`
  }, [])

  // ✅✅✅ FIXED: Get FRESH layout before saving
  // ✅✅✅ FIXED handleComponentDelete function
  const handleComponentDelete = useCallback(
    (componentId: string, context?: any) => {
      debugLog('🎯 [PageEditor] handleComponentDelete CALLED:', {
        componentId,
        context,
        timestamp: new Date().toISOString(),
      })

      // ✅ Step 1: Clear selection if deleting selected component
      if (selectedComponent && selectedComponent.compId === componentId) {
        debugLog('🗑️ Clearing selected component')
        setSelectedComponent(null)
      }

      // ✅ Step 2: Update layout state (FIXED LOGIC)
      setLayout((currentLayout) => {
        debugLog('🔄 Updating layout state...')

        const updatedLayout = JSON.parse(JSON.stringify(currentLayout))
        let componentDeleted = false
        let deleteLocation = ''

        // 🎯 CHECK 1: Is this a NESTED component (inside Grid/Carousel)?
        if (context && (context.parentGridId || context.parentComponentId || context.gridId)) {
          debugLog('🔍 Processing NESTED component delete:', {
            componentId,
            context,
          })

          // 🎯 A. Check if it's inside a GRID
          const searchAndUpdateGrid = () => {
            for (let s = 0; s < updatedLayout.sections.length; s++) {
              const section = updatedLayout.sections[s]

              const sectionRows = getSectionRows(section)
              for (let r = 0; r < sectionRows.length; r++) {
                const row = sectionRows[r]

                for (let c = 0; c < row.columns.length; c++) {
                  const column = row.columns[c]

                  for (let compIndex = 0; compIndex < column.components.length; compIndex++) {
                    const comp = column.components[compIndex]

                    // Check if this is a Grid component
                    if (comp.type === 'NewGrid' && comp.props && comp.props.cells) {
                      debugLog('🔍 Found Grid:', comp.id, 'checking cells...')

                      // Search in grid cells
                      for (let rowIdx = 0; rowIdx < comp.props.cells.length; rowIdx++) {
                        for (let colIdx = 0; colIdx < comp.props.cells[rowIdx].length; colIdx++) {
                          const cell = comp.props.cells[rowIdx][colIdx]

                          if (cell.component && cell.component.id === componentId) {
                            debugLog('✅ Found component in Grid cell:', { rowIdx, colIdx })

                            // Remove component from cell
                            comp.props.cells[rowIdx][colIdx] = {
                              ...cell,
                              component: null,
                            }

                            componentDeleted = true
                            deleteLocation = `grid[${comp.id}].cells[${rowIdx}][${colIdx}]`
                            debugLog('✅ Component removed from Grid')

                            return true // Found and updated
                          }
                        }
                      }
                    }

                    // 🎯 B. Check if it's inside a CAROUSEL
                    if (comp.type === 'carousel' && comp.props && comp.props.slides) {
                      debugLog('🔍 Found Carousel:', comp.id, 'checking slides...')

                      for (let slideIdx = 0; slideIdx < comp.props.slides.length; slideIdx++) {
                        const slide = comp.props.slides[slideIdx]

                        if (slide.components) {
                          const originalLength = slide.components.length
                          slide.components = slide.components.filter((slideComp: any) => slideComp.id !== componentId)

                          if (slide.components.length !== originalLength) {
                            componentDeleted = true
                            deleteLocation = `carousel[${comp.id}].slides[${slideIdx}]`
                            debugLog('✅ Component removed from Carousel slide')
                            return true
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            return false
          }

          if (searchAndUpdateGrid()) {
            debugLog('✅✅✅ NESTED Component deleted successfully')
            toast.success('Component deleted successfully')

            // ✅ Auto-save after successful delete
            setTimeout(() => {
              saveLayout(updatedLayout).then((success) => {
                debugLog(success ? '💾 Nested component deletion saved' : '❌ Save failed')
              })
            }, 0)

            return updatedLayout
          }
        }

        // 🎯 CHECK 2: Is this a FIRST-LEVEL component?
        debugLog('🔍 Searching for FIRST-LEVEL component:', componentId)

        for (let s = 0; s < updatedLayout.sections.length; s++) {
          const section = updatedLayout.sections[s]

          const sectionRows = getSectionRows(section)
          for (let r = 0; r < sectionRows.length; r++) {
            const row = sectionRows[r]

            for (let c = 0; c < row.columns.length; c++) {
              const column = row.columns[c]

              const originalLength = column.components.length
              column.components = column.components.filter((comp: any) => comp.id !== componentId)

              if (column.components.length !== originalLength) {
                componentDeleted = true
                deleteLocation = `section[${s}].row[${r}].column[${c}]`
                debugLog('✅ First-level component removed:', deleteLocation)
                break
              }
            }
            if (componentDeleted) break
          }
          if (componentDeleted) break
        }

        if (componentDeleted) {
          debugLog('✅✅✅ Component SUCCESSFULLY deleted from layout:', {
            componentId,
            deleteLocation,
          })

          toast.success('Component deleted successfully')

          // ✅ Auto-save
          setTimeout(() => {
            saveLayout(updatedLayout).then((success) => {
              debugLog(success ? '💾 Component deletion saved to database' : '❌ Database save failed')
            })
          }, 0)
        } else {
          console.error('❌❌❌ Component NOT FOUND in layout:', componentId)
          toast.error('Component not found')
        }

        return updatedLayout
      })
    },
    [selectedComponent, saveLayout, setLayout],
  )

  // ✅✅✅ COMPLETELY FIXED handleDragEnd function - HANDLES ALL DROP TYPES
  const handleDragEnd = useCallback(
    (result: any, draggedItem: any) => {
      debugLog('🎯 [FIXED] PageEditor: handleDragEnd called', {
        result,
        draggedItem,
        droppableId: result.destination?.droppableId,
        draggableId: result.draggableId,
      })

      if (!result.destination) {
        debugLog('❌ No destination for drop')
        return
      }

      if (
        typeof result.draggableId === 'string' &&
        result.draggableId.startsWith('section:') &&
        result.destination?.droppableId === 'page-sections'
      ) {
        const sectionId = result.draggableId.replace('section:', '')

        setLayout((prevLayout) => {
          const previousSections = Array.isArray(prevLayout?.sections) ? prevLayout.sections : []
          const sourceIndex = previousSections.findIndex((section: Section) => section.id === sectionId)
          const destinationIndex = result.destination?.index ?? sourceIndex

          if (sourceIndex === -1 || sourceIndex === destinationIndex) {
            return prevLayout
          }

          const reorderedSections = moveItem(previousSections, sourceIndex, destinationIndex)
          const nextLayout = {
            ...prevLayout,
            sections: reorderedSections,
          }

          debugLog('🔀 Sections reordered:', {
            sectionId,
            sourceIndex,
            destinationIndex,
            layout: nextLayout,
          })
          debugLog('Saving layout:', nextLayout)

          setTimeout(() => {
            saveLayout(nextLayout).then((success) => {
              debugLog(success ? '💾 Section reorder saved' : '❌ Failed to save section reorder')
            })
          }, 0)

          return nextLayout
        })

        return
      }

      const destinationDroppableId = String(result.destination?.droppableId || '')
      const isSortableComponentMove =
        Boolean(draggedItem?.data?.sortable) &&
        typeof result.draggableId === 'string' &&
        result.draggableId.startsWith('component:') &&
        (destinationDroppableId.startsWith('component:') || destinationDroppableId.startsWith('column:'))

      if (isSortableComponentMove) {
        const sourceComponentId = String(result.draggableId).split(':')[1] || String(draggedItem?.id || '')
        const targetComponentId = destinationDroppableId.startsWith('component:') ? destinationDroppableId.split(':')[1] || '' : ''
        const targetColumnContext = destinationDroppableId.startsWith('column:') ? parseColumnDroppableId(destinationDroppableId) : null

        if (sourceComponentId) {
          setLayout((prevLayout) => {
            const newLayout = JSON.parse(JSON.stringify(prevLayout))
            const sourceLocation = findComponentLocation(newLayout, sourceComponentId)
            const targetLocation = targetComponentId ? findComponentLocation(newLayout, targetComponentId) : null

            if (!sourceLocation) {
              return prevLayout
            }

            const sourceColumn =
              newLayout.sections[sourceLocation.sectionIndex]?.container?.rows?.[sourceLocation.rowIndex]?.columns?.[sourceLocation.colIndex]

            const targetColumn = targetLocation
              ? newLayout.sections[targetLocation.sectionIndex]?.container?.rows?.[targetLocation.rowIndex]?.columns?.[targetLocation.colIndex]
              : targetColumnContext
                ? newLayout.sections
                    .find((section: Section) => section.id === targetColumnContext.sectionId)
                    ?.container?.rows?.find((row: any) => row.id === targetColumnContext.rowId)?.columns?.find((col: any) => col.id === targetColumnContext.columnId)
                : null

            if (!sourceColumn || !Array.isArray(sourceColumn.components) || !targetColumn || !Array.isArray(targetColumn.components)) {
              return prevLayout
            }

            const sameColumn =
              sourceLocation.sectionIndex === (targetLocation?.sectionIndex ?? sourceLocation.sectionIndex) &&
              sourceLocation.rowIndex === (targetLocation?.rowIndex ?? sourceLocation.rowIndex) &&
              sourceLocation.colIndex === (targetLocation?.colIndex ?? sourceLocation.colIndex)

            const [movedComponent] = sourceColumn.components.splice(sourceLocation.componentIndex, 1)
            if (!movedComponent) {
              return prevLayout
            }

            const destinationIndex = targetLocation
              ? sameColumn && sourceLocation.componentIndex < targetLocation.componentIndex
                ? Math.max(0, targetLocation.componentIndex - 1)
                : targetLocation.componentIndex
              : Math.max(0, Math.min(result.destination?.index ?? targetColumn.components.length, targetColumn.components.length))

            targetColumn.components.splice(destinationIndex, 0, movedComponent)

            debugLog('🔀 Component reordered:', {
              sourceComponentId,
              sourceLocation,
              targetComponentId,
              targetColumnContext,
              destinationIndex,
            })

            setTimeout(() => {
              saveLayout(newLayout).then((success) => {
                debugLog(success ? '💾 Component reorder saved' : '❌ Failed to save component reorder')
              })
            }, 0)

            return newLayout
          })

          return
        }
      }

      // Extract the actual component type from draggedItem
      let componentType = draggedItem.type

      // If draggedItem.type is "component", try to get the actual type from id or data
      if (componentType === 'component' && draggedItem.id) {
        // Extract type from id like "component:advancedCard" or just use the id
        const idParts = draggedItem.id.split(':')
        if (idParts.length > 1) {
          componentType = idParts[1] // Get "advancedCard" from "component:advancedCard"
        } else {
          componentType = draggedItem.id // Use the id directly
        }
      }

      debugLog('🔧 Using component type:', componentType)

      // 🎯 1. Handle GRID CELL drops (HIGHEST PRIORITY)
      if (result.destination.droppableId?.startsWith('component:empty:grid:')) {
        debugLog('🏗️ Grid cell drop detected:', result.destination.droppableId)

        // Parse drop zone ID
        const dropZoneId = result.destination.droppableId
        const parts = dropZoneId.split(':')
        const gridIdIndex = parts.indexOf('grid') + 1
        const rowIndexIndex = gridIdIndex + 1
        const colIndexIndex = gridIdIndex + 2

        const actualGridId = parts[gridIdIndex]
        const rowIndex = parseInt(parts[rowIndexIndex], 10)
        const colIndex = parseInt(parts[colIndexIndex], 10)

        // Validate coordinates
        if (isNaN(rowIndex) || isNaN(colIndex)) {
          console.error('❌ Invalid grid cell coordinates:', { rowIndex, colIndex })
          return
        }

        // Update the layout with the new component in the grid cell
        setLayout((prevLayout) => {
          const newLayout = JSON.parse(JSON.stringify(prevLayout))
          let gridUpdated = false
          const isGridComponentType = (type: unknown) => {
            const normalizedType = String(type || '').trim().toLowerCase()
            return normalizedType === 'newgrid'
          }

          // Helper function to update grid cell
          const updateGridCell = (gridComp: any, rowIdx: number, colIdx: number, compType: string): boolean => {
            // Ensure props exists
            if (!gridComp.props) gridComp.props = {}

            // Initialize cells if not exists
            if (!gridComp.props.cells) {
              const rows = gridComp.props?.rows || 1
              const cols = gridComp.props?.columns || 3
              debugLog('🏗️ Initializing grid cells:', { rows, cols })
              gridComp.props.cells = Array(rows)
                .fill(null)
                .map(() =>
                  Array(cols)
                    .fill(null)
                    .map(() => ({ component: null })),
                )
            }

            // Ensure target cell exists
            if (!gridComp.props.cells[rowIdx]) {
              gridComp.props.cells[rowIdx] = []
            }
            if (!gridComp.props.cells[rowIdx][colIdx]) {
              gridComp.props.cells[rowIdx][colIdx] = { component: null }
            }

            // Get component definition and create new component
            const componentDef = getComponentDefinition(compType)
            const newComponent: LayoutComponent = {
              id: `${compType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: compType,
              label: componentDef?.name || compType,
              props: componentDef?.defaultProps ? { ...componentDef.defaultProps } : {},
            }

            // Update the cell
            gridComp.props.cells[rowIdx][colIdx] = {
              ...gridComp.props.cells[rowIdx][colIdx],
              component: newComponent,
            }

            debugLog('✅ Component added to grid cell:', {
              rowIndex: rowIdx,
              colIndex: colIdx,
              componentType: compType,
              gridId: gridComp.id,
            })

            return true
          }

          const findAndUpdateGrid = (components: any[]): boolean => {
            for (const comp of components || []) {
              if (!comp) continue

              if (isGridComponentType(comp.type) && comp.id === actualGridId) {
                debugLog('🎯 Found target grid:', comp.id)
                return updateGridCell(comp, rowIndex, colIndex, componentType)
              }

              if (Array.isArray(comp?.props?.components) && findAndUpdateGrid(comp.props.components)) {
                return true
              }

              if (Array.isArray(comp?.props?.slides)) {
                for (const slide of comp.props.slides) {
                  if (Array.isArray(slide?.components) && findAndUpdateGrid(slide.components)) {
                    return true
                  }
                }
              }
            }

            return false
          }

          for (const section of newLayout.sections) {
            for (const row of getSectionRows(section)) {
              for (const col of row.columns) {
                if (findAndUpdateGrid(col.components)) {
                  gridUpdated = true
                  break
                }
              }
              if (gridUpdated) break
            }
            if (gridUpdated) break
          }

          if (gridUpdated) {
            debugLog('✅✅✅ Grid updated successfully')
            toast.success('Component added to grid')

            // Auto-save
            setTimeout(() => {
              saveLayout(newLayout).then((success) => {
                debugLog(success ? '💾 Grid update saved' : '❌ Failed to save grid update')
              })
            }, 300)
          } else {
            console.error('❌ Grid not found:', actualGridId)
            toast.error('Grid not found')
          }

          return newLayout
        })

        return
      }

      // In the handleDragEnd function in PageEditor.tsx, add this case:

      // 🎯 2. Handle SWIPER SLIDE drops (NEW)
      if (result.destination.droppableId?.startsWith('swiper-')) {
        debugLog('🔄 Swiper slide drop detected:', result.destination.droppableId)

        // Parse swiper ID and slide index from drop zone ID
        // Format: swiper-{swiperId}-slide-{slideIndex}
        const dropZoneId = result.destination.droppableId
        const match = dropZoneId.match(/swiper-(.+)-slide-(\d+)/)

        if (match) {
          const [, swiperId, slideIndexStr] = match
          const slideIndex = parseInt(slideIndexStr, 10)

          debugLog('🎯 Swiper drop parsed:', {
            swiperId,
            slideIndex,
            componentType,
          })

          // Update layout to add component to swiper slide
          setLayout((prevLayout) => {
            const newLayout = JSON.parse(JSON.stringify(prevLayout))
            let swiperUpdated = false

            // Deep search function for swiper
            const findAndUpdateSwiper = (components: any[]): boolean => {
              for (let i = 0; i < components.length; i++) {
                const comp = components[i]
                if (!comp) continue

                // Check if this is the target swiper
                const isMatchingSwiper =
                  comp.type === 'swipercontainer' && (comp.id === swiperId || comp.id === `swiper-${swiperId}` || comp.id.includes(swiperId))

                if (isMatchingSwiper) {
                  debugLog('🎯 Found target swiper:', {
                    compId: comp.id,
                    swiperId,
                    hasSlides: !!comp.props?.slides,
                    currentSlides: comp.props?.slides || [],
                  })

                  // Initialize swiper props if needed
                  if (!comp.props) comp.props = {}
                  if (!comp.props.slides) {
                    comp.props.slides = [
                      {
                        id: `slide-${Date.now()}`,
                        components: [],
                        bgType: 'gradient',
                        bgGradient: 'linear-gradient(135deg, #1a1628, #22263a)',
                        padding: '12px',
                      },
                    ]
                  }

                  // Ensure slide exists at index
                  if (slideIndex >= comp.props.slides.length) {
                    debugLog('🆕 Creating missing slide at index:', slideIndex)
                    while (comp.props.slides.length <= slideIndex) {
                      comp.props.slides.push({
                        id: `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        components: [],
                        bgType: 'gradient',
                        bgGradient: 'linear-gradient(135deg, #1a1628, #22263a)',
                        padding: '12px',
                      })
                    }
                  }

                  const targetSlide = comp.props.slides[slideIndex]
                  if (!targetSlide.components) targetSlide.components = []

                  // Get component definition and create new component
                  const componentDef = getComponentDefinition(componentType)
                  const newComponent: LayoutComponent = {
                    id: `${componentType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    type: componentType,
                    label: componentDef?.name || componentType,
                    props: componentDef?.defaultProps ? { ...componentDef.defaultProps } : {},
                  }

                  // Special handling for NewGrid components
                  if (componentType === 'NewGrid') {
                    // Initialize props if it doesn't exist
                    if (!newComponent.props) {
                      newComponent.props = {}
                    }

                    // Initialize cells for the new grid
                    if (!newComponent.props.cells) {
                      newComponent.props.cells = Array(1)
                        .fill(null)
                        .map(() =>
                          Array(3)
                            .fill(null)
                            .map(() => ({ component: null })),
                        )
                    }
                  }

                  // Add to target slide
                  targetSlide.components.push(newComponent)

                  debugLog('✅ Component added to swiper slide:', {
                    slideIndex: slideIndex,
                    componentType,
                    componentId: newComponent.id,
                    slideComponentsCount: targetSlide.components.length,
                    slideComponents: targetSlide.components.map((c: any) => ({ type: c.type, id: c.id })),
                  })

                  // 🆕 CRITICAL: Force update the component props
                  comp.props = { ...comp.props }

                  swiperUpdated = true
                  return true
                }

                // Recursively search nested components
                if (comp.props?.components) {
                  const validComponents = comp.props.components.filter((c: LayoutComponent | null) => c !== null) as LayoutComponent[]
                  if (findAndUpdateSwiper(validComponents)) return true
                }

                // Search in carousel slides
                if (comp.type === 'carousel' && comp.props?.slides) {
                  for (const slide of comp.props.slides) {
                    if (slide?.components) {
                      const validComponents = slide.components.filter((c: LayoutComponent) => c !== null)
                      if (findAndUpdateSwiper(validComponents)) return true
                    }
                  }
                }
              }
              return false
            }

            // Search everywhere in layout
            const searchEverywhere = (): boolean => {
              // Search sections
              for (const section of newLayout.sections) {
                for (const row of section.container.rows) {
                  for (const col of row.columns) {
                    const validComponents = col.components.filter((c: LayoutComponent | null) => c !== null) as LayoutComponent[]
                    if (findAndUpdateSwiper(validComponents)) return true
                  }
                }
              }

              // Search top-level components
              if (newLayout.components?.length > 0) {
                const validComponents = newLayout.components.filter((c: LayoutComponent | null) => c !== null) as LayoutComponent[]
                if (findAndUpdateSwiper(validComponents)) return true
              }

              return false
            }

            if (searchEverywhere()) {
              debugLog('✅ Swiper updated successfully - COMPLETE LAYOUT:', JSON.stringify(newLayout, null, 2))

              // Auto-save
              if (saveLayout) {
                setTimeout(() => {
                  saveLayout(newLayout).then((success) => {
                    debugLog(success ? '💾 Swiper update saved' : '❌ Failed to save swiper update')
                  })
                }, 300)
              }

              return newLayout
            }

            console.error('❌ Swiper not found in layout:', swiperId)
            return newLayout
          })

          toast.success(`Component added to swiper slide ${slideIndex + 1}`)
          return
        }
      }

      // 🎯 2. Handle CAROUSEL drops
      if (result.destination.droppableId?.startsWith('component:carousel-')) {
        debugLog('🎠 Carousel drop detected')
        layoutActionsHandleDragEnd(result, draggedItem)
        return
      }

      // 🎯 3. ✅✅✅ CRITICAL FIX: Handle COLUMN drops (FIXED FOR ALL COLUMNS)
      if (result.destination.droppableId?.startsWith('column:')) {
        debugLog('📦 Column drop detected:', result.destination.droppableId)

        // Parse destination: column:sectionId:containerId:rowId:columnId
        const destParts = result.destination.droppableId.split(':')
        debugLog('🔍 Destination parts:', destParts)

        // Handle both formats:
        // Format 1: column:sectionId:containerId:rowId:columnId (from PageEditorCanvas)
        // Format 2: column:sectionId:rowId:columnId (simplified)
        let sectionId, containerId, rowId, columnId

        if (destParts.length === 5) {
          // Format 1
          ;[, sectionId, containerId, rowId, columnId] = destParts
        } else if (destParts.length === 4) {
          // Format 2
          ;[, sectionId, rowId, columnId] = destParts
          containerId = 'container-' + sectionId // Default container ID
        } else {
          console.error('❌ Invalid column droppableId format:', result.destination.droppableId)
          return
        }

        debugLog('🔍 Column destination parsed:', { sectionId, containerId, rowId, columnId })

        // Get component definition
        const componentDef = getComponentDefinition(componentType)
        if (!componentDef) {
          console.error('❌ Component definition not found:', componentType)
          toast.error(`Component type "${componentType}" not found`)
          return
        }

        // Create new component
        const newComponent: LayoutComponent = {
          id: `${componentType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: componentType,
          label: componentDef.name || componentType,
          props: componentDef.defaultProps ? { ...componentDef.defaultProps } : {},
        }

        debugLog('🎯 Creating new component for column:', newComponent.id)

        // Update layout - Add to specific column
        setLayout((prevLayout) => {
          const newLayout = JSON.parse(JSON.stringify(prevLayout))
          let componentAdded = false

          // Find and update the target column
          for (const section of newLayout.sections) {
            if (section.id === sectionId) {
              // Find the container
              const container = section.container
              if (container.id === containerId || !containerId) {
                // Find the row
                for (const row of container.rows) {
                  if (row.id === rowId || row.id === `row-${sectionId}`) {
                    // Find the column
                    for (const col of row.columns) {
                      if (col.id === columnId) {
                        // Add component to this column at the specified index
                        const insertIndex = result.destination?.index ?? col.components.length
                        col.components.splice(insertIndex, 0, newComponent)
                        if (!section.name || section.name === 'New Section') {
                          section.name = componentDef.name || componentType
                        }

                        debugLog('✅ Component added to column:', {
                          sectionName: section.name,
                          columnId,
                          columnIndex: row.columns.indexOf(col),
                          insertIndex,
                          newComponentId: newComponent.id,
                        })

                        componentAdded = true

                        // Auto-save
                        setTimeout(() => {
                          saveLayout(newLayout).then((success) => {
                            debugLog(success ? '💾 Column drop saved' : '❌ Save failed')
                          })
                        }, 300)

                        break
                      }
                    }
                  }
                  if (componentAdded) break
                }
              }
            }
            if (componentAdded) break
          }

          if (!componentAdded) {
            console.error('❌ Target column not found:', { sectionId, containerId, rowId, columnId })
            debugLog(
              '🔍 Available sections:',
              newLayout.sections.map((s: any) => ({
                id: s.id,
                rows: s.container?.rows?.map((r: any) => ({
                  id: r.id,
                  columns: r.columns?.map((c: any) => c.id),
                })),
              })),
            )
          }

          return newLayout
        })

        toast.success(`${componentDef.name || componentType} added to column`)
        return
      }

      // 4. All other drops - use layoutActionsHandleDragEnd
      debugLog('📦 Processing other types of drops')
      layoutActionsHandleDragEnd(result, draggedItem)
    },
    [layoutActionsHandleDragEnd, setLayout, getComponentDefinition, saveLayout],
  )

  // 🆕 Function to create section with name - FIXED TO ADD AT BOTTOM
  const createSectionWithColumns = useCallback(
    (columnCount: number) => {
      const timestamp = Date.now()
      const columns = Array.from({ length: columnCount }, (_, index) => ({
        id: `col-${timestamp}-${index}`,
        width: 100 / columnCount,
        components: [],
      }))

      const newSection: Section = {
        id: `section-${timestamp}`,
        name: 'New Section',
        type: 'custom',
        container: {
          id: `container-${timestamp}`,
          rows: [
            {
              id: `row-${timestamp}`,
              columns,
            },
          ],
        },
      }

      setLayout((prevLayout) => ({
        ...prevLayout,
        sections: [...(prevLayout?.sections || []), newSection],
      }))

      setSelectedSectionId(newSection.id)
      setSelectedComponent(null)
      setShowColumnModal(false)
      toast.success(`Added ${columnCount} column section`)
    },
    [setLayout],
  )

  const handleAddSectionWithColumns = useCallback((columnCount: number) => {
    createSectionWithColumns(columnCount)
  }, [createSectionWithColumns])

  // 🆕 Function to show column selection modal
  const handleAddSectionClick = useCallback(() => {
    setShowColumnModal(true)
  }, [])

  const handleComponentSelect = useCallback(
    (
      component: LayoutComponent,
      context: {
        sectionId: string
        containerId: string
        rowId: string
        colId: string
        carouselId?: string
        slideIndex?: number
        gridId?: string
        cellRow?: number
        cellCol?: number
        source?: 'grid-cell' | 'carousel-direct' | 'slide'
        isNestedSelection?: boolean
        parentComponentId?: string
        parentGridId?: string
      },
    ) => {
      // ✅ ADD: Prevent multiple rapid selections
      if (selectedComponent?.compId === component.id) {
        return // Already selected, don't do anything
      }

      debugLog('🎯 [PageEditor] Component selected (WITH NESTED CONTEXT):', {
        componentId: component.id,
        componentType: component.type,
        context,
        isGridChild: !!context.gridId,
        isCarouselChild: !!context.carouselId,
        hasCellPosition: context.cellRow !== undefined && context.cellCol !== undefined,
        timestamp: new Date().toISOString(),
      })

      // ✅ FIXED: Set selected component with ALL context information
      setSelectedComponent({
        sectionId: context.sectionId,
        containerId: context.containerId,
        rowId: context.rowId,
        colId: context.colId,
        compId: component.id,
        component: component,
        // ✅ CRITICAL: Pass ALL nested context
        carouselId: context.carouselId,
        slideIndex: context.slideIndex,
        gridId: context.gridId || context.parentGridId,
        cellRow: context.cellRow,
        cellCol: context.cellCol,
      })
      setSelectedSectionId(context.sectionId)
    },
    [selectedComponent],
  )

  const handleComponentEdit = useCallback(
    (componentId: string) => {
      // Simple find function
      let foundComponent: LayoutComponent | null = null
      let foundContext: any = null

      const searchComponent = (sections: Section[]): boolean => {
        for (const section of sections) {
          for (const row of getSectionRows(section)) {
            for (const col of row.columns) {
              for (const comp of col.components) {
                if (comp?.id === componentId) {
                  foundComponent = comp
                  foundContext = {
                    sectionId: section.id,
                    containerId: section.container.id,
                    rowId: row.id,
                    colId: col.id,
                  }
                  return true
                }
              }
            }
          }
        }
        return false
      }

      if (searchComponent(layout?.sections || [])) {
        setSelectedComponent({
          ...foundContext,
          compId: componentId,
          component: foundComponent!,
        })
        setSelectedSectionId(foundContext.sectionId)
      }
    },
    [layout],
  )

  const handleComponentUpdate = useCallback(
    (componentId: string, props: Record<string, any>) => {
      debugLog('🎯 [PageEditor] handleComponentUpdate called:', {
        componentId,
        props,
        imageProp: props.image,
        imageLength: props.image?.length,
        isBase64: props.image?.startsWith?.('data:'),
        hasText: !!props.text,
        hasTitle: !!props.title,
        timestamp: new Date().toISOString(),
        // Add context info
        selectedComponent: selectedComponent?.compId,
        isSameAsSelected: selectedComponent?.compId === componentId,
      })

      // 🎯 DEBUG: Log the props being passed
      Object.keys(props).forEach((key) => {
        debugLog(`   📊 ${key}:`, typeof props[key], props[key]?.substring?.(0, 50) || props[key])
      })

      let updatedViaSelectedGridContext = false
      if (
        selectedComponent?.gridId &&
        selectedComponent.cellRow !== undefined &&
        selectedComponent.cellCol !== undefined &&
        selectedComponent.compId === componentId
      ) {
        setLayout((prevLayout) => {
          const nextLayout = JSON.parse(JSON.stringify(prevLayout))
          let updated = false

          const updateInComponents = (components: any[]): boolean => {
            for (const comp of components || []) {
              if (!comp) continue

              const normalizedType = String(comp.type || '').trim().toLowerCase()
              if ((normalizedType === 'newgrid') && comp.id === selectedComponent.gridId) {
                const row = comp.props?.cells?.[selectedComponent.cellRow!]
                const cell = row?.[selectedComponent.cellCol!]
                if (cell?.component?.id === componentId) {
                  cell.component = {
                    ...cell.component,
                    props: {
                      ...cell.component.props,
                      ...props,
                    },
                  }
                  updatedViaSelectedGridContext = true
                  return true
                }
              }

              if (Array.isArray(comp?.props?.components) && updateInComponents(comp.props.components)) {
                return true
              }

              if (Array.isArray(comp?.props?.slides)) {
                for (const slide of comp.props.slides) {
                  if (Array.isArray(slide?.components) && updateInComponents(slide.components)) {
                    return true
                  }
                }
              }
            }

            return false
          }

          for (const section of nextLayout.sections || []) {
            for (const row of getSectionRows(section)) {
              for (const column of row.columns || []) {
                if (updateInComponents(column.components || [])) {
                  updated = true
                  break
                }
              }
              if (updated) break
            }
            if (updated) break
          }

          if (!updated) {
            return prevLayout
          }

          return nextLayout
        })

        if (updatedViaSelectedGridContext) {
          return
        }
      }

      // 🎯 CRITICAL: Update the layout via the layout actions
      debugLog('🔄 Calling layoutActionsHandleComponentUpdate...')
      layoutActionsHandleComponentUpdate(componentId, props)

      // 🎯 Optional: Add special handling for grid children
      if (componentId.includes('advancedCard') || componentId.includes('advancedImage')) {
        debugLog('🔍 Grid child component detected, ensuring update propagates')

        // Trigger a force update for grids containing this component
        setLayout((prev) => {
          debugLog('🔄 Force updating layout for grid child')
          return { ...prev }
        })
      }
    },
    [layoutActionsHandleComponentUpdate, selectedComponent, setLayout],
  )

  const handleComponentDuplicate = useCallback((component: LayoutComponent) => {
    // TODO: Implement duplicate logic
    debugLog('Duplicate component:', component)
  }, [])

  const handleSectionSelect = useCallback((sectionId: string) => {
    setSelectedSectionId(sectionId)
    setSelectedComponent(null)
  }, [])

  // ✅ UPDATED: handleSectionEdit for PropertyPanel integration
  const handleSectionEdit = useCallback(
    (sectionId: string) => {
      debugLog('🎯 [PageEditor] handleSectionEdit called:', {
        sectionId,
        timestamp: new Date().toISOString(),
        currentSelectedSectionId: selectedSectionId,
        currentSelectedComponent: selectedComponent?.compId,
      })

      // ✅ CRITICAL: Set selectedSectionId and clear component
      setSelectedSectionId(sectionId)
      setSelectedComponent(null)

      // ✅ DEBUG LOG
      debugLog('✅ Section selected for editing:', {
        sectionId,
        selectedSectionId: sectionId,
        componentCleared: true,
      })
    },
    [setSelectedSectionId, setSelectedComponent, selectedSectionId, selectedComponent],
  )

  // ✅✅✅ CRITICAL FIX: COMPLETELY FIXED handleSectionUpdate function
  const handleSectionUpdate = useCallback(
    (sectionId: string, updates: any) => {
      debugLog('🎯 [PageEditor] handleSectionUpdate called:', {
        sectionId,
        updates,
        hasSettings: !!updates.settings,
        hasContainer: !!updates.container,
        hasName: !!updates.name,
        timestamp: new Date().toISOString()
      })

      // ✅ CRITICAL: Update layout state IMMEDIATELY
      setLayout((prevLayout) => {
        const newLayout = JSON.parse(JSON.stringify(prevLayout))
        
        const sectionIndex = newLayout.sections.findIndex((s: Section) => s.id === sectionId)
        if (sectionIndex === -1) {
          console.error('❌ Section not found:', sectionId)
          return prevLayout
        }

        const currentSection = newLayout.sections[sectionIndex]
        
        // ✅ DEEP MERGE: Create updated section
        const updatedSection = {
          ...currentSection,
          // Basic properties
          ...(updates.name && { name: updates.name }),
          ...(updates.type && { type: updates.type }),
          props: updates.props
            ? {
                ...(currentSection.props || {}),
                ...updates.props,
              }
            : currentSection.props,
          
          // ✅ SETTINGS: Deep merge with existing settings
          settings: {
            ...(currentSection.settings || {}),
            ...(updates.settings || {})
          },
          
          // ✅ CONTAINER: Deep merge with existing container
          container: updates.container 
            ? {
                ...(currentSection.container || {}),
                ...updates.container,
                rows: updates.container.rows || currentSection.container?.rows || []
              }
            : currentSection.container
        }

        debugLog('✅✅✅ Section UPDATED in state:', {
          beforeSettings: currentSection.settings,
          afterSettings: updatedSection.settings,
          backgroundColor: updatedSection.settings?.backgroundColor,
          sectionId,
          sectionName: updatedSection.name
        })

        return {
          ...newLayout,
          sections: newLayout.sections.map((section: Section, index: number) =>
            index === sectionIndex ? updatedSection : section,
          ),
        }
      })

      // ✅ ALSO update selectedSection state if it's the selected one
      if (selectedSectionId === sectionId) {
        setLayout((currentLayout) => {
          const section = currentLayout.sections.find((s: Section) => s.id === sectionId)
          if (section) {
            debugLog('🔄 Updated selected section in state')
          }
          return currentLayout
        })
      }
    },
    [setLayout, selectedSectionId]
  )

  const handleSectionDuplicate = useCallback(
    (sectionId: string) => {
      setLayout((currentLayout) => {
        const sectionIndex = currentLayout.sections.findIndex((section) => section.id === sectionId)
        if (sectionIndex === -1) {
          return currentLayout
        }

        const duplicatedSection = cloneSectionWithNewIds(currentLayout.sections[sectionIndex])
        const nextSections = [...currentLayout.sections]
        nextSections.splice(sectionIndex + 1, 0, duplicatedSection)

        const nextLayout = {
          ...currentLayout,
          sections: nextSections,
        }

        setSelectedSectionId(duplicatedSection.id)
        setSelectedComponent(null)
        toast.success('Section duplicated')

        return nextLayout
      })
    },
    [setLayout],
  )

  const handleSectionMove = useCallback(
    (sectionId: string, direction: 'up' | 'down') => {
      setLayout((currentLayout) => {
        const sectionIndex = currentLayout.sections.findIndex((section) => section.id === sectionId)
        if (sectionIndex === -1) {
          return currentLayout
        }

        const targetIndex = direction === 'up' ? sectionIndex - 1 : sectionIndex + 1
        if (targetIndex < 0 || targetIndex >= currentLayout.sections.length) {
          return currentLayout
        }

        const nextSections = [...currentLayout.sections]
        const [movedSection] = nextSections.splice(sectionIndex, 1)
        if (!movedSection) {
          return currentLayout
        }
        nextSections.splice(targetIndex, 0, movedSection)

        return {
          ...currentLayout,
          sections: nextSections,
        }
      })
    },
    [setLayout],
  )

  const handleSectionDeleteCallback = useCallback(
    (sectionId: string) => {
      debugLog('🗑️ Deleting section:', sectionId)

      // ✅ FIX: Use setLayout to get UPDATED layout
      setLayout((currentLayout) => {
        // 1. Create new layout WITHOUT the section
        const updatedLayout = {
          ...currentLayout,
          sections: currentLayout.sections.filter((s) => s.id !== sectionId),
        }

        debugLog('✅ Section removed:', {
          before: currentLayout.sections.length,
          after: updatedLayout.sections.length,
        })

        // 2. ✅ Auto-save with UPDATED layout (not stale `layout`)
        setTimeout(() => {
          saveLayout(updatedLayout).then((success) => {
            debugLog(success ? '✅ Auto-save successful' : '❌ Auto-save failed')
          })
        }, 100)

        return updatedLayout // ✅ Return updated layout
      })

      toast.success('Section deleted successfully')
    },
    [saveLayout],
  )

  const handleColumnDeleteCallback = useCallback(
    (sectionId: string, containerId: string, rowId: string, colId: string) => {
      setConfirmationModal({
        isOpen: true,
        title: 'Delete Column',
        message: 'Are you sure you want to delete this column? This action cannot be undone.',
        onConfirm: () => {
          // 1. Delete column
          handleColumnDelete(sectionId, containerId, rowId, colId)

          // ✅ CRITICAL FIX: Auto-save after deletion
          setTimeout(async () => {
            try {
              debugLog('💾 Auto-saving after column deletion...')
              const success = await saveLayout(currentLayoutRef.current)
              if (success) {
                debugLog('✅ Layout auto-saved after column deletion')
              }
            } catch (error) {
              console.error('❌ Error auto-saving after column deletion:', error)
            }
          }, 300)

          setConfirmationModal((prev) => ({ ...prev, isOpen: false }))
          toast.success('Column deleted successfully')
        },
        type: 'danger',
      })
    },
    [handleColumnDelete, saveLayout, layout],
  )

  const handleSectionContentUpdate = useCallback(
    (sectionId: string, content: string) => {
      setLayout((prev) => ({
        ...prev,
        sections: prev.sections.map((s) => (s.id === sectionId ? { ...s, content } : s)),
      }))
    },
    [setLayout],
  )

  const handleSave = useCallback(async () => {
    const success = await saveNow(true)
    if (success) {
      toast.success('Draft saved successfully')
    } else {
      toast.error('Failed to save draft')
    }
  }, [saveNow])

  const handlePageSelect = useCallback(
    async (pageId: string | null) => {
      const nextPageId = pageId == null ? null : String(pageId)

      if (nextPageId === currentPageId) {
        return
      }

      if (currentPageId) {
        const saved = await saveNow(true)
        if (!saved) {
          toast.error('Save failed. Please try again before switching pages.')
          return
        }
      }

      setCurrentPageId(nextPageId)
    },
    [currentPageId, saveNow, setCurrentPageId],
  )

  const handlePublish = useCallback(async () => {
    if (!currentPageId) {
      toast.error('Select a page before publishing')
      return
    }

    const sections = Array.isArray(layout?.sections) ? layout.sections : []

    if (!sections.length) {
      toast.error('Add at least one section before publishing')
      return
    }

    setIsPublishing(true)
    try {
      const saved = await saveNow(true)
      if (!saved && hasPendingChanges) {
        toast.error('Publish stopped because the latest layout could not be saved')
        return
      }

      const versionResponse = await fetch('/api/versions/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_id: Number.parseInt(currentPageId, 10),
          name: `Published ${new Date().toLocaleString()}`,
          description: 'Manual publish snapshot',
          layout: layout || { id: currentPageId, name: 'Untitled Page', sections: [] },
          created_by: 'admin',
        }),
      })
      const versionData = await versionResponse.json()
      if (!versionResponse.ok || !versionData.success) {
        toast.error(getApiErrorMessage(versionData, 'Failed to create publish version'))
        return
      }

      const publishResponse = await fetch(`/api/pages/${currentPageId}/publish`, { method: 'POST' })
      const publishData = await publishResponse.json()
      if (!publishResponse.ok || !publishData.success) {
        toast.error(getApiErrorMessage(publishData, 'Failed to update page publish status'))
        return
      }

      setLastPublishedAt(publishData.page?.published_at || publishData.data?.published_at || new Date().toISOString())
      toast.success('Page published successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to publish page')
    } finally {
      setIsPublishing(false)
    }
  }, [currentPageId, hasPendingChanges, layout, saveNow])

  const scheduleSeoSave = useCallback(
    (updates: { meta_title?: string | null; meta_description?: string | null; meta_image?: string | null }) => {
      if (!currentPageId) {
        return
      }

      if (seoSaveTimeoutRef.current) {
        clearTimeout(seoSaveTimeoutRef.current)
      }

      seoSaveTimeoutRef.current = setTimeout(async () => {
        try {
          setIsSavingSeo(true)
          const response = await fetch(`/api/pages/${currentPageId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          })
          const data = await response.json()

          if (!response.ok || !data.success) {
            throw new Error(getApiErrorMessage(data, 'Failed to save SEO settings'))
          }

          toast.success('SEO settings saved', { id: 'seo-save' })
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Failed to save SEO settings', { id: 'seo-save' })
        } finally {
          setIsSavingSeo(false)
        }
      }, 700)
    },
    [currentPageId],
  )

  useEffect(() => {
    const handleAdminAction = (event: Event) => {
      const customEvent = event as CustomEvent<{ action?: string }>
      const action = customEvent.detail?.action

      if (action === 'history') {
        setShowHistory(true)
        return
      }

      if (action === 'templates') {
        setShowTemplates(true)
        return
      }

      if (action === 'save-draft') {
        void handleSave()
        return
      }

      if (action === 'publish') {
        void handlePublish()
      }
    }

    window.addEventListener('cm-admin-action', handleAdminAction as EventListener)

    return () => {
      window.removeEventListener('cm-admin-action', handleAdminAction as EventListener)
    }
  }, [handlePublish, handleSave])

  const updateHeaderFooterAssignment = useCallback(
    async (nextValues: { header_slug?: string | null; footer_slug?: string | null }) => {
      if (!currentPageId) {
        return
      }

      const response = await fetch(`/api/pages/${currentPageId}/header-footer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextValues),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(getApiErrorMessage(data, 'Failed to save header/footer assignment'))
      }
    },
    [currentPageId],
  )

  const handleHeaderChange = useCallback(
    async (slug: string) => {
      const previous = selectedHeaderSlug
      setSelectedHeaderSlug(slug)

      try {
        await updateHeaderFooterAssignment({ header_slug: slug || null })
        toast.success('Header assigned successfully')
      } catch (error) {
        setSelectedHeaderSlug(previous)
        toast.error(error instanceof Error ? error.message : 'Failed to assign header')
      }
    },
    [selectedHeaderSlug, updateHeaderFooterAssignment],
  )

  const handleFooterChange = useCallback(
    async (slug: string) => {
      const previous = selectedFooterSlug
      setSelectedFooterSlug(slug)

      try {
        await updateHeaderFooterAssignment({ footer_slug: slug || null })
        toast.success('Footer assigned successfully')
      } catch (error) {
        setSelectedFooterSlug(previous)
        toast.error(error instanceof Error ? error.message : 'Failed to assign footer')
      }
    },
    [selectedFooterSlug, updateHeaderFooterAssignment],
  )

  const currentLayoutName = layout?.name || 'Current Page'
  const currentLayoutSections = Array.isArray(layout?.sections) ? layout.sections : []
  const safeCurrentLayout: PageLayout =
    layout && Array.isArray(layout?.sections)
      ? layout
      : { id: currentPageId || '', name: currentLayoutName, sections: currentLayoutSections }

  const handleRestoreVersion = useCallback(
    (version: { layout?: PageLayout | null }) => {
      const restoredLayout = version.layout || { id: currentPageId || '', name: currentLayoutName, sections: [] }
      setBaseLayout(restoredLayout)
      setLayout(restoredLayout)
      setShowHistory(false)
      toast.success('Version restored successfully')
    },
    [currentPageId, currentLayoutName, setBaseLayout, setLayout],
  )

  const handleApplyTemplate = useCallback(
    async (template: { id: string; name?: string }) => {
      const nextLayout = await applyTemplate(template.id)
      if (nextLayout) {
        setBaseLayout(nextLayout)
        setLayout(nextLayout)
        resetHistory(nextLayout)
        setShowTemplates(false)
        toast.success(`Template "${template.name || 'Template'}" applied successfully`)
      } else {
        toast.error(`Failed to apply template "${template.name || 'Template'}"`)
      }

      return Boolean(nextLayout)
    },
    [applyTemplate, resetHistory, setBaseLayout, setLayout],
  )

  const handleLayoutChange = useCallback(
    (newLayout: any) => {
      setLayout(newLayout)
    },
    [setLayout],
  )

  // 🆕 FIXED: Updated handleAddPage function with modal support
  const handleAddPage = useCallback(
    async (pageName?: string) => {
      try {
        const nameToUse = pageName?.trim() || 'New Page'

        const newPage = await createPage(nameToUse)
        if (newPage) {
          const initialLayout = {
            id: newPage.id,
            name: newPage.name,
            sections: [],
          }

          // Set base layout for the new page
          setBaseLayout(initialLayout)

          // Set current page to the new page
          setCurrentPageId(newPage.id)

          // Reset undo/redo history for new page
          setLayout(initialLayout)

          // Show success message
          toast.success(`Page "${nameToUse}" created successfully`)
        }
      } catch (error) {
        console.error('Error creating page:', error)
        toast.error('Failed to create page')
      }
    },
    [createPage, setBaseLayout, setCurrentPageId, setLayout],
  )

  const handleAddPageWithPrompt = useCallback(() => {
    const rawName = window.prompt('Enter page name', 'New Page')
    if (rawName === null) {
      return
    }

    const nextName = rawName.trim() || 'New Page'
    void handleAddPage(nextName)
  }, [handleAddPage])

  const handleRenamePage = useCallback(
    async (pageId: string, nextName: string) => {
      const result = await renamePage(pageId, nextName)
      if (result.success) {
        toast.success(`Page renamed to "${nextName}"`)
      } else {
        toast.error(result.error || 'Failed to rename page')
      }
    },
    [renamePage],
  )

  // Initialize component registry
  useEffect(() => {
    initializeComponentRegistry()
  }, [])

  const saveStatusLabel = formatSaveStatus(lastSaved, isAutoSaving, hasPendingChanges, saveConflict)
  const publishedStatusLabel = formatPublishedStatus(lastPublishedAt)

  if (loading && !pages.length && !currentLayoutSections.length) {
    return (
      <div className="cm-page-editor editor-shell flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-5xl space-y-4 px-6">
          <div className="h-12 animate-pulse rounded-xl bg-white/[0.08]" />
          <div className="grid grid-cols-[220px_1fr_260px] gap-4">
            <div className="h-[520px] animate-pulse rounded-2xl bg-white/[0.06]" />
            <div className="h-[520px] animate-pulse rounded-2xl bg-white/10" />
            <div className="h-[520px] animate-pulse rounded-2xl bg-white/[0.06]" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div ref={containerRef} className="cm-page-editor editor-shell">
        {loading && pages.length ? (
          <div className="cm-inline-notice">
            Loading page data...
          </div>
        ) : null}
        {error ? (
          <div className="cm-inline-notice is-danger">
            {error}
          </div>
        ) : null}
        {!isPreviewMode ? (
          <div className="ed-bar">
            <CanvasToolbar
              pages={pages.map((p) => ({ id: p.id, name: p.name, active: p.active, disabled: p.disabled }))}
              currentPageId={currentPageId}
              currentPageSlug={currentPage?.slug}
              onPageSelect={(pageId) => {
                void handlePageSelect(pageId)
              }}
              onAddPage={handleAddPageWithPrompt}
              onSaveDraft={() => {
                void handleSave()
              }}
              showSaveButton={showSaveButton}
              onAddSection={handleAddSectionClick}
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={undo}
              onRedo={redo}
              showGrid={showCanvasGrid}
              onToggleGrid={() => setShowCanvasGrid((value) => !value)}
              deviceMode={deviceMode}
              onDeviceModeChange={setDeviceMode}
              zoom={canvasZoom}
              onZoomChange={setCanvasZoom}
              sectionCount={currentLayoutSections.length}
              saveStatusLabel={saveStatusLabel}
              lastPublishedLabel={publishedStatusLabel}
              headerOptions={headerOptions}
              footerOptions={footerOptions}
              selectedHeaderSlug={selectedHeaderSlug}
              selectedFooterSlug={selectedFooterSlug}
              onHeaderChange={handleHeaderChange}
              onFooterChange={handleFooterChange}
              onPublish={() => {
                void handlePublish()
              }}
              isPublishing={isPublishing}
              onPreviewDraft={handlePreviewDraft}
              onDisablePage={async (pageId, disabled) => {
                const success = await disablePage(pageId, disabled)
                if (success) {
                  toast.success(`Page ${disabled ? 'disabled' : 'enabled'} successfully`)
                } else {
                  toast.error(`Failed to ${disabled ? 'disable' : 'enable'} page`)
                }
              }}
              onDeletePage={async (pageId) => {
                const result = await deletePage(pageId)
                if (result.success) {
                  toast.success('Page deleted successfully')
                } else {
                  toast.error(result.error || 'Failed to delete page')
                }
              }}
              onRenamePage={(pageId, nextName) => {
                void handleRenamePage(pageId, nextName)
              }}
            />
          </div>
        ) : null}
        {/* Main Content Area */}
        <div className="ed-body flex-1 min-h-0 overflow-hidden">
          {/* Left Sidebar */}
          <div className={`left-col min-h-0 ${!isPreviewMode && leftSidebarVisible ? 'open' : 'closed'}`}>
            {!isPreviewMode && leftSidebarVisible && (
              <div className="left-inner">
                <LeftSidebar
                  layout={layout}
                  selectedSectionId={selectedSectionId}
                  selectedComponentId={selectedComponent?.compId}
                  onSectionSelect={handleSectionSelect}
                  onComponentSelect={handleComponentSelect}
                  onComponentAdd={handleComponentAdd}
                />
              </div>
            )}
          </div>

          {!isPreviewMode ? (
            <button
              onClick={() => setLeftSidebarVisible((value) => !value)}
              className="toggle-btn"
              aria-label={leftSidebarVisible ? 'Collapse left sidebar' : 'Expand left sidebar'}>
              <span className="toggle-arrow">{leftSidebarVisible ? '◀' : '▶'}</span>
              <span className="tb-label">Comps</span>
            </button>
          ) : (
            <div />
          )}

          {/* Canvas Area */}
          <div className="canvas-col min-h-0">
            <PageEditorCanvas
              layout={layout}
              setLayout={setLayout}
              zoom={canvasZoom}
              onZoomChange={setCanvasZoom}
              selectedSectionId={selectedSectionId}
              selectedComponent={selectedComponent}
              editingSectionId={selectedSectionId}
              onSectionSelect={handleSectionSelect}
              onSectionEdit={handleSectionEdit}
              onSectionUpdate={handleSectionUpdate}
              onSectionContentUpdate={handleSectionContentUpdate}
              onSectionDuplicate={handleSectionDuplicate}
              onSectionMove={handleSectionMove}
              onSectionDelete={handleSectionDeleteCallback}
              onComponentSelect={handleComponentSelect}
              onComponentEdit={handleComponentEdit}
              onComponentDuplicate={handleComponentDuplicate}
              onComponentDelete={handleComponentDelete}
              onComponentUpdate={handleComponentUpdate}
              onColumnDelete={handleColumnDeleteCallback}
              onDragEnd={handleDragEnd}
              onAddSection={handleAddSectionClick}
              onSetSectionRows={handleSetSectionRows}
              onSetSectionColumns={handleSetSectionColumns}
              isWide={!leftSidebarVisible && !rightSidebarVisible}
              showGrid={showCanvasGrid}
              onToggleGrid={() => setShowCanvasGrid((value) => !value)}
              deviceMode={deviceMode}
              onDeviceModeChange={setDeviceMode}
              isPreviewMode={isPreviewMode}
              onClosePreview={() => setIsPreviewMode(false)}
              pages={pages.map((p) => ({ id: p.id, name: p.name, active: p.active, disabled: p.disabled }))}
              currentPageId={currentPageId}
              currentPageSlug={currentPage?.slug}
              onPageSelect={setCurrentPageId}
              onAddPage={handleAddPageWithPrompt}
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={undo}
              onRedo={redo}
              saveStatusLabel={saveStatusLabel}
              lastPublishedLabel={publishedStatusLabel}
              headerOptions={headerOptions}
              footerOptions={footerOptions}
              selectedHeaderSlug={selectedHeaderSlug}
              selectedFooterSlug={selectedFooterSlug}
              onHeaderChange={handleHeaderChange}
              onFooterChange={handleFooterChange}
              onPublish={() => {
                void handlePublish()
              }}
              isPublishing={isPublishing}
              onPreviewDraft={handlePreviewDraft}
              onDeletePage={async (pageId) => {
                const result = await deletePage(pageId)
                if (result.success) {
                  toast.success('Page deleted successfully')
                } else {
                  toast.error(result.error || 'Failed to delete page')
                }
              }}
              onRenamePage={(pageId, nextName) => {
                void handleRenamePage(pageId, nextName)
              }}
              onDisablePage={async (pageId, disabled) => {
                const success = await disablePage(pageId, disabled)
                if (success) {
                  toast.success(`Page ${disabled ? 'disabled' : 'enabled'} successfully`)
                } else {
                  toast.error(`Failed to ${disabled ? 'disable' : 'enable'} page`)
                }
              }}
            />
          </div>

          {!isPreviewMode ? (
            <button
              onClick={() => setRightSidebarVisible((value) => !value)}
              className="toggle-btn right-tb"
              aria-label={rightSidebarVisible ? 'Collapse right sidebar' : 'Expand right sidebar'}>
              <span className="toggle-arrow">{rightSidebarVisible ? '▶' : '◀'}</span>
              <span className="tb-label">Props</span>
            </button>
          ) : (
            <div />
          )}

          {/* Right Sidebar - Properties Panel */}
          <div className={`right-col min-h-0 ${!isPreviewMode && rightSidebarVisible ? 'open' : 'closed'} m-0 flex overflow-hidden transition-all duration-300 ease-in-out`}>
            {!isPreviewMode && rightSidebarVisible && (
              <div className="flex-1 overflow-auto">
                <PropertyPanel
                  selectedComponent={selectedComponent}
                  selectedSectionId={selectedSectionId}
                  sections={currentLayoutSections}
                  layout={safeCurrentLayout}
                  onComponentUpdate={handleComponentUpdate}
                  onSectionUpdate={handleSectionUpdate} // ✅ This is now the fixed function
                  onClose={() => {
                    setSelectedComponent(null)
                    setSelectedSectionId(undefined)
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 2000,
            },
          }}
        />

        {/* Column Selection Modal */}
        <ColumnSelectionModal isOpen={showColumnModal} onClose={() => setShowColumnModal(false)} onSelect={handleAddSectionWithColumns} />

        {/* Confirmation Modal */}
        {confirmationModal.isOpen && (
          <ConfirmationModal
            isOpen={confirmationModal.isOpen}
            title={confirmationModal.title}
            message={confirmationModal.message}
            onConfirm={confirmationModal.onConfirm}
            onClose={() => setConfirmationModal((prev) => ({ ...prev, isOpen: false }))}
            type={confirmationModal.type}
          />
        )}

        {/* JSON View */}
        {showJsonView && (
          <JSONView layout={safeCurrentLayout} onLayoutChange={handleLayoutChange} isOpen={showJsonView} onToggle={() => setShowJsonView(false)} />
        )}

        {showHistory && currentPageId ? (
          <div className="history-modal-wrap">
            <div className="history-backdrop" onClick={() => setShowHistory(false)} />
            <div className="history-modal">
              <div className="history-top">
                <div>
                  <div className="history-eyebrow">Version History</div>
                  <div className="history-title">{currentLayoutName}</div>
                </div>
                <button type="button" className="gbtn ghost" onClick={() => setShowHistory(false)}>
                  Close
                </button>
              </div>
              <VersionHistory pageId={currentPageId} currentLayout={safeCurrentLayout} onRestore={handleRestoreVersion} className="history-panel" />
            </div>
          </div>
        ) : null}

        {showTemplates ? (
          <div className="history-modal-wrap">
            <div className="history-backdrop" onClick={() => setShowTemplates(false)} />
            <div className="history-modal">
              <div className="history-top">
                <div>
                  <div className="history-eyebrow">Template Library</div>
                  <div className="history-title">{currentLayoutName}</div>
                </div>
                <button type="button" className="gbtn ghost" onClick={() => setShowTemplates(false)}>
                  Close
                </button>
              </div>
              <TemplateManager
                currentLayout={safeCurrentLayout}
                currentPageId={currentPageId}
                onTemplateApplied={handleApplyTemplate}
                className="history-panel"
              />
            </div>
          </div>
        ) : null}
      </div>
    </DragDropProvider>
  )
}

export default React.memo(PageEditor)
