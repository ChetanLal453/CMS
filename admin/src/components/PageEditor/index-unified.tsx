'use client'

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { DndContext } from '@dnd-kit/core'
import { getApiErrorMessage } from '@/lib/apiHelpers'
import { componentRegistry, initializeComponentRegistry } from '@/lib/componentRegistry'
import { LayoutComponent, PageLayout, Page, Section, GlobalTheme, ComponentDefinition } from '@/types/page-editor'
import { usePageData } from './hooks/usePageData'
import { useUIState } from './hooks/useUIState'
import { useLayoutActions, createLayoutComponentFromDefinition, ensureSectionRows } from './hooks/useLayoutActions'
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
  siteSlug?: string
  showPagePills?: boolean
}

const debugLog = (..._args: unknown[]) => {}

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

type UniversalLocation =
  | {
      type: 'column'
      sectionIndex: number
      rowIndex: number
      colIndex: number
      componentIndex: number
      columnId: string
      component: LayoutComponent
    }
  | {
      type: 'grid-cell'
      sectionIndex: number
      rowIndex: number
      colIndex: number
      gridIndex: number
      gridId: string
      cellRow: number
      cellCol: number
      component: LayoutComponent
    }
  | {
      type: 'swiper-slide'
      sectionIndex: number
      rowIndex: number
      colIndex: number
      swiperIndex: number
      swiperId: string
      slideIndex: number
      componentIndex: number
      component: LayoutComponent
    }
  | {
      type: 'nested'
      sectionIndex: number
      rowIndex: number
      colIndex: number
      parentIndex: number
      parentId: string
      componentIndex: number
      component: LayoutComponent
    }
  | {
      type: 'flexbox-child'
      sectionIndex: number
      rowIndex: number
      colIndex: number
      flexboxIndex: number
      flexboxId: string
      componentIndex: number
      component: LayoutComponent
    }

const findUniversalLocation = (layout: PageLayout | undefined, componentId: string): UniversalLocation | null => {
  if (!layout || !componentId) return null
  const sections = Array.isArray(layout.sections) ? layout.sections : []

  for (let sIdx = 0; sIdx < sections.length; sIdx++) {
    const section = sections[sIdx]
    const rows = getSectionRows(section)

    for (let rIdx = 0; rIdx < rows.length; rIdx++) {
      const row = rows[rIdx]
      const cols = Array.isArray(row?.columns) ? row.columns : []

      for (let cIdx = 0; cIdx < cols.length; cIdx++) {
        const col = cols[cIdx]
        const comps = Array.isArray(col?.components) ? col.components : []

        for (let compIdx = 0; compIdx < comps.length; compIdx++) {
          const comp = comps[compIdx]
          if (!comp) continue

          if (comp.id === componentId) {
            return {
              type: 'column',
              sectionIndex: sIdx,
              rowIndex: rIdx,
              colIndex: cIdx,
              componentIndex: compIdx,
              columnId: String(col?.id || ''),
              component: comp,
            }
          }

          const compType = String(comp.type || '').toLowerCase()
          if ((compType === 'newgrid' || compType === 'grid') && Array.isArray(comp.props?.cells)) {
            for (let cellR = 0; cellR < comp.props.cells.length; cellR++) {
              const rowCells = comp.props.cells[cellR]
              if (!Array.isArray(rowCells)) continue

              for (let cellC = 0; cellC < rowCells.length; cellC++) {
                const cell = rowCells[cellC]
                if (cell?.component?.id === componentId) {
                  return {
                    type: 'grid-cell',
                    sectionIndex: sIdx,
                    rowIndex: rIdx,
                    colIndex: cIdx,
                    gridIndex: compIdx,
                    gridId: comp.id,
                    cellRow: cellR,
                    cellCol: cellC,
                    component: cell.component,
                  }
                }
              }
            }
          }

          if (compType === 'swipercontainer' && Array.isArray(comp.props?.slides)) {
            for (let slideIdx = 0; slideIdx < comp.props.slides.length; slideIdx++) {
              const slide = comp.props.slides[slideIdx]
              const slideComps = Array.isArray(slide?.components) ? slide.components : []
              for (let scIdx = 0; scIdx < slideComps.length; scIdx++) {
                if (slideComps[scIdx]?.id === componentId) {
                  return {
                    type: 'swiper-slide',
                    sectionIndex: sIdx,
                    rowIndex: rIdx,
                    colIndex: cIdx,
                    swiperIndex: compIdx,
                    swiperId: comp.id,
                    slideIndex: slideIdx,
                    componentIndex: scIdx,
                    component: slideComps[scIdx],
                  }
                }
              }
            }
          }

          // Search in flexbox children
          if (compType === 'flexbox' && Array.isArray(comp.props?.children)) {
            for (let fIdx = 0; fIdx < comp.props.children.length; fIdx++) {
              if (comp.props.children[fIdx]?.id === componentId) {
                return {
                  type: 'flexbox-child',
                  sectionIndex: sIdx,
                  rowIndex: rIdx,
                  colIndex: cIdx,
                  flexboxIndex: compIdx,
                  flexboxId: comp.id,
                  componentIndex: fIdx,
                  component: comp.props.children[fIdx],
                }
              }
            }
          }

          if (Array.isArray(comp.props?.components)) {
            for (let nIdx = 0; nIdx < comp.props.components.length; nIdx++) {
              if (comp.props.components[nIdx]?.id === componentId) {
                return {
                  type: 'nested',
                  sectionIndex: sIdx,
                  rowIndex: rIdx,
                  colIndex: cIdx,
                  parentIndex: compIdx,
                  parentId: comp.id,
                  componentIndex: nIdx,
                  component: comp.props.components[nIdx],
                }
              }
            }
          }
        }
      }
    }
  }

  return null
}

const removeUniversalComponent = (layout: any, loc: UniversalLocation): LayoutComponent | null => {
  const section = layout?.sections?.[loc.sectionIndex]
  if (!section) return null
  const rows = getSectionRows(section)
  const col = rows?.[loc.rowIndex]?.columns?.[loc.colIndex]
  if (!col) return null

  if (loc.type === 'column') {
    if (!Array.isArray(col.components)) return null
    const [removed] = col.components.splice(loc.componentIndex, 1)
    return removed || null
  }

  if (loc.type === 'grid-cell') {
    const grid = col.components?.[loc.gridIndex]
    if (!grid?.props?.cells?.[loc.cellRow]?.[loc.cellCol]) return null
    const removed = grid.props.cells[loc.cellRow][loc.cellCol].component
    grid.props.cells[loc.cellRow][loc.cellCol].component = null
    return removed || null
  }

  if (loc.type === 'swiper-slide') {
    const swiper = col.components?.[loc.swiperIndex]
    const slide = swiper?.props?.slides?.[loc.slideIndex]
    if (!Array.isArray(slide?.components)) return null
    const [removed] = slide.components.splice(loc.componentIndex, 1)
    return removed || null
  }

  if (loc.type === 'nested') {
    const parent = col.components?.[loc.parentIndex]
    if (!Array.isArray(parent?.props?.components)) return null
    const [removed] = parent.props.components.splice(loc.componentIndex, 1)
    return removed || null
  }

  if (loc.type === 'flexbox-child') {
    const flexbox = col.components?.[loc.flexboxIndex]
    if (!Array.isArray(flexbox?.props?.children)) return null
    const [removed] = flexbox.props.children.splice(loc.componentIndex, 1)
    flexbox.props = { ...flexbox.props, children: [...flexbox.props.children] }
    return removed || null
  }

  return null
}

const findComponentLocation = (layout: PageLayout | undefined, componentId: string): ComponentLocation | null => {
  const loc = findUniversalLocation(layout, componentId)
  if (loc && loc.type === 'column') {
    return {
      sectionIndex: loc.sectionIndex,
      rowIndex: loc.rowIndex,
      colIndex: loc.colIndex,
      componentIndex: loc.componentIndex,
      columnId: loc.columnId,
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

const PageEditor: React.FC<PageEditorProps> = ({
  initialLayout,
  onSave,
  onCancel,
  isModal = false,
  showSaveButton = true,
  pageId,
  showPagePills = false,
}) => {
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
    resolveSaveConflict,
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
  } = useLayoutActions(layout, setLayout)

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
    interval: 300000, // 5 minutes periodic auto-save
    debounceMs: 0, // Disabled: individual keystrokes do not trigger auto-save
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

  // ✅ Universal Component Delete (Supports Columns, Grid Cells, Swiper Slides, Containers)
  const handleComponentDelete = useCallback(
    (componentId: string, context?: any) => {
      debugLog('🎯 [PageEditor] handleComponentDelete CALLED:', {
        componentId,
        context,
        timestamp: new Date().toISOString(),
      })

      if (selectedComponent && selectedComponent.compId === componentId) {
        setSelectedComponent(null)
      }

      setLayout((currentLayout) => {
        const updatedLayout = JSON.parse(JSON.stringify(currentLayout))
        const loc = findUniversalLocation(updatedLayout, componentId)

        if (!loc) {
          console.error('❌ Component not found in layout:', componentId)
          toast.error('Component not found')
          return currentLayout
        }

        const removed = removeUniversalComponent(updatedLayout, loc)
        if (removed) {
          toast.success('Component deleted')
          setTimeout(() => {
            saveLayout(updatedLayout).then((success) => {
              debugLog(success ? '💾 Component deletion saved' : '❌ Save failed')
            })
          }, 0)
          return updatedLayout
        }

        return currentLayout
      })
    },
    [selectedComponent, saveLayout, setLayout],
  )

  // ✅ Complete Universal Drag & Drop Handler (Sections, Columns, Grid Cells, Swiper Slides)
  const handleDragEnd = useCallback(
    (result: any, draggedItem: any) => {
      debugLog('🎯 PageEditor: handleDragEnd called', {
        result,
        draggedItem,
        droppableId: result.destination?.droppableId,
        draggableId: result.draggableId,
      })

      if (!result.destination) {
        debugLog('❌ No destination for drop')
        return
      }

      // 1. Section Reordering
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
      const rawDraggableId = String(result.draggableId || '')

      // Identify source component ID
      let sourceComponentId = ''
      if (rawDraggableId.startsWith('component:')) {
        sourceComponentId = rawDraggableId.split(':')[1] || ''
      } else if (rawDraggableId.startsWith('grid-comp-') || rawDraggableId.startsWith('comp-')) {
        sourceComponentId = rawDraggableId
      }
      if (!sourceComponentId && draggedItem?.id) {
        const idStr = String(draggedItem.id)
        sourceComponentId = idStr.startsWith('component:') ? idStr.split(':')[1] : idStr
      }

      // Identify component type (from draggedItem or source ID)
      let componentType = String(draggedItem?.type || '')
      if ((componentType === 'component' || !componentType) && draggedItem?.id) {
        const idParts = String(draggedItem.id).split(':')
        componentType = idParts.length > 1 ? idParts[1] : draggedItem.id
      }
      if (!componentType && sourceComponentId) {
        const typeParts = sourceComponentId.split('-')
        componentType = typeParts[0]
      }

      setLayout((prevLayout) => {
        const newLayout = JSON.parse(JSON.stringify(prevLayout))

        // Check if this is an existing component in the layout
        const sourceLoc = sourceComponentId ? findUniversalLocation(newLayout, sourceComponentId) : null
        let movedComponent: LayoutComponent | null = null

        if (sourceLoc) {
          movedComponent = removeUniversalComponent(newLayout, sourceLoc)
        }

        // If not found in layout, instantiate new component from registry
        if (!movedComponent) {
          const compDef = getComponentDefinition(componentType)
          movedComponent = {
            id: createEditorId(componentType || 'component'),
            type: componentType || 'button',
            label: compDef?.name || componentType || 'Component',
            props: compDef?.defaultProps ? { ...compDef.defaultProps } : {},
          }
          if (String(componentType).toLowerCase() === 'newgrid') {
            movedComponent.props = {
              ...movedComponent.props,
              columns: 3,
              rows: 2,
              cells: Array(2)
                .fill(null)
                .map(() =>
                  Array(3)
                    .fill(null)
                    .map(() => ({ component: null })),
                ),
            }
          }
        }

        // Case A: Dropping onto a Grid Cell (empty or occupied)
        if (destinationDroppableId.includes(':grid:')) {
          const parts = destinationDroppableId.split(':')
          const gridIdx = parts.indexOf('grid')
          const actualGridId = parts[gridIdx + 1]
          const rowIndex = parseInt(parts[gridIdx + 2], 10)
          const colIndex = parseInt(parts[gridIdx + 3], 10)

          if (!isNaN(rowIndex) && !isNaN(colIndex)) {
            let targetGrid: any = null
            for (const section of newLayout.sections || []) {
              for (const row of getSectionRows(section)) {
                for (const col of row.columns || []) {
                  for (const comp of col.components || []) {
                    const cType = String(comp?.type || '').toLowerCase()
                    if ((cType === 'newgrid' || cType === 'grid') && comp.id === actualGridId) {
                      targetGrid = comp
                      break
                    }
                  }
                  if (targetGrid) break
                }
                if (targetGrid) break
              }
              if (targetGrid) break
            }

            if (targetGrid) {
              if (!targetGrid.props) targetGrid.props = {}
              if (!Array.isArray(targetGrid.props.cells)) {
                const rCount = Math.max(rowIndex + 1, targetGrid.props.rows || 2)
                const cCount = Math.max(colIndex + 1, targetGrid.props.columns || 3)
                targetGrid.props.cells = Array(rCount)
                  .fill(null)
                  .map(() =>
                    Array(cCount)
                      .fill(null)
                      .map(() => ({ component: null })),
                  )
              }
              while (targetGrid.props.cells.length <= rowIndex) {
                targetGrid.props.cells.push(
                  Array(targetGrid.props.columns || 3)
                    .fill(null)
                    .map(() => ({ component: null })),
                )
              }
              while (targetGrid.props.cells[rowIndex].length <= colIndex) {
                targetGrid.props.cells[rowIndex].push({ component: null })
              }

              const existingInCell = targetGrid.props.cells[rowIndex][colIndex]?.component
              targetGrid.props.cells[rowIndex][colIndex] = {
                ...targetGrid.props.cells[rowIndex][colIndex],
                component: movedComponent,
              }

              // Swap if source was also a grid cell
              if (existingInCell && sourceLoc && sourceLoc.type === 'grid-cell') {
                for (const s of newLayout.sections || []) {
                  for (const r of getSectionRows(s)) {
                    for (const c of r.columns || []) {
                      const srcGrid = c.components?.[sourceLoc.gridIndex]
                      if (srcGrid?.props?.cells?.[sourceLoc.cellRow]?.[sourceLoc.cellCol]) {
                        srcGrid.props.cells[sourceLoc.cellRow][sourceLoc.cellCol].component = existingInCell
                      }
                    }
                  }
                }
              }

              targetGrid.props = { ...targetGrid.props }
              toast.success(sourceLoc ? 'Component moved in grid' : 'Component added to grid')
              return newLayout
            }
          }
        }

        // Case B: Dropping onto a Swiper Slide
        if (destinationDroppableId.startsWith('swiper-')) {
          const match = destinationDroppableId.match(/swiper-(.+)-slide-(\d+)/)
          if (match) {
            const [, swiperId, slideIndexStr] = match
            const slideIndex = parseInt(slideIndexStr, 10)

            for (const section of newLayout.sections || []) {
              for (const row of getSectionRows(section)) {
                for (const col of row.columns || []) {
                  for (const comp of col.components || []) {
                    if (comp.type === 'swipercontainer' && (comp.id === swiperId || comp.id.includes(swiperId))) {
                      if (!comp.props) comp.props = {}
                      if (!Array.isArray(comp.props.slides)) comp.props.slides = []
                      while (comp.props.slides.length <= slideIndex) {
                        comp.props.slides.push({
                          id: createEditorId('slide'),
                          components: [],
                        })
                      }
                      const targetSlide = comp.props.slides[slideIndex]
                      if (!Array.isArray(targetSlide.components)) targetSlide.components = []
                      targetSlide.components.push(movedComponent)
                      comp.props = { ...comp.props }
                      toast.success(`Component added to slide ${slideIndex + 1}`)
                      return newLayout
                    }
                  }
                }
              }
            }
          }
        }

        // Case B.5: Dropping onto a Flexbox drop zone
        if (destinationDroppableId.startsWith('flexbox-')) {
          const flexboxId = destinationDroppableId.replace('flexbox-', '')

          const findAndAddToFlexbox = (components: any[]): boolean => {
            for (const comp of components || []) {
              if (!comp) continue
              if (
                String(comp.type || '').toLowerCase() === 'flexbox' &&
                (comp.id === flexboxId || comp.id?.includes(flexboxId))
              ) {
                if (!comp.props) comp.props = {}
                if (!Array.isArray(comp.props.children)) comp.props.children = []
                comp.props.children.push(movedComponent)
                comp.props = { ...comp.props }
                toast.success(sourceLoc ? 'Component moved to Flexbox' : 'Component added to Flexbox')
                return true
              }
              // Recurse into grid cells
              if (comp.props?.cells) {
                for (const row of comp.props.cells || []) {
                  for (const cell of row || []) {
                    if (cell?.component && findAndAddToFlexbox([cell.component])) return true
                  }
                }
              }
              // Recurse into swiper slides
              if (comp.props?.slides) {
                for (const slide of comp.props.slides || []) {
                  if (findAndAddToFlexbox(slide.components || [])) return true
                }
              }
              // Recurse into flexbox children
              if (Array.isArray(comp.props?.children)) {
                if (findAndAddToFlexbox(comp.props.children)) return true
              }
            }
            return false
          }

          let found = false
          for (const section of newLayout.sections || []) {
            for (const row of getSectionRows(section)) {
              for (const col of row.columns || []) {
                if (findAndAddToFlexbox(col.components || [])) {
                  found = true
                  break
                }
              }
              if (found) break
            }
            if (found) break
          }

          if (found) return newLayout
        }

        // Case C: Dropping onto a Column or sorting inside a Column
        let targetCol: any = null
        let insertIdx = 0

        if (destinationDroppableId.startsWith('column:')) {
          const colCtx = parseColumnDroppableId(destinationDroppableId)
          if (colCtx) {
            for (const s of newLayout.sections || []) {
              if (s.id === colCtx.sectionId) {
                for (const r of getSectionRows(s)) {
                  if (r.id === colCtx.rowId || r.id === `row-${s.id}`) {
                    for (const c of r.columns || []) {
                      if (c.id === colCtx.columnId) {
                        targetCol = c
                        insertIdx = typeof result.destination?.index === 'number' ? result.destination.index : (c.components?.length || 0)
                        break
                      }
                    }
                  }
                  if (targetCol) break
                }
              }
              if (targetCol) break
            }
          }
        } else if (destinationDroppableId.startsWith('component:')) {
          const targetCompId = destinationDroppableId.split(':')[1]
          const targetLoc = findUniversalLocation(newLayout, targetCompId)
          if (targetLoc && targetLoc.type === 'column') {
            const section = newLayout.sections[targetLoc.sectionIndex]
            const rows = getSectionRows(section)
            targetCol = rows[targetLoc.rowIndex]?.columns[targetLoc.colIndex]
            insertIdx = targetLoc.componentIndex
          }
        }

        if (targetCol && Array.isArray(targetCol.components)) {
          const safeIdx = Math.max(0, Math.min(insertIdx, targetCol.components.length))
          targetCol.components.splice(safeIdx, 0, movedComponent)
          toast.success(sourceLoc ? 'Component moved' : 'Component added')
          return newLayout
        }

        // Fallback for any other custom drop zones
        layoutActionsHandleDragEnd(result, draggedItem)
        return newLayout
      })
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
        setRightSidebarVisible(true)
        return // Already selected, ensure property panel is open
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
      setRightSidebarVisible(true)
    },
    [selectedComponent, setSelectedComponent, setSelectedSectionId, setRightSidebarVisible],
  )

  const handleComponentAddUnified = useCallback(
    (componentDef: ComponentDefinition) => {
      const newComponent: LayoutComponent = createLayoutComponentFromDefinition(componentDef)
      let targetSectionId = selectedSectionId
      let targetContainerId = ''
      let targetRowId = ''
      let targetColId = ''

      setLayout((prevLayout) => {
        const nextLayout = JSON.parse(JSON.stringify(prevLayout || { sections: [] }))
        if (!Array.isArray(nextLayout.sections) || nextLayout.sections.length === 0) {
          const newSectionId = `section-${Date.now()}`
          const newContainerId = `container-${Date.now()}`
          const newRowId = `row-${Date.now()}`
          const newColId = `col-${Date.now()}`
          targetSectionId = newSectionId
          targetContainerId = newContainerId
          targetRowId = newRowId
          targetColId = newColId
          nextLayout.sections = [
            {
              id: newSectionId,
              name: 'Section 1',
              type: 'custom',
              container: {
                id: newContainerId,
                rows: [
                  {
                    id: newRowId,
                    columns: [
                      {
                        id: newColId,
                        width: 100,
                        components: [newComponent],
                      },
                    ],
                  },
                ],
              },
            },
          ]
          return nextLayout
        }

        // Find target section (selected or last)
        let section = nextLayout.sections.find((s: any) => s.id === selectedSectionId)
        if (!section) {
          section = nextLayout.sections[nextLayout.sections.length - 1]
        }
        targetSectionId = section.id
        targetContainerId = section.container?.id || `container-${Date.now()}`
        if (!section.container) {
          section.container = { id: targetContainerId, rows: [] }
        }
        const rows = ensureSectionRows(section)
        if (rows.length === 0) {
          targetRowId = `row-${Date.now()}`
          targetColId = `col-${Date.now()}`
          const newRow = {
            id: targetRowId,
            columns: [
              {
                id: targetColId,
                width: 100,
                components: [newComponent],
              },
            ],
          }
          if (Array.isArray(section.container?.rows)) {
            section.container.rows.push(newRow)
          } else {
            section.rows = [newRow]
          }
        } else {
          // If a component was selected, insert right after it
          let inserted = false
          if (selectedComponent?.compId) {
            for (const r of rows) {
              for (const c of r.columns || []) {
                const compIndex = (c.components || []).findIndex((comp: any) => comp?.id === selectedComponent.compId)
                if (compIndex !== -1) {
                  c.components.splice(compIndex + 1, 0, newComponent)
                  targetRowId = r.id
                  targetColId = c.id
                  inserted = true
                  break
                }
              }
              if (inserted) break
            }
          }
          if (!inserted) {
            const lastRow = rows[rows.length - 1]
            targetRowId = lastRow.id
            if (!lastRow.columns || lastRow.columns.length === 0) {
              targetColId = `col-${Date.now()}`
              lastRow.columns = [{ id: targetColId, width: 100, components: [newComponent] }]
            } else {
              const lastCol = lastRow.columns[0]
              targetColId = lastCol.id
              if (!Array.isArray(lastCol.components)) {
                lastCol.components = []
              }
              lastCol.components.push(newComponent)
            }
          }
        }

        return nextLayout
      })

      // Select the newly added component and open property panel!
      setTimeout(() => {
        setSelectedComponent({
          sectionId: targetSectionId || '',
          containerId: targetContainerId || '',
          rowId: targetRowId || '',
          colId: targetColId || '',
          compId: newComponent.id,
          component: newComponent,
        })
        if (targetSectionId) {
          setSelectedSectionId(targetSectionId)
        }
        setRightSidebarVisible(true)
        toast.success(`Added ${componentDef.name}`)
      }, 50)
    },
    [selectedSectionId, selectedComponent, setLayout, setSelectedComponent, setSelectedSectionId, setRightSidebarVisible],
  )

  const handleComponentEdit = useCallback(
    (componentId: string) => {
      setRightSidebarVisible(true)
      const loc = findUniversalLocation(layout, componentId)
      if (loc) {
        const section = layout?.sections?.[loc.sectionIndex]
        const col = getSectionRows(section)?.[loc.rowIndex]?.columns?.[loc.colIndex]
        setSelectedComponent({
          sectionId: section?.id || '',
          containerId: section?.container?.id || '',
          rowId: `row-${loc.rowIndex}`,
          colId: loc.type === 'column' ? loc.columnId : col?.id || '',
          compId: componentId,
          component: loc.component,
          gridId: loc.type === 'grid-cell' ? loc.gridId : undefined,
          cellRow: loc.type === 'grid-cell' ? loc.cellRow : undefined,
          cellCol: loc.type === 'grid-cell' ? loc.cellCol : undefined,
          carouselId: loc.type === 'swiper-slide' ? loc.swiperId : undefined,
          slideIndex: loc.type === 'swiper-slide' ? loc.slideIndex : undefined,
        })
        if (section?.id) {
          setSelectedSectionId(section.id)
        }
      }
    },
    [layout, setRightSidebarVisible],
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

      // Sync selectedComponent state so property panel stays accurate
      setSelectedComponent((prev) => {
        if (!prev || prev.compId !== componentId) return prev
        return {
          ...prev,
          component: {
            ...prev.component,
            props: {
              ...prev.component.props,
              ...props,
            },
          },
        }
      })

      // 🎯 Single layout update + debounced save handled by layout actions (deduplicated)
      debugLog('🔄 Calling layoutActionsHandleComponentUpdate...')
      layoutActionsHandleComponentUpdate(componentId, props)
    },
    [layoutActionsHandleComponentUpdate, selectedComponent],
  )

  const handleComponentDuplicate = useCallback(
    (component: LayoutComponent) => {
      if (!component?.id) return

      setLayout((prevLayout) => {
        const newLayout = JSON.parse(JSON.stringify(prevLayout))
        const loc = findUniversalLocation(newLayout, component.id)
        if (!loc) {
          toast.error('Component not found to duplicate')
          return prevLayout
        }

        const clonedComponent = cloneComponentTreeWithNewIds(component)

        if (loc.type === 'column') {
          const section = newLayout.sections[loc.sectionIndex]
          const rows = getSectionRows(section)
          const col = rows[loc.rowIndex]?.columns[loc.colIndex]
          if (col && Array.isArray(col.components)) {
            col.components.splice(loc.componentIndex + 1, 0, clonedComponent)
          }
        } else if (loc.type === 'grid-cell') {
          const section = newLayout.sections[loc.sectionIndex]
          const rows = getSectionRows(section)
          const col = rows[loc.rowIndex]?.columns[loc.colIndex]
          const grid = col?.components[loc.gridIndex]
          if (grid?.props?.cells) {
            let placed = false
            for (let r = 0; r < grid.props.cells.length; r++) {
              for (let c = 0; c < grid.props.cells[r].length; c++) {
                if (!grid.props.cells[r][c]?.component) {
                  grid.props.cells[r][c] = { component: clonedComponent }
                  placed = true
                  break
                }
              }
              if (placed) break
            }
            if (!placed) {
              const colCount = grid.props.columns || 3
              const newRow = Array(colCount)
                .fill(null)
                .map(() => ({ component: null }))
              newRow[0] = { component: clonedComponent }
              grid.props.cells.push(newRow)
              grid.props.rows = grid.props.cells.length
            }
            grid.props = { ...grid.props }
          }
        } else if (loc.type === 'swiper-slide') {
          const section = newLayout.sections[loc.sectionIndex]
          const rows = getSectionRows(section)
          const col = rows[loc.rowIndex]?.columns[loc.colIndex]
          const swiper = col?.components[loc.swiperIndex]
          const slide = swiper?.props?.slides[loc.slideIndex]
          if (slide && Array.isArray(slide.components)) {
            slide.components.splice(loc.componentIndex + 1, 0, clonedComponent)
          }
        } else if (loc.type === 'nested') {
          const section = newLayout.sections[loc.sectionIndex]
          const rows = getSectionRows(section)
          const col = rows[loc.rowIndex]?.columns[loc.colIndex]
          const parent = col?.components[loc.parentIndex]
          if (parent?.props?.components) {
            parent.props.components.splice(loc.componentIndex + 1, 0, clonedComponent)
          }
        }

        toast.success(`Duplicated ${component.label || component.type}`)
        return newLayout
      })
    },
    [saveLayout, setLayout],
  )

  const handleComponentMove = useCallback(
    (componentId: string, direction: 'up' | 'down') => {
      if (!componentId) return

      setLayout((prevLayout) => {
        const newLayout = JSON.parse(JSON.stringify(prevLayout))
        const loc = findUniversalLocation(newLayout, componentId)
        if (!loc) return prevLayout

        if (loc.type === 'column') {
          const section = newLayout.sections[loc.sectionIndex]
          const rows = getSectionRows(section)
          const col = rows[loc.rowIndex]?.columns[loc.colIndex]
          if (!col || !Array.isArray(col.components)) return prevLayout

          const currIdx = loc.componentIndex
          const targetIdx = direction === 'up' ? currIdx - 1 : currIdx + 1
          if (targetIdx < 0 || targetIdx >= col.components.length) return prevLayout

          const [item] = col.components.splice(currIdx, 1)
          col.components.splice(targetIdx, 0, item)
        } else if (loc.type === 'swiper-slide') {
          const section = newLayout.sections[loc.sectionIndex]
          const rows = getSectionRows(section)
          const col = rows[loc.rowIndex]?.columns[loc.colIndex]
          const swiper = col?.components[loc.swiperIndex]
          const slide = swiper?.props?.slides[loc.slideIndex]
          if (!slide || !Array.isArray(slide.components)) return prevLayout

          const currIdx = loc.componentIndex
          const targetIdx = direction === 'up' ? currIdx - 1 : currIdx + 1
          if (targetIdx < 0 || targetIdx >= slide.components.length) return prevLayout

          const [item] = slide.components.splice(currIdx, 1)
          slide.components.splice(targetIdx, 0, item)
        } else {
          return prevLayout
        }

        return newLayout
      })
    },
    [saveLayout, setLayout],
  )

  const handleThemeChange = useCallback(
    (updatedTheme: GlobalTheme) => {
      setLayout((prevLayout: any) => ({
        ...prevLayout,
        theme: updatedTheme,
        settings: {
          ...(prevLayout?.settings || {}),
          theme: updatedTheme,
        },
      }))
      toast.success('Theme updated')
    },
    [setLayout],
  )

  const handleSaveComponentPreset = useCallback(
    (presetName: string, component: LayoutComponent) => {
      if (!presetName || !component) return
      const presetId = `preset-${Date.now()}`
      setLayout((prevLayout: any) => ({
        ...prevLayout,
        presets: {
          ...(prevLayout?.presets || {}),
          [presetId]: {
            id: presetId,
            name: presetName,
            componentType: component.type,
            label: component.label,
            props: JSON.parse(JSON.stringify(component.props || {})),
            createdAt: new Date().toISOString(),
          },
        },
      }))
      toast.success(`Preset "${presetName}" saved!`)
    },
    [setLayout],
  )

  const handleApplyComponentPreset = useCallback(
    (presetKey: string) => {
      const preset = (layout as any)?.presets?.[presetKey]
      if (!preset) {
        toast.error('Preset not found')
        return
      }
      if (!selectedComponent?.compId) {
        toast.error('Select a component on canvas to apply preset')
        return
      }
      handleComponentUpdate(selectedComponent.compId, preset.props)
      toast.success(`Preset "${preset.name || 'Style'}" applied!`)
    },
    [layout, selectedComponent?.compId, handleComponentUpdate],
  )

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
      setRightSidebarVisible(true)

      // ✅ DEBUG LOG
      debugLog('✅ Section selected for editing:', {
        sectionId,
        selectedSectionId: sectionId,
        componentCleared: true,
      })
    },
    [setSelectedSectionId, setSelectedComponent, selectedSectionId, selectedComponent, setRightSidebarVisible],
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
        {saveConflict ? (
          <div className="cm-inline-notice is-danger flex items-center justify-between px-3 py-2 text-xs">
            <span>⚠️ This page was changed in another session or tab.</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void resolveSaveConflict('overwrite', layout)}
                className="px-2.5 py-1 bg-[#7c6dfa] hover:bg-[#6c5ce7] text-white rounded text-xs font-medium transition cursor-pointer">
                Keep My Changes & Save
              </button>
              <button
                type="button"
                onClick={() => void resolveSaveConflict('reload')}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs transition cursor-pointer">
                Reload From Server
              </button>
            </div>
          </div>
        ) : error ? (
          <div className="cm-inline-notice is-danger">
            {error}
          </div>
        ) : null}
        {!isPreviewMode ? (
          <div className="ed-bar">
            <CanvasToolbar
              pages={pages.map((p) => ({ id: p.id, name: p.name, active: p.active, disabled: p.disabled }))}
              currentPageId={currentPageId}
              showPagePills={showPagePills}
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
                  selectedComponent={selectedComponent?.component}
                  onSectionSelect={handleSectionSelect}
                  onComponentSelect={handleComponentSelect}
                  onComponentAdd={handleComponentAddUnified}
                  onThemeChange={handleThemeChange}
                  onSavePreset={handleSaveComponentPreset}
                  onApplyPreset={handleApplyComponentPreset}
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
              onComponentMove={handleComponentMove}
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
