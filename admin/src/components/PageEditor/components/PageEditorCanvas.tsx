'use client'

import React, { useCallback, useMemo, useRef, useEffect } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { DroppableSection } from '../DroppableSection'
import { DraggableComponent } from '../DraggableComponent'
import { DynamicComponent } from '../DynamicComponent'
import { PreviewMode } from '../PreviewMode'
import { useDragDrop } from '../DragDropProvider'

import { componentRegistry } from '@/lib/componentRegistry'
import { PageLayout, Section, LayoutComponent } from '@/types/page-editor'
import { renderRegisteredSection } from '@/lib/sectionRegistry'
import { NewGrid } from './NewGrid'
import { HierarchyBreadcrumbs } from './HierarchyBreadcrumbs'
import { DeviceModeProvider } from '../context/DeviceModeContext'
import { generateThemeCssVariables } from '../../../../../shared/theme'

interface PageEditorCanvasProps {
  layout: PageLayout
  setLayout: (layout: PageLayout) => void
  zoom?: number
  onZoomChange?: (zoom: number) => void
  isWide?: boolean
  showGrid?: boolean
  onToggleGrid?: () => void
  deviceMode?: 'desktop' | 'tablet' | 'mobile'
  onDeviceModeChange?: (mode: 'desktop' | 'tablet' | 'mobile') => void
  isPreviewMode?: boolean
  onClosePreview?: () => void
  selectedSectionId?: string
  editingSectionId?: string | null
  selectedComponent: {
    sectionId: string
    containerId: string
    rowId: string
    colId: string
    compId: string
    component: LayoutComponent
  } | null
  onSectionSelect: (sectionId: string) => void
  onSectionEdit: (sectionId: string) => void
  onSectionUpdate?: (sectionId: string, updates: any) => void
  onSectionContentUpdate: (sectionId: string, content: string) => void
  onSectionDuplicate: (sectionId: string) => void
  onSectionMove?: (sectionId: string, direction: 'up' | 'down') => void
  onSectionDelete: (sectionId: string) => void
  onComponentSelect: (component: LayoutComponent, context: { sectionId: string; containerId: string; rowId: string; colId: string }) => void
  onComponentEdit: (componentId: string) => void
  onComponentDuplicate: (component: LayoutComponent) => void
  onComponentMove?: (componentId: string, direction: 'up' | 'down') => void
  onComponentDelete: (componentId: string) => void
  onComponentUpdate: (componentId: string, props: Record<string, any>) => void
  onComponentResize?: (componentId: string, size: { width: number; height: number }) => void
  onColumnDelete: (sectionId: string, containerId: string, rowId: string, colId: string) => void
  onDragEnd: (result: any, draggedItem: any) => void // ✅ Use the one from PageEditor
  onAddSection: () => void
  onSetSectionRows: (sectionId: string, numRows: number) => void
  onSetSectionColumns: (sectionId: string, numColumns: number) => void
  onConfigureColumns?: (sectionId: string) => void
  pages: Array<{ id: string; name: string; active: boolean; disabled: boolean }>
  currentPageId: string | null
  onPageSelect: (pageId: string | null) => void
  onAddPage?: () => void
  canUndo?: boolean
  canRedo?: boolean
  onUndo?: () => void
  onRedo?: () => void
  saveStatusLabel?: string
  lastPublishedLabel?: string
  headerOptions?: Array<{ id: number; slug: string; name: string }>
  footerOptions?: Array<{ id: number; slug: string; name: string }>
  selectedHeaderSlug?: string
  selectedFooterSlug?: string
  onHeaderChange?: (slug: string) => void
  onFooterChange?: (slug: string) => void
  onPublish?: () => void
  isPublishing?: boolean
  onDeletePage?: (pageId: string) => void
  onDisablePage?: (pageId: string, disabled: boolean) => void
  onRenamePage?: (pageId: string, name: string) => void
  onPreviewDraft?: () => void
}

// REMOVED: useSectionEditing hook (text editing ke liye tha)

const usePageActions = (
  currentPageId: string | null,
  pages: Array<{ id: string; name: string; active: boolean; disabled: boolean }>,
  onDeletePage?: (pageId: string) => void,
  onDisablePage?: (pageId: string, disabled: boolean) => void,
) => {
  const currentPage = useMemo(
    () => pages?.find((p) => String(p.id) === String(currentPageId ?? '')),
    [pages, currentPageId],
  )

  const isCriticalPage = currentPage?.name?.toLowerCase() === 'home'

  const handleDelete = useCallback(() => {
    if (currentPageId && onDeletePage && window.confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
      onDeletePage(currentPageId)
    }
  }, [currentPageId, onDeletePage])

  const handleToggleDisable = useCallback(() => {
    if (currentPageId && onDisablePage) {
      onDisablePage(currentPageId, !currentPage?.disabled)
    }
  }, [currentPageId, currentPage?.disabled, onDisablePage])

  return {
    currentPage,
    isCriticalPage,
    handleDelete,
    handleToggleDisable,
  }
}

// Component renderers for better separation
const ComponentRenderer: React.FC<{
  component: LayoutComponent
  context: { sectionId: string; containerId: string; rowId: string; colId: string }
  isSelected: boolean
  onComponentSelect: PageEditorCanvasProps['onComponentSelect']
  onComponentEdit?: PageEditorCanvasProps['onComponentEdit']
  onComponentDuplicate?: PageEditorCanvasProps['onComponentDuplicate']
  onComponentUpdate: PageEditorCanvasProps['onComponentUpdate']
  onComponentDelete: PageEditorCanvasProps['onComponentDelete']
  layout: PageLayout
  setLayout: PageEditorCanvasProps['setLayout']
  onDragEnd: PageEditorCanvasProps['onDragEnd']
}> = ({
  component,
  context,
  isSelected,
  onComponentSelect,
  onComponentEdit,
  onComponentDuplicate,
  onComponentUpdate,
  onComponentDelete,
  layout,
  setLayout,
  onDragEnd,
}) => {
  const compType = String(component?.type || '').toLowerCase()
  // Special handling for NewGrid component
  if (compType === 'newgrid' || compType === 'grid') {
    return (
      <div className="w-full overflow-hidden" style={{ maxWidth: '100%', minWidth: 0 }}>
        <NewGrid
          key={component?.id}
          {...component?.props}
          columns={component?.props?.columns ?? component?.props?.layout?.columns}
          rows={component?.props?.rows ?? component?.props?.layout?.rows}
          sectionId={context.sectionId}
          component={component}
          deleteComponent={onComponentDelete}
          onComponentDuplicate={onComponentDuplicate}
          setSelectedComponent={(selected: { sectionId: string; compId: string; component: LayoutComponent }) => {
            onComponentSelect(selected.component, {
              sectionId: selected.sectionId,
              containerId: 'grid-container',
              rowId: 'grid-row',
              colId: 'grid-col',
            })
          }}
          layout={layout}
          setLayout={setLayout}
          onComponentSelect={onComponentSelect}
          onComponentUpdate={onComponentUpdate}
          onDragEnd={onDragEnd}
        />
      </div>
    )
  }

  return (
    <DynamicComponent
      key={component?.id}
      component={component}
      isSelected={isSelected}
      onSelect={() => onComponentSelect(component, context)}
      onUpdate={(newProps: Record<string, any>) => onComponentUpdate(component?.id, newProps)}
      onComponentSelect={onComponentSelect}
      onComponentUpdate={onComponentUpdate}
      deleteComponent={onComponentDelete}
      onDelete={onComponentDelete}
      layout={layout}
      setLayout={setLayout}
      sectionId={context.sectionId}
      containerId={context.containerId}
      rowId={context.rowId}
      colId={context.colId}
      onDragEnd={onDragEnd} // ✅ Pass through
    />
  )
}

// Droppable Column Component
const DroppableColumn: React.FC<{
  column: any
  columnIndex: number
  sectionId: string
  containerId: string
  rowId: string
  isSelected: boolean
  sectionSettings?: Record<string, any>
  selectedComponent: PageEditorCanvasProps['selectedComponent']
  onComponentSelect: PageEditorCanvasProps['onComponentSelect']
  onComponentEdit: PageEditorCanvasProps['onComponentEdit']
  onComponentDuplicate: PageEditorCanvasProps['onComponentDuplicate']
  onComponentMove?: PageEditorCanvasProps['onComponentMove']
  onComponentDelete: PageEditorCanvasProps['onComponentDelete']
  onComponentResize: PageEditorCanvasProps['onComponentResize']
  onColumnDelete: PageEditorCanvasProps['onColumnDelete']
  renderComponent: (component: LayoutComponent, context: any) => React.ReactNode
  isDraggingOverNested: boolean
}> = ({
  column,
  columnIndex,
  sectionId,
  containerId,
  rowId,
  isSelected,
  sectionSettings = {},
  selectedComponent,
  onComponentSelect,
  onComponentEdit,
  onComponentDuplicate,
  onComponentMove,
  onComponentDelete,
  onComponentResize,
  onColumnDelete,
  renderComponent,
  isDraggingOverNested,
}) => {
  const droppableId = `column:${sectionId}:${containerId}:${rowId}:${column?.id}`
  const stickyEnabled = Boolean(sectionSettings?.sticky_enabled)
  const stickyTargetIndex = Number(sectionSettings?.sticky_column_index ?? 0)
  const stickyOffset = Number(sectionSettings?.sticky_offset ?? 0)
  const stickyPosition = String(sectionSettings?.sticky_position || 'top')
  const isStickyColumn = stickyEnabled && stickyTargetIndex === columnIndex

  const stickyStyle: React.CSSProperties = isStickyColumn
    ? stickyPosition === 'bottom'
      ? {
          position: 'sticky',
          bottom: `${stickyOffset}px`,
          top: 'auto',
          alignSelf: 'flex-end',
        }
      : stickyPosition === 'center'
        ? {
            position: 'sticky',
            top: `calc(50vh - ${Math.max(0, stickyOffset)}px)`,
            alignSelf: 'flex-start',
          }
        : {
            position: 'sticky',
            top: `${stickyOffset}px`,
            alignSelf: 'flex-start',
          }
    : {}

  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
  })

  const hasComponents = (column?.components?.length || 0) > 0

  // Get sortable items for this column - FIXED with optional chaining
  const sortableItems = useMemo(
    () =>
      column?.components
        ?.filter((component: LayoutComponent) => component !== null && component !== undefined && component?.id)
        .map((component: LayoutComponent) => `component:${component?.id}:${sectionId}-${containerId}-${rowId}-${column?.id}`) || [],
    [column?.components, sectionId, containerId, rowId, column?.id],
  )

  return (
    <div
      ref={setNodeRef}
      className={`column-dropzone max-w-full w-full flex-1 h-auto flex flex-col relative group ${isOver && !isDraggingOverNested ? 'is-over' : ''} ${
        hasComponents ? 'has-components' : 'is-empty'
      } ${isDraggingOverNested ? 'opacity-60' : ''}`}
      style={{
        zIndex: isDraggingOverNested ? 1 : 2,
        position: 'relative',
        overflow: 'visible',
        maxWidth: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        transition: 'background-color 0.15s ease, border-color 0.15s ease',
        ...stickyStyle,
      }}
      data-section-droppable-id={droppableId}>
      {/* Column Action Buttons */}
      {column?.id && (
        <ColumnActions
          columnId={column.id}
          onEdit={() => {}}
          onDelete={() => onColumnDelete(sectionId, containerId, rowId, column.id)}
        />
      )}

      {/* Render Components with SortableContext */}
      <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
        {column?.components
          ?.filter((component: LayoutComponent) => component !== null && component !== undefined && component?.id)
          .map((component: LayoutComponent, index: number) => (
          <DraggableComponent
              key={component?.id}
              component={component}
              index={index}
              sectionId={sectionId}
              containerId={containerId}
              rowId={rowId}
              colId={column?.id}
              isSelected={selectedComponent?.component?.id === component?.id}
              onSelect={onComponentSelect}
              onEdit={onComponentEdit}
              onDuplicate={onComponentDuplicate}
              onMove={onComponentMove}
              onDelete={onComponentDelete}
              onResize={onComponentResize}
              renderComponent={renderComponent}
            />
          ))}
      </SortableContext>
      {!hasComponents ? (
        <div className="column-placeholder">
          <div className="column-placeholder-icon">+</div>
          <p>Drop a component here</p>
        </div>
      ) : null}
    </div>
  )
}

const ColumnActions: React.FC<{
  columnId: string
  onEdit: () => void
  onDelete: () => void
}> = ({ columnId, onEdit, onDelete }) => (
  <div className="absolute top-0 right-0 flex gap-1 m-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
    <button
      onClick={(e) => {
        e.stopPropagation()
        onEdit()
      }}
      className="column-action-btn"
      title="Edit Column">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
    </button>
    <button
      onClick={(e) => {
        e.stopPropagation()
        onDelete()
      }}
      className="column-action-btn is-danger"
      title="Delete Column">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    </button>
  </div>
)

// Main Page Sections Droppable Area - FIXED HERE
const PageSectionsDroppable: React.FC<{
  layout: PageLayout
  renderSection: (section: Section, index: number) => React.ReactNode
}> = ({ layout, renderSection }) => {
  const { setNodeRef } = useDroppable({
    id: 'page-sections',
  })

  // Get sortable items for sections - FIXED with optional chaining
  const sectionItems = useMemo(() => layout?.sections?.map((section) => `section:${section?.id}`) || [], [layout?.sections])

  const sections = layout?.sections || []

  return (
    <div
      ref={setNodeRef}
      className="page-sections">
      <SortableContext items={sectionItems} strategy={verticalListSortingStrategy}>
        {sections.map((section, index) => (
          <React.Fragment key={section?.id || `section-${index}`}>
            {renderSection(section, index)}
          </React.Fragment>
        ))}
      </SortableContext>
      {/* {sections.length === 0 && (
      )} */}
    </div>
  )
}

export const CanvasToolbar: React.FC<{
  pages: PageEditorCanvasProps['pages']
  currentPageId: string | null
  onPageSelect: (pageId: string | null) => void
  onAddPage?: () => void
  onSaveDraft?: () => void
  showSaveButton?: boolean
  onAddSection: () => void
  canUndo?: boolean
  canRedo?: boolean
  onUndo?: () => void
  onRedo?: () => void
  showGrid?: boolean
  onToggleGrid?: () => void
  deviceMode?: 'desktop' | 'tablet' | 'mobile'
  onDeviceModeChange?: (mode: 'desktop' | 'tablet' | 'mobile') => void
  zoom?: number
  onZoomChange?: (zoom: number) => void
  sectionCount: number
  saveStatusLabel?: string
  lastPublishedLabel?: string
  headerOptions?: Array<{ id: number; slug: string; name: string }>
  footerOptions?: Array<{ id: number; slug: string; name: string }>
  selectedHeaderSlug?: string
  selectedFooterSlug?: string
  onHeaderChange?: (slug: string) => void
  onFooterChange?: (slug: string) => void
  onPublish?: () => void
  isPublishing?: boolean
  onDeletePage?: (pageId: string) => void
  onDisablePage?: (pageId: string, disabled: boolean) => void
  onRenamePage?: (pageId: string, name: string) => void
  onPreviewDraft?: () => void
  showPagePills?: boolean
}> = ({
  pages,
  currentPageId,
  onPageSelect,
  onAddPage,
  onSaveDraft,
  showSaveButton = true,
  onAddSection,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  showGrid = true,
  onToggleGrid,
  deviceMode = 'desktop',
  onDeviceModeChange,
  zoom = 100,
  onZoomChange,
  sectionCount,
  saveStatusLabel = 'No changes yet',
  lastPublishedLabel = 'Not published yet',
  headerOptions = [],
  footerOptions = [],
  selectedHeaderSlug = '',
  selectedFooterSlug = '',
  onHeaderChange,
  onFooterChange,
  onPublish,
  isPublishing = false,
  onDeletePage,
  onDisablePage,
  onRenamePage,
  showPagePills = false,
}) => {
  const { currentPage, isCriticalPage, handleDelete, handleToggleDisable } = usePageActions(currentPageId, pages, onDeletePage, onDisablePage)

  const adjustZoom = (delta: number) => {
    onZoomChange?.(Math.min(150, Math.max(50, zoom + delta)))
  }

  return (
    <>
      <div className="canvas-toolbar">
        {showPagePills ? (
          <>
            <div className="pg-pills">
              {pages.map((page) => (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => onPageSelect(page.id == null ? null : String(page.id))}
                  onDoubleClick={() => {
                    if (!onRenamePage || page.id == null) return
                    const rawName = window.prompt('Rename page', page.name || 'Untitled Page')
                    if (rawName === null) return
                    const nextName = rawName.trim()
                    if (!nextName) return
                    onRenamePage(String(page.id), nextName)
                  }}
                  className={`pgpill ${String(currentPageId ?? '') === String(page.id) ? 'active' : ''}`}
                  title={page.disabled ? `${page.name} (Disabled)` : page.name}>
                  <span className="dot" style={{ background: page.disabled ? 'var(--am)' : 'var(--gr)' }} />
                  <span>{page.name}</span>
                </button>
              ))}
              <button type="button" onClick={onAddPage} className="pgpill pgpill-new">
                + New
              </button>
            </div>

            <div className="autosave">
              <span className="autosave-dot" />
              <span>{saveStatusLabel}</span>
            </div>
          </>
        ) : null}

        <div className="ed-bar-mid">
          <button type="button" className={`tool ${canUndo ? 'on' : ''}`} title="Undo" onClick={onUndo} disabled={!canUndo}>
            <span>↩</span>
          </button>
          <button type="button" className={`tool ${canRedo ? 'on' : ''}`} title="Redo" onClick={onRedo} disabled={!canRedo}>
            <span>↪</span>
          </button>

          <div className="tool-grp">
            <button type="button" className={`tool ${deviceMode === 'desktop' ? 'on' : ''}`} title="Desktop preview" onClick={() => onDeviceModeChange?.('desktop')}>
              <svg viewBox="0 0 16 16">
                <rect x="2.5" y="3.5" width="11" height="7" rx="1.2" />
                <path d="M6 12.5h4M8 10.5v2" strokeLinecap="round" />
              </svg>
            </button>
            <button type="button" className={`tool ${deviceMode === 'tablet' ? 'on' : ''}`} title="Tablet preview" onClick={() => onDeviceModeChange?.('tablet')}>
              <svg viewBox="0 0 16 16">
                <rect x="4.5" y="2.5" width="7" height="11" rx="1.4" />
                <path d="M7 4h2M7.2 11.8h1.6" strokeLinecap="round" />
              </svg>
            </button>
            <button type="button" className={`tool ${deviceMode === 'mobile' ? 'on' : ''}`} title="Mobile preview" onClick={() => onDeviceModeChange?.('mobile')}>
              <svg viewBox="0 0 16 16">
                <rect x="5" y="2.5" width="6" height="11" rx="1.4" />
                <path d="M7.3 4.5h1.4M7.1 11.2h1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="zoom-box">
            <button type="button" className="zbtn" onClick={() => adjustZoom(-10)}>
              -
            </button>
            <span id="zval">{zoom}%</span>
            <button type="button" className="zbtn" onClick={() => adjustZoom(10)}>
              +
            </button>
          </div>
        </div>

        <div className="ed-bar-right">
          <div className="scnt">{sectionCount} sections</div>
          {showSaveButton ? (
            <button type="button" onClick={onSaveDraft} className="gbtn primary" disabled={!currentPageId}>
              Save Draft
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleDelete}
            className="gbtn danger"
            disabled={!currentPage || isCriticalPage}
            title={isCriticalPage ? 'Home page cannot be deleted' : 'Delete current page'}>
            Delete
          </button>
          <button type="button" onClick={handleToggleDisable} className="gbtn danger" disabled={!currentPage}>
            {currentPage?.disabled ? 'Enable' : 'Disable'}
          </button>
          <button type="button" onClick={onAddSection} className="gbtn primary">
            + Add Section
          </button>
        </div>
      </div>
    </>
  )
}

export const PageEditorCanvas: React.FC<PageEditorCanvasProps> = ({
  layout,
  setLayout,
  zoom = 100,
  onZoomChange,
  isWide = false,
  showGrid = true,
  onToggleGrid,
  deviceMode = 'desktop',
  onDeviceModeChange,
  isPreviewMode = false,
  onClosePreview,
  selectedSectionId,
  editingSectionId,
  selectedComponent,
  onSectionSelect,
  onSectionEdit,
  onSectionUpdate,
  onSectionContentUpdate,
  onSectionDuplicate,
  onSectionMove,
  onSectionDelete,
  onComponentSelect,
  onComponentEdit,
  onComponentDuplicate,
  onComponentMove,
  onComponentDelete,
  onComponentUpdate,
  onComponentResize,
  onColumnDelete,
  onDragEnd, // ✅ Use the one passed from PageEditor
  onAddSection,
  onSetSectionRows,
  onSetSectionColumns,
  pages,
  currentPageId,
  onPageSelect,
  onAddPage,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  saveStatusLabel,
  lastPublishedLabel,
  headerOptions,
  footerOptions,
  selectedHeaderSlug,
  selectedFooterSlug,
  onHeaderChange,
  onFooterChange,
  onPublish,
  isPublishing,
  onDeletePage,
  onDisablePage,
}) => {
  // FIXED: Handle undefined sections
  const sections = layout?.sections || []
  const canvasScrollRef = useRef<HTMLDivElement>(null)

  const { isDraggingOverNested } = useDragDrop()
  const boundedZoom = Math.max(50, Math.min(150, Number.isFinite(zoom) ? zoom : 100))
  const zoomScale = boundedZoom / 100
  const themeCssVars = useMemo(
    () => generateThemeCssVariables(layout?.theme || (layout as any)?.settings?.theme),
    [layout?.theme, (layout as any)?.settings?.theme],
  )
  const customGlobalCss = layout?.theme?.customCSS || (layout as any)?.settings?.theme?.customCSS || ''

  const pageFrameStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: deviceMode === 'mobile' ? '430px' : deviceMode === 'tablet' ? '860px' : '1240px',
    minWidth: 0,
    transform: `scale(${zoomScale})`,
    transformOrigin: 'top center',
    margin: '0 auto',
    boxSizing: 'border-box',
    ...(themeCssVars as any),
  }

  useEffect(() => {
    canvasScrollRef.current?.scrollTo({ top: 0, left: 0 })
  }, [])

  const renderComponent = useCallback(
    (component: LayoutComponent, context: any) => (
      <ComponentRenderer
        component={component}
        context={context}
        isSelected={selectedComponent?.component?.id === component?.id}
        onComponentSelect={onComponentSelect}
        onComponentEdit={onComponentEdit}
        onComponentDuplicate={onComponentDuplicate}
        onComponentUpdate={onComponentUpdate}
        onComponentDelete={onComponentDelete}
        layout={layout}
        setLayout={setLayout}
        onDragEnd={onDragEnd} // ✅ Pass through
      />
    ),
    [selectedComponent, onComponentSelect, onComponentEdit, onComponentDuplicate, onComponentUpdate, onComponentDelete, layout, setLayout, onDragEnd],
  )

  const renderSection = useCallback(
    (section: Section, index: number) => {
      if (!section) return null

      const rows = (section?.container?.rows?.length ? section.container.rows : (section as any)?.rows) || []
      const hasRows = Array.isArray(rows) && rows.length > 0
      const isDynamicSection = Boolean(section?.type && section.type !== 'custom' && section.type !== 'default' && !hasRows)
      const sectionSettings = (section?.settings || {}) as Record<string, any>

      const getColumnTemplate = (columns: any[]) => {
        const safeColumns = Array.isArray(columns) ? columns : []
        if (!safeColumns.length) {
          return '1fr'
        }

        const widths = safeColumns.map((column) => {
          const width = Number(column?.width)
          return Number.isFinite(width) && width > 0 ? width : Math.round(100 / safeColumns.length)
        })
        const total = widths.reduce((sum, width) => sum + width, 0)

        if (total <= 0) {
          return `repeat(${safeColumns.length}, minmax(0, 1fr))`
        }

        return widths.map((width) => `${Math.max(10, width)}fr`).join(' ')
      }

      return (
        <DroppableSection
          key={section.id}
          section={section}
          index={index}
          isSelected={selectedSectionId === section?.id}
          onSelect={onSectionSelect}
          onEdit={onSectionEdit}
          onDuplicate={onSectionDuplicate}
          onMoveUp={onSectionMove ? () => onSectionMove(section.id, 'up') : undefined}
          onMoveDown={onSectionMove ? () => onSectionMove(section.id, 'down') : undefined}
          onDelete={onSectionDelete}>
          
          <div className="p-4">
            {/* ✅ SIMPLE CONTENT DISPLAY - NO TEXTAREA */}
            {typeof section?.content === 'string' && section.content ? (
              <div className="mb-4 whitespace-pre-wrap">{section.content}</div>
            ) : typeof section?.content === 'object' && typeof (section.content as any)?.content === 'string' && (section.content as any).content ? (
              <div className="mb-4 whitespace-pre-wrap">{(section.content as any).content}</div>
            ) : null}

            {isDynamicSection ? (
              <div>
                {renderRegisteredSection(section, {
                  editable: true,
                  onPropsChange: (updates) => {
                    onSectionSelect(section.id)
                    onSectionUpdate?.(section.id, { props: updates })
                  },
                })}
              </div>
            ) : !hasRows ? (
              <ColumnSetup sectionId={section?.id} onSetSectionColumns={onSetSectionColumns} />
            ) : (
              rows.map((row) => (
                <div
                  key={row?.id}
                  className="grid gap-4 mb-4"
                  style={{
                    gridTemplateColumns: getColumnTemplate(row?.columns || []),
                    width: '100%',
                    maxWidth: '100%',
                    overflow: 'visible',
                    minWidth: 0, // ✅ ADD THIS
                  }}>
                  {row?.columns?.map((column, columnIndex) => (
                    <DroppableColumn
                      key={column?.id}
                      column={column}
                      columnIndex={columnIndex}
                      sectionId={section?.id}
                      containerId={section?.container?.id}
                      rowId={row?.id}
                      sectionSettings={sectionSettings}
                      isSelected={selectedSectionId === section?.id}
                      selectedComponent={selectedComponent}
                      onComponentSelect={onComponentSelect}
                      onComponentEdit={onComponentEdit}
                      onComponentDuplicate={onComponentDuplicate}
                      onComponentMove={onComponentMove}
                      onComponentDelete={onComponentDelete}
                      onComponentResize={onComponentResize}
                      onColumnDelete={onColumnDelete}
                      renderComponent={renderComponent}
                      isDraggingOverNested={isDraggingOverNested}
                    />
                  ))}
                </div>
              ))
            )}
          </div>
        </DroppableSection>
      )
    },
    [
      selectedSectionId,
      selectedComponent,
      onSectionSelect,
      onSectionEdit,
      onSectionUpdate,
      onSectionDuplicate,
      onSectionMove,
      onSectionDelete,
      onComponentSelect,
      onComponentEdit,
      onComponentDuplicate,
      onComponentMove,
      onComponentDelete,
      onComponentResize,
      onColumnDelete,
      renderComponent,
      onSetSectionColumns,
      isDraggingOverNested,
    ],
  )

  return (
    <DeviceModeProvider deviceMode={deviceMode} onDeviceModeChange={onDeviceModeChange}>
      <HierarchyBreadcrumbs
        layout={layout}
        selectedSectionId={selectedSectionId}
        selectedComponent={selectedComponent}
        onSectionSelect={onSectionSelect}
        onComponentSelect={onComponentSelect}
      />
      <div
        ref={canvasScrollRef}
        className={`canvas-scroll flex-1 min-h-0 ${showGrid ? '' : 'grid-off'}`}>
        <div
          id="page-frame"
          className={`page-frame canvas-frame ${isWide ? 'wide' : ''} ${deviceMode === 'mobile' ? 'mobile-view' : ''} ${deviceMode === 'tablet' ? 'tablet-view' : ''} ${showGrid ? '' : 'grid-off'}`}
          style={pageFrameStyle}>
          {customGlobalCss && (
            <style id="page-editor-global-custom-css" dangerouslySetInnerHTML={{ __html: customGlobalCss }} />
          )}
          <PageSectionsDroppable layout={layout} renderSection={renderSection} />
        </div>
        <CanvasActions onAddSection={onAddSection} />
      </div>

      {isPreviewMode && <PreviewMode layout={layout} onClose={onClosePreview || (() => {})} />}
    </DeviceModeProvider>
  )
}

const ColumnSetup: React.FC<{
  sectionId: string
  onSetSectionColumns: (sectionId: string, numColumns: number) => void
}> = ({ sectionId, onSetSectionColumns }) => (
  <div className="col-setup">
    <div className="col-setup-copy">Choose columns for this section</div>
    <div className="col-setup-actions">
      {[1, 2, 3].map((numColumns) => (
        <button
          key={numColumns}
          type="button"
          onClick={() => onSetSectionColumns(sectionId, numColumns)}
          className="chip on">
          {numColumns} Column{numColumns > 1 ? 's' : ''}
        </button>
      ))}
    </div>
  </div>
)

const CanvasActions: React.FC<{
  onAddSection: () => void
}> = ({ onAddSection }) => (
  <div className="add-zone">
    <ActionButton
      onClick={onAddSection}
      icon={
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor">
          <path d="M8 3v10M3 8h10" strokeLinecap="round" />
        </svg>
      }
      label="Drop component or click to add section"
    />
  </div>
)

const ActionButton: React.FC<{
  onClick: () => void
  icon?: React.ReactNode
  label: string
  disabled?: boolean
  className?: string
  title?: string
}> = ({ onClick, icon, label, disabled = false, className = '', title }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`add-zone-btn ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${className}`}
    title={title}>
    {icon}
    {label}
  </button>
)
