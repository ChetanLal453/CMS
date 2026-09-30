'use client'

import { useCallback, useEffect, useRef } from 'react'
import { PageLayout, Section, LayoutComponent, ComponentDefinition } from '@/types/page-editor'
import { componentRegistry } from '@/lib/componentRegistry'
import { getBlockDefaults, normalizeBlockProps } from '../../../../../shared/blocks/registry'

// 🔹 Generate unique ID
const generateUniqueId = (prefix = 'id') => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

// 🔹 Type-safe component registry helper
const getComponentDefinition = (componentType: string): ComponentDefinition | undefined => {
  if (typeof componentRegistry.getComponent === 'function') {
    return componentRegistry.getComponent(componentType)
  }

  // Fallback for different registry structure
  const registry = componentRegistry as any
  return registry[componentType] || undefined
}

// 🔹 Create NewGrid component definition
const createNewGridComponent = (): LayoutComponent => {
  const defaults = getBlockDefaults('newgrid')
  const normalized = normalizeBlockProps('newgrid', defaults)
  return {
    id: `NewGrid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'NewGrid',
    label: 'Grid Layout',
    props: {
      rows: normalized.layout?.rows ?? normalized.rows ?? 2,
      columns: normalized.layout?.columns ?? normalized.columns ?? 3,
      cells: normalized.cells,
      components: normalized.components,
    },
  }
}

const createComponentProps = (componentDef: ComponentDefinition): Record<string, any> => {
  const normalizedDefaults = normalizeBlockProps(componentDef.type, componentDef.defaultProps || {})

  if (componentDef.type === 'advancedCard') {
    return {
      ...normalizedDefaults,
      title: normalizedDefaults.title || 'Advanced Card',
      description: normalizedDefaults.description || 'Your content here',
      imagePosition: normalizedDefaults.imagePosition || 'top',
    }
  }

  return normalizedDefaults
}

export const createLayoutComponentFromDefinition = (componentDef: ComponentDefinition): LayoutComponent => ({
  id: `${componentDef.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  type: componentDef.type,
  label: componentDef.name,
  props: createComponentProps(componentDef),
})

// 🔹 Safe layout clone for state updaters
const cloneLayoutForUpdate = (layout?: PageLayout): PageLayout => {
  const safeLayout: PageLayout =
    layout && typeof layout === 'object' && Array.isArray(layout.sections)
      ? layout
      : {
          id: '',
          name: 'Untitled Page',
          sections: [],
        }

  return JSON.parse(JSON.stringify(safeLayout)) as PageLayout
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

export const ensureSectionRows = (section: Section | any) => {
  if (Array.isArray(section?.container?.rows)) {
    return section.container.rows
  }

  if (Array.isArray(section?.rows)) {
    return section.rows
  }

  if (!section.container || typeof section.container !== 'object') {
    section.container = {
      id: `container-${Date.now()}`,
      rows: [],
    }
  }

  section.container.rows = []
  return section.container.rows
}

type ComponentLocation = {
  sectionIndex: number
  rowIndex: number
  colIndex: number
  componentIndex: number
  component: LayoutComponent
}

const findDirectComponentLocation = (layout: PageLayout, componentId: string): ComponentLocation | null => {
  for (let sectionIndex = 0; sectionIndex < layout.sections.length; sectionIndex += 1) {
    const section = layout.sections[sectionIndex]
    const rows = getSectionRows(section)

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
      const row = rows[rowIndex]
      const columns = row?.columns || []

      for (let colIndex = 0; colIndex < columns.length; colIndex += 1) {
        const column = columns[colIndex]
        const componentIndex = (column?.components || []).findIndex((component: LayoutComponent) => component?.id === componentId)

        if (componentIndex !== -1) {
          return {
            sectionIndex,
            rowIndex,
            colIndex,
            componentIndex,
            component: column.components[componentIndex],
          }
        }
      }
    }
  }

  return null
}

// 🔹 Enhanced find component that searches EVERYWHERE including swiper slides
const findComponentEverywhere = (layout: PageLayout, id: string): LayoutComponent | null => {
  // Recursive search function
  const searchRecursively = (components: any[]): LayoutComponent | null => {
    for (const comp of components) {
      if (!comp) continue

      // Direct match
      if (comp.id === id) {
        return comp
      }

      // 🆕 CRITICAL: Search in swiper slides
      if (comp.type === 'swipercontainer' && comp.props?.slides) {
        for (let slideIndex = 0; slideIndex < comp.props.slides.length; slideIndex++) {
          const slide = comp.props.slides[slideIndex]
          if (slide?.components) {
            for (const slideComp of slide.components) {
              if (slideComp?.id === id) {
                return slideComp
              }
            }
          }
        }
      }

      // Search in carousel slides
      if (comp.type === 'carousel' && comp.props?.slides) {
        for (let slideIndex = 0; slideIndex < comp.props.slides.length; slideIndex++) {
          const slide = comp.props.slides[slideIndex]
          if (slide?.components) {
            // Search direct components in slide
            for (const slideComp of slide.components) {
              if (slideComp?.id === id) {
                return slideComp
              }

              // Also search recursively in case there are nested structures
              if (slideComp) {
                const found = searchRecursively([slideComp])
                if (found) return found
              }
            }
          }
        }
      }

      // Search in grid cells
      if (comp.type === 'NewGrid' && comp.props?.cells) {
        for (let rowIndex = 0; rowIndex < comp.props.cells.length; rowIndex++) {
          const row = comp.props.cells[rowIndex]
          for (let colIndex = 0; colIndex < row.length; colIndex++) {
            const cell = row[colIndex]
            if (cell?.component?.id === id) {
              return cell.component
            }
          }
        }
      }

      // Search in grid components array (backward compatibility)
      if (comp.type === 'NewGrid' && comp.props?.components) {
        const validComponents = comp.props.components.filter((c: LayoutComponent | null) => c !== null) as LayoutComponent[]
        for (const gridComponent of validComponents) {
          if (gridComponent?.id === id) {
            return gridComponent
          }
        }
      }

      // Search other nested structures recursively
      if (Array.isArray(comp.props?.children)) {
        const found = searchRecursively(comp.props.children)
        if (found) return found
      }

      if (comp.props?.components) {
        const validComponents = comp.props.components.filter((c: LayoutComponent | null) => c !== null) as LayoutComponent[]
        const found = searchRecursively(validComponents)
        if (found) return found
      }
    }
    return null
  }

  // Search in sections
  for (const section of layout.sections) {
    for (const row of getSectionRows(section)) {
      for (const col of row.columns) {
        const found = searchRecursively(col.components)
        if (found) return found
      }
    }
  }

  // Search in layout.components
  if (layout.components) {
    const found = searchRecursively(layout.components)
    if (found) return found
  }

  return null
}

// 🔹 Pure helper to update component props in layout tree without side-effects
const updateComponentInLayout = (
  layout: PageLayout,
  componentId: string,
  props: Record<string, any>,
): { newLayout: PageLayout; updated: boolean } => {
  const newLayout = cloneLayoutForUpdate(layout)
  let componentUpdated = false

  // 1. Search in swiper/carousel slides
  const searchAndUpdateInSwiperSlides = (): boolean => {
    for (const section of newLayout.sections) {
      for (const row of getSectionRows(section)) {
        for (const col of row.columns) {
          for (const comp of col.components) {
            if (!comp) continue

            // Search in swipercontainer slides
            if (comp.type === 'swipercontainer' && comp.props?.slides) {
              for (let slideIndex = 0; slideIndex < comp.props.slides.length; slideIndex++) {
                const slide = comp.props.slides[slideIndex]
                if (slide?.components) {
                  for (let compIndex = 0; compIndex < slide.components.length; compIndex++) {
                    const slideComponent = slide.components[compIndex]
                    if (slideComponent?.id === componentId) {
                      slide.components[compIndex] = {
                        ...slideComponent,
                        props: {
                          ...slideComponent.props,
                          ...props,
                        },
                      }
                      comp.props = { ...comp.props }
                      componentUpdated = true
                      return true
                    }
                  }
                }
              }
            }

            // Search in carousel slides
            if (comp.type === 'carousel' && comp.props?.slides) {
              for (let slideIndex = 0; slideIndex < comp.props.slides.length; slideIndex++) {
                const slide = comp.props.slides[slideIndex]
                if (slide?.components) {
                  for (let compIndex = 0; compIndex < slide.components.length; compIndex++) {
                    const slideComponent = slide.components[compIndex]
                    if (slideComponent?.id === componentId) {
                      slide.components[compIndex] = {
                        ...slideComponent,
                        props: {
                          ...slideComponent.props,
                          ...props,
                        },
                      }
                      componentUpdated = true
                      return true
                    }
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

  if (!searchAndUpdateInSwiperSlides()) {
    const updateComponentRecursively = (components: LayoutComponent[]): boolean => {
      let updated = false

      for (let i = 0; i < components.length; i++) {
        const comp = components[i]
        if (!comp) continue

        // Direct component match
        if (comp.id === componentId) {
          const mergedProps = {
            ...comp.props,
            ...props,
          }
          const finalChildren = Array.isArray(mergedProps.children) && mergedProps.children.length > 0
            ? mergedProps.children
            : Array.isArray(mergedProps.content?.children) && mergedProps.content.children.length > 0
              ? mergedProps.content.children
              : Array.isArray(mergedProps.children)
                ? mergedProps.children
                : Array.isArray(mergedProps.content?.children)
                  ? mergedProps.content.children
                  : undefined
          if (finalChildren !== undefined) {
            mergedProps.children = finalChildren
            if (mergedProps.content && typeof mergedProps.content === 'object') {
              mergedProps.content.children = finalChildren
            }
          }
          components[i] = {
            ...comp,
            props: mergedProps,
          }
          updated = true
          componentUpdated = true
        }

        // Search in grid cells
        const compTypeLow = String(comp.type || '').trim().toLowerCase()
        if ((compTypeLow === 'newgrid' || compTypeLow === 'grid') && comp.props?.cells) {
          for (let rowIndex = 0; rowIndex < comp.props.cells.length; rowIndex++) {
            const row = comp.props.cells[rowIndex]
            for (let colIndex = 0; colIndex < row.length; colIndex++) {
              const cell = row[colIndex]
              if (cell?.component && cell.component.id === componentId) {
                row[colIndex] = {
                  ...cell,
                  component: {
                    ...cell.component,
                    props: {
                      ...cell.component.props,
                      ...props,
                    },
                  },
                }
                comp.props = { ...comp.props, cells: [...comp.props.cells] }
                updated = true
                componentUpdated = true
                break
              }
            }
            if (updated) break
          }
        }

        // Search in flexbox, container, or any block with children
        if (Array.isArray(comp.props?.children)) {
          if (updateComponentRecursively(comp.props.children)) {
            comp.props = { ...comp.props, children: [...comp.props.children] }
            if (comp.props.content && typeof comp.props.content === 'object') {
              comp.props.content.children = [...comp.props.children]
            }
            updated = true
            componentUpdated = true
          }
        } else if (Array.isArray(comp.props?.content?.children)) {
          if (updateComponentRecursively(comp.props.content.children)) {
            comp.props.children = [...comp.props.content.children]
            comp.props.content.children = [...comp.props.content.children]
            comp.props = { ...comp.props }
            updated = true
            componentUpdated = true
          }
        }

        // Search in nested components
        if (comp.props?.components) {
          const validComponents = comp.props.components.filter((c: LayoutComponent | null) => c !== null) as LayoutComponent[]
          if (updateComponentRecursively(validComponents)) {
            updated = true
            componentUpdated = true
          }
        }
      }
      return updated
    }

    // Search in sections
    for (const section of newLayout.sections) {
      for (const row of getSectionRows(section)) {
        for (const col of row.columns) {
          if (updateComponentRecursively(col.components)) {
            componentUpdated = true
          }
        }
      }
    }

    // Search in layout.components
    if (newLayout.components) {
      if (updateComponentRecursively(newLayout.components)) {
        componentUpdated = true
      }
    }
  }

  return { newLayout, updated: componentUpdated }
}

// In useLayoutActions.ts - add saveLayout parameter
export const useLayoutActions = (
  layout: PageLayout,
  setLayout: (layout: PageLayout | ((prev: PageLayout) => PageLayout)) => void,
  saveLayout?: (layout: PageLayout) => Promise<boolean>,
) => {
  const layoutRef = useRef(layout)

  useEffect(() => {
    layoutRef.current = layout
  }, [layout])

  // Pure component update handler - updates local layout state immediately without network side-effects
  const handleComponentUpdate = useCallback(
    (componentId: string, props: Record<string, any>) => {
      const baseLayout = layoutRef.current
      const { newLayout, updated } = updateComponentInLayout(baseLayout, componentId, props)

      if (!updated) {
        console.warn('Component update skipped because the component was not found in the current editor layout.', {
          componentId,
        })
        return
      }

      // Pure state update - updates canvas live instantly
      setLayout(newLayout)
    },
    [setLayout],
  )

  // 🆕 FIXED: Complete drag end handler with carousel support
  const handleDragEnd = useCallback(
    (result: any, draggedItem: any) => {
      console.log('🎯 [useLayoutActions] handleDragEnd called:', { result, draggedItem })

      if (!result.destination) {
        console.log('❌ No destination for drop')
        return
      }

      const { destination } = result
      const dropZoneId = destination.droppableId

      // Extract component type from draggedItem
      let componentType = draggedItem.type
      if (componentType === 'component' && draggedItem.id) {
        const idParts = draggedItem.id.split(':')
        if (idParts.length > 1) {
          componentType = idParts[1]
        } else {
          componentType = draggedItem.id
        }
      }

      console.log('🔧 Using component type:', componentType)

      // Reorder existing components when dropping one sortable item onto another.
      if (
        draggedItem?.data?.sortable &&
        typeof dropZoneId === 'string' &&
        dropZoneId.startsWith('component:') &&
        draggedItem?.id
      ) {
        const sourceComponentId = String(draggedItem.id)
        const targetComponentId = String(dropZoneId).split(':')[1] || ''

        if (sourceComponentId && targetComponentId && sourceComponentId !== targetComponentId) {
          setLayout((prevLayout) => {
            const newLayout = cloneLayoutForUpdate(prevLayout)
            const sourceLocation = findDirectComponentLocation(newLayout, sourceComponentId)
            const targetLocation = findDirectComponentLocation(newLayout, targetComponentId)

            if (!sourceLocation || !targetLocation) {
              return prevLayout
            }

            const sourceRows = getSectionRows(newLayout.sections[sourceLocation.sectionIndex])
            const targetRows = getSectionRows(newLayout.sections[targetLocation.sectionIndex])
            const sourceColumn = sourceRows?.[sourceLocation.rowIndex]?.columns?.[sourceLocation.colIndex]
            const targetColumn = targetRows?.[targetLocation.rowIndex]?.columns?.[targetLocation.colIndex]

            if (!sourceColumn || !targetColumn || !Array.isArray(sourceColumn.components) || !Array.isArray(targetColumn.components)) {
              return prevLayout
            }

            const [movedComponent] = sourceColumn.components.splice(sourceLocation.componentIndex, 1)
            if (!movedComponent) {
              return prevLayout
            }

            const sameColumn =
              sourceLocation.sectionIndex === targetLocation.sectionIndex &&
              sourceLocation.rowIndex === targetLocation.rowIndex &&
              sourceLocation.colIndex === targetLocation.colIndex

            const insertIndex = sameColumn
              ? sourceLocation.componentIndex < targetLocation.componentIndex
                ? Math.max(0, targetLocation.componentIndex - 1)
                : targetLocation.componentIndex
              : targetLocation.componentIndex

            targetColumn.components.splice(insertIndex, 0, movedComponent)

            if (saveLayout) {
              setTimeout(() => {
                saveLayout(newLayout).then((success) => {
                  console.log(success ? '💾 Component reorder saved' : '❌ Failed to save component reorder')
                })
              }, 0)
            }

            return newLayout
          })

          return
        }
      }

      // 🎯 CRITICAL FIX: Handle carousel drops
      if (dropZoneId?.startsWith('component:carousel-')) {
        console.log('🎠 CAROUSEL DROP DETECTED:', dropZoneId)

        const carouselMatch = dropZoneId.match(/component:carousel-([^:]+)/)
        if (carouselMatch) {
          const carouselIdFromDrop = carouselMatch[1]
          console.log('🔍 Carousel ID parsed from drop:', carouselIdFromDrop)

          setLayout((prevLayout) => {
            const newLayout = cloneLayoutForUpdate(prevLayout)
            let carouselUpdated = false

            const findAndUpdateCarousel = (components: LayoutComponent[]): boolean => {
              for (let i = 0; i < components.length; i++) {
                const comp = components[i]
                if (!comp) continue

                // Check if this is the target carousel
                const isMatchingCarousel =
                  comp.type === 'carousel' &&
                  (comp.id === carouselIdFromDrop || comp.id === `carousel-${carouselIdFromDrop}` || comp.id.includes(carouselIdFromDrop))

                if (isMatchingCarousel) {
                  console.log('🎯 Found target carousel:', {
                    compId: comp.id,
                    carouselIdFromDrop,
                    isMatch: true,
                    hasSlides: !!comp.props?.slides,
                  })

                  // Initialize carousel props if needed
                  if (!comp.props) comp.props = {}
                  if (!comp.props.slides) comp.props.slides = []

                  // Get current slide index from drop zone
                  let targetSlideIndex = 0
                  const dropZoneElement = document.querySelector(`[data-drop-zone-id="${dropZoneId}"]`)
                  if (dropZoneElement) {
                    const currentSlideIndexAttr = dropZoneElement.getAttribute('data-current-slide-index')
                    if (currentSlideIndexAttr) {
                      targetSlideIndex = parseInt(currentSlideIndexAttr)
                      console.log('🎯 Using current slide index from drop zone:', targetSlideIndex)
                    }
                  }

                  // Ensure slide exists at index
                  if (targetSlideIndex >= comp.props.slides.length) {
                    console.log('🆕 Creating missing slide at index:', targetSlideIndex)
                    while (comp.props.slides.length <= targetSlideIndex) {
                      comp.props.slides.push({
                        id: `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        components: [],
                      })
                    }
                  }

                  const targetSlide = comp.props.slides[targetSlideIndex]
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

                  console.log('✅ Component added to carousel slide:', {
                    slideIndex: targetSlideIndex,
                    componentType,
                    componentId: newComponent.id,
                  })

                  carouselUpdated = true
                  return true
                }

                // Recursively search nested components
                if (comp.props?.components) {
                  const validComponents = comp.props.components.filter((c: LayoutComponent | null) => c !== null) as LayoutComponent[]
                  if (findAndUpdateCarousel(validComponents)) return true
                }

                // Search carousel slides
                if (comp.type === 'carousel' && comp.props?.slides) {
                  for (const slide of comp.props.slides) {
                    if (slide?.components) {
                      const validComponents = slide.components.filter((c: LayoutComponent) => c !== null)
                      if (findAndUpdateCarousel(validComponents)) return true
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
                    if (findAndUpdateCarousel(validComponents)) return true
                  }
                }
              }

              // Search top-level components
              if (newLayout.components && newLayout.components.length > 0) {
                const validComponents = newLayout.components.filter((c: LayoutComponent | null) => c !== null) as LayoutComponent[]
                if (findAndUpdateCarousel(validComponents)) return true
              }

              return false
            }

            if (searchEverywhere()) {
              console.log('✅ Carousel updated successfully')

              // Auto-save
              if (saveLayout) {
                setTimeout(() => {
                  saveLayout(newLayout).then((success) => {
                    console.log(success ? '💾 Carousel update saved' : '❌ Failed to save carousel update')
                  })
                }, 300)
              }

              return newLayout
            }

            console.error('❌ Carousel not found in layout:', carouselIdFromDrop)
            return newLayout
          })

          return
        }
      }

      // Handle section drops
      if (dropZoneId?.startsWith('section:')) {
        console.log('🎯 Dropping in section:', dropZoneId)
        const sectionId = dropZoneId.replace('section:', '')

        setLayout((prevLayout) => {
          const newLayout = cloneLayoutForUpdate(prevLayout)

          // Find the section
          const section = newLayout.sections.find((s: Section) => s.id === sectionId)
          if (!section) {
            console.log('❌ Section not found:', sectionId)
            return prevLayout
          }

          // If section has no rows/columns, create default structure
          const sectionRows = ensureSectionRows(section)
          if (sectionRows.length === 0) {
            const nextRows = [
              {
                id: `row-${Date.now()}`,
                columns: [
                  {
                    id: `col-${Date.now()}`,
                    width: 100,
                    components: [],
                  },
                ],
              },
            ]
            if (Array.isArray(section.container?.rows)) {
              section.container.rows = nextRows
            } else {
              ;(section as any).rows = nextRows
            }
          }

          // Get the first column of first row
          const firstRow = ensureSectionRows(section)[0]
          const firstColumn = firstRow.columns[0]

          if (!firstColumn) {
            console.log('❌ No columns found in section')
            return newLayout
          }

          // Create the component
          let componentToAdd: LayoutComponent

          if (draggedItem?.id === 'NewGrid' || draggedItem?.type === 'NewGrid') {
            // Create NewGrid component
            componentToAdd = createNewGridComponent()
          } else {
            // Create regular component from library
            const componentDef = getComponentDefinition(componentType)

            if (!componentDef) {
              console.log('❌ Component definition not found:', componentType)
              return newLayout
            }

            componentToAdd = createLayoutComponentFromDefinition(componentDef)
          }

          // Add component to the column at the correct position
          const insertIndex = destination.index >= 0 ? destination.index : firstColumn.components.length
          firstColumn.components.splice(insertIndex, 0, componentToAdd)

          console.log('✅ Component added to section:', {
            sectionId,
            componentType: componentToAdd.type,
            insertIndex,
          })

          return newLayout
        })
      }

      // Handle column drops
      else if (dropZoneId?.startsWith('component:column:')) {
        console.log('🎯 Dropping in column:', dropZoneId)
        const destParts = dropZoneId.split(':')
        const [_, sectionId, containerId, rowId, colId] = destParts

        setLayout((prevLayout) => {
          const newLayout = cloneLayoutForUpdate(prevLayout)

          // Find the target column
          const section = newLayout.sections.find((s: Section) => s.id === sectionId)
          if (!section) {
            console.log('❌ Section not found:', sectionId)
            return prevLayout
          }

          const row = ensureSectionRows(section).find((r: any) => r.id === rowId)
          if (!row) {
            console.log('❌ Row not found:', rowId)
            return prevLayout
          }

          const column = row.columns.find((c: any) => c.id === colId)
          if (!column) {
            console.log('❌ Column not found:', colId)
            return prevLayout
          }

          // Create the component
          let componentToAdd: LayoutComponent

          if (draggedItem?.id === 'NewGrid' || draggedItem?.type === 'NewGrid') {
            // Create NewGrid component
            componentToAdd = createNewGridComponent()
          } else {
            // Create regular component from library
            const componentDef = getComponentDefinition(componentType)

            if (!componentDef) {
              console.log('❌ Component definition not found:', componentType)
              return newLayout
            }

            componentToAdd = createLayoutComponentFromDefinition(componentDef)
          }

          // Add component to the column at the correct position
          const insertIndex = destination.index >= 0 ? destination.index : column.components.length
          column.components.splice(insertIndex, 0, componentToAdd)

          console.log('✅ Component added to column:', {
            sectionId,
            columnId: colId,
            componentType: componentToAdd.type,
            insertIndex,
          })

          return newLayout
        })
      }

      // Handle grid cell drops
      else if (dropZoneId?.startsWith('grid-cell:')) {
        console.log('🎯 Dropping in grid cell:', dropZoneId)
        // Add your grid cell drop logic here
      }

      // Handle other drop zones
      else {
        console.log('⚠️ Unknown drop zone:', dropZoneId)
      }
    },
    [setLayout, saveLayout],
  )

  const handleAddSection = useCallback(() => {
    // 🆕 FIX: Add column count prompt
    let columnCount = 1

    // Try to use browser prompt
    if (typeof window !== 'undefined' && window.prompt) {
      const input = window.prompt('How many columns do you want in this section? (1-6)', '2')

      if (input === null) {
        // User cancelled
        return
      }

      const parsed = parseInt(input, 10)
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 6) {
        columnCount = parsed
      } else {
        // Invalid input, use default
        columnCount = 2
      }
    }

    setLayout((prevLayout) => {
      const timestamp = Date.now()
      const columns = []

      // Create columns based on user input
      for (let i = 0; i < columnCount; i++) {
        columns.push({
          id: `col-${timestamp}-${i}`,
          width: 100 / columnCount, // Equal width distribution
          components: [],
        })
      }

      const newSection: Section = {
        id: `section-${timestamp}`,
        name: `Section with ${columnCount} Column${columnCount > 1 ? 's' : ''}`,
        type: 'custom',
        container: {
          id: `container-${timestamp}`,
          rows: [
            {
              id: `row-${timestamp}`,
              columns: columns,
            },
          ],
        },
      }

      console.log(`✅ Added new section with ${columnCount} column${columnCount > 1 ? 's' : ''}`)

      return {
        ...prevLayout,
        sections: [newSection, ...prevLayout.sections],
      }
    })
  }, [setLayout])

  const handleSetSectionRows = useCallback(
    (sectionId: string, numRows: number) => {
      setLayout((prevLayout) => {
        const sectionIndex = prevLayout.sections.findIndex((s: Section) => s.id === sectionId)
        if (sectionIndex === -1) return prevLayout

        const section = prevLayout.sections[sectionIndex]
        const rows = []

        for (let i = 0; i < numRows; i++) {
          rows.push({
            id: `row-${Date.now()}-${i}`,
            columns: [
              {
                id: `col-${Date.now()}-${i}`,
                width: 100,
                components: [],
              },
            ],
          })
        }

        const updatedSection = {
          ...section,
          container: {
            ...section.container,
            rows,
          },
        }

        const newSections = [...prevLayout.sections]
        newSections[sectionIndex] = updatedSection

        return {
          ...prevLayout,
          sections: newSections,
        }
      })
    },
    [setLayout],
  )

  const handleSetSectionColumns = useCallback(
    (sectionId: string, numColumns: number) => {
      setLayout((prevLayout) => {
        const sectionIndex = prevLayout.sections.findIndex((s: Section) => s.id === sectionId)
        if (sectionIndex === -1) return prevLayout

        const section = prevLayout.sections[sectionIndex]
        const columns = []

        for (let i = 0; i < numColumns; i++) {
          columns.push({
            id: `col-${Date.now()}-${i}`,
            width: 100 / numColumns,
            components: [],
          })
        }

        const newRow = {
          id: `row-${Date.now()}`,
          columns,
        }

        const updatedSection = {
          ...section,
          container: {
            ...section.container,
            rows: [newRow],
          },
        }

        const newSections = [...prevLayout.sections]
        newSections[sectionIndex] = updatedSection

        return {
          ...prevLayout,
          sections: newSections,
        }
      })
    },
    [setLayout],
  )

  const handleComponentAdd = useCallback(
    (componentDef: ComponentDefinition) => {
      setLayout((prevLayout) => {
        const newLayout = cloneLayoutForUpdate(prevLayout)

        const newComponent: LayoutComponent = createLayoutComponentFromDefinition(componentDef)

        if (newLayout.sections.length === 0) {
          const newSection: Section = {
            id: `section-${Date.now()}`,
            name: 'New Section',
            type: 'custom',
            container: {
              id: `container-${Date.now()}`,
              rows: [
                {
                  id: `row-${Date.now()}`,
                  columns: [
                    {
                      id: `col-${Date.now()}`,
                      width: 100,
                      components: [newComponent],
                    },
                  ],
                },
              ],
            },
          }
          newLayout.sections = [newSection]
        } else {
          const firstSection = newLayout.sections[0]
          const firstSectionRows = ensureSectionRows(firstSection)
          if (firstSectionRows.length === 0) {
            const nextRows = [
              {
                id: `row-${Date.now()}`,
                columns: [
                  {
                    id: `col-${Date.now()}`,
                    width: 100,
                    components: [newComponent],
                  },
                ],
              },
            ]
            if (Array.isArray(firstSection.container?.rows)) {
              firstSection.container.rows = nextRows
            } else {
              ;(firstSection as any).rows = nextRows
            }
          } else {
            const firstRow = ensureSectionRows(firstSection)[0]
            if (firstRow.columns.length === 0) {
              firstRow.columns = [
                {
                  id: `col-${Date.now()}`,
                  width: 100,
                  components: [newComponent],
                },
              ]
            } else {
              firstRow.columns[0].components.push(newComponent)
            }
          }
        }

        return newLayout
      })
    },
    [setLayout],
  )

  const handleSectionDelete = useCallback(
    (sectionId: string) => {
      setLayout((prevLayout) => ({
        ...prevLayout,
        sections: prevLayout.sections.filter((section) => section.id !== sectionId),
      }))
    },
    [setLayout],
  )

  const deleteComponent = useCallback(
    (componentId: string, context?: any) => {
      console.log('🗑️ [useLayoutActions] deleteComponent called:', {
        componentId,
        context,
      })

      setLayout((prevLayout) => {
        const newLayout = cloneLayoutForUpdate(prevLayout)
        let componentDeleted = false

        // Helper to delete from array
        const deleteFromArray = (components: LayoutComponent[]): boolean => {
          const index = components.findIndex((c: LayoutComponent) => c?.id === componentId)
          if (index !== -1) {
            components.splice(index, 1)
            return true
          }
          return false
        }

        // Helper to delete from grid cells
        const deleteFromGridCells = (grid: any): boolean => {
          if (!grid.props?.cells) return false

          for (let rowIndex = 0; rowIndex < grid.props.cells.length; rowIndex++) {
            const row = grid.props.cells[rowIndex]
            for (let colIndex = 0; colIndex < row.length; colIndex++) {
              const cell = row[colIndex]
              if (cell?.component?.id === componentId) {
                row[colIndex] = { ...cell, component: null }
                return true
              }
            }
          }
          return false
        }

        // Search recursively
        const searchAndDelete = (components: LayoutComponent[]): boolean => {
          for (const comp of components) {
            if (!comp) continue

            // Direct match
            if (comp.id === componentId) {
              return deleteFromArray(components)
            }

            // Grid cells
            if (comp.type === 'NewGrid' && deleteFromGridCells(comp)) {
              return true
            }

            // Carousel slides
            if (comp.type === 'carousel' && comp.props?.slides) {
              const targetSlideIndex = context?.slideIndex || 0
              const slide = comp.props.slides[targetSlideIndex]
              if (slide?.components) {
                if (deleteFromArray(slide.components)) {
                  return true
                }
              }
            }

            // Children of container, flexbox, or composite blocks
            if (Array.isArray(comp.props?.children)) {
              if (searchAndDelete(comp.props.children)) {
                comp.props = { ...comp.props, children: [...comp.props.children] }
                return true
              }
            }

            // Nested components
            if (comp.props?.components) {
              const validComponents = comp.props.components.filter((c: LayoutComponent | null) => c !== null) as LayoutComponent[]
              if (searchAndDelete(validComponents)) {
                return true
              }
            }
          }
          return false
        }

        // Search in sections
        for (const section of newLayout.sections) {
          for (const row of getSectionRows(section)) {
            for (const col of row.columns) {
              if (searchAndDelete(col.components)) {
                componentDeleted = true
                break
              }
            }
            if (componentDeleted) break
          }
          if (componentDeleted) break
        }

        // Search in layout.components
        if (!componentDeleted && newLayout.components) {
          if (searchAndDelete(newLayout.components)) {
            componentDeleted = true
          }
        }

        if (componentDeleted) {
          console.log('✅ Component deleted successfully')
        } else {
          console.log('❌ Component not found in layout')
        }

        return newLayout
      })
    },
    [setLayout],
  )

  const duplicateComponent = useCallback(
    (componentId: string) => {
      setLayout((prevLayout) => {
        const safePrevLayout = cloneLayoutForUpdate(prevLayout)
        const sourceComponent = findComponentEverywhere(safePrevLayout, componentId)
        if (!sourceComponent) {
          return safePrevLayout
        }

        const newLayout = cloneLayoutForUpdate(safePrevLayout)

        // Create duplicated component with new ID
        const duplicatedComponent: LayoutComponent = {
          ...sourceComponent,
          id: `${sourceComponent.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          props: sourceComponent.props ? JSON.parse(JSON.stringify(sourceComponent.props)) : {},
        }

        // Find the parent container and add the duplicated component
        let componentAdded = false

        const addToParent = (components: LayoutComponent[]): boolean => {
          const sourceIndex = components.findIndex((c: LayoutComponent) => c?.id === componentId)
          if (sourceIndex !== -1) {
            components.splice(sourceIndex + 1, 0, duplicatedComponent)
            return true
          }
          for (const c of components) {
            if (Array.isArray(c?.props?.children)) {
              if (addToParent(c.props.children)) {
                c.props = { ...c.props, children: [...c.props.children] }
                return true
              }
            }
          }
          return false
        }

        // Search in sections
        for (const section of newLayout.sections) {
          for (const row of getSectionRows(section)) {
            for (const col of row.columns) {
              if (addToParent(col.components)) {
                componentAdded = true
                break
              }
            }
            if (componentAdded) break
          }
          if (componentAdded) break
        }

        // Search in layout.components
        if (!componentAdded && newLayout.components) {
          addToParent(newLayout.components)
        }

        return newLayout
      })
    },
    [setLayout],
  )

  const moveComponent = useCallback(
    (componentId: string, targetContainerId: string, targetIndex: number) => {
      setLayout((prevLayout) => {
        const safePrevLayout = cloneLayoutForUpdate(prevLayout)
        const sourceComponent = findComponentEverywhere(safePrevLayout, componentId)
        if (!sourceComponent) {
          return safePrevLayout
        }

        // Simple implementation - just duplicate for now
        const newLayout = cloneLayoutForUpdate(safePrevLayout)

        // Create duplicated component with new ID
        const movedComponent: LayoutComponent = {
          ...sourceComponent,
          id: `${sourceComponent.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        }

        // Find target column and add component
        for (const section of newLayout.sections) {
          for (const row of getSectionRows(section)) {
            for (const col of row.columns) {
              if (col.id === targetContainerId) {
                col.components.splice(targetIndex, 0, movedComponent)
                return newLayout
              }
            }
          }
        }

        return safePrevLayout
      })
    },
    [setLayout],
  )

  const handleColumnDelete = useCallback(
    (sectionId: string, containerId: string, rowId: string, colId: string) => {
      console.log('🗑️ Deleting column:', { sectionId, containerId, rowId, colId })

      setLayout((prevLayout) => {
        const newLayout = cloneLayoutForUpdate(prevLayout)
        let columnDeleted = false

        // Find section
        for (const section of newLayout.sections) {
          if (section.id === sectionId) {
            // Find row
            const sectionRows = ensureSectionRows(section)
            for (const row of sectionRows) {
              if (row.id === rowId) {
                // Delete column
                const originalColumnCount = row.columns.length
                row.columns = row.columns.filter((col: any) => col.id !== colId)

                if (row.columns.length < originalColumnCount) {
                  columnDeleted = true
                  console.log('✅ Column deleted successfully')

                  // If all columns deleted, delete row too
                  if (row.columns.length === 0) {
                    const nextRows = sectionRows.filter((r: any) => r.id !== rowId)
                    if (Array.isArray(section.container?.rows)) {
                      section.container.rows = nextRows
                    } else {
                      ;(section as any).rows = nextRows
                    }
                    console.log('Row also deleted as it has no columns')
                  }
                }
                break
              }
            }
            break
          }
        }

        if (!columnDeleted) {
          console.error('❌ Column not found for deletion')
        }

        return newLayout
      })
    },
    [setLayout],
  )

  // Return all actions
  return {
    handleComponentUpdate,
    handleDragEnd,
    handleAddSection,
    handleSetSectionRows,
    handleSetSectionColumns,
    handleComponentAdd,
    handleSectionDelete,
    deleteComponent,
    duplicateComponent,
    moveComponent,
    handleColumnDelete,
  }
}
