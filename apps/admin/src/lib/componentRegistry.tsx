import React from 'react'
import type { ComponentDefinition } from '@/types/page-editor'
import {
  assertAdminComponentsRegistered,
  blockDefinitions,
  getAdminComponent,
  getAdminComponentIdForBlock,
  getBlockOrThrow,
  getBlockSchema,
  getBlockDefaults,
  registerAdminComponents,
  type BlockLibraryGroup,
  type BlockTypeKey,
} from '@uadmin/shared/blocks/registry'
import AdvancedAccordion from '../components/PageEditor/components/AdvancedAccordion'
import AdvancedCardPreviewRenderer from '../components/PageEditor/components/AdvancedCardPreviewRenderer'
import AdvancedHeadingPreviewRenderer from '../components/PageEditor/components/AdvancedHeadingPreviewRenderer'
import AdvancedList from '../components/PageEditor/components/AdvancedList'
import AdvancedParagraphPreviewRenderer from '../components/PageEditor/components/AdvancedParagraphPreviewRenderer'
import ContainerAdminRenderer from '../components/PageEditor/components/ContainerAdminRenderer'
import FilterComponent from '../components/PageEditor/components/Filter'
import FlexboxAdminRenderer from '../components/PageEditor/components/FlexboxAdminRenderer'
import ImageAdminRenderer from '../components/PageEditor/components/ImageAdminRenderer'
import NewGridAdminComponent from '../components/PageEditor/components/NewGrid'
import SwiperContainerAdminComponent from '../components/PageEditor/components/SwiperContainer'
import TabsAdminRenderer from '../components/PageEditor/components/TabsAdminRenderer'

import { simpleBlockRenderers } from './simpleBlockRenderers'

type ComponentSchema = ComponentDefinition['schema']

registerAdminComponents({
  ...simpleBlockRenderers,
  container: (props) => React.createElement(ContainerAdminRenderer, props),
  advancedheading: (props) => React.createElement(AdvancedHeadingPreviewRenderer, props),
  advancedparagraph: (props) => React.createElement(AdvancedParagraphPreviewRenderer, props),
  advancedcard: (props) => React.createElement(AdvancedCardPreviewRenderer, props),
  advancedaccordion: (props) => React.createElement(AdvancedAccordion, props),
  advancedlist: (props) => React.createElement(AdvancedList, props),
  filter: (props) => React.createElement(FilterComponent, props),
  flexbox: (props) => React.createElement(FlexboxAdminRenderer, props),
  image: (props) => React.createElement(ImageAdminRenderer, props),
  swipercontainer: (props) => React.createElement(SwiperContainerAdminComponent, props),
  newgrid: (props) => React.createElement(NewGridAdminComponent, props),
  tabs: (props) => React.createElement(TabsAdminRenderer, props),
})

assertAdminComponentsRegistered()

function toAdminCategory(type: BlockTypeKey, group: BlockLibraryGroup): ComponentDefinition['category'] {
  if (type === 'image' || type === 'video' || type === 'icon') {
    return 'media'
  }

  switch (group) {
    case 'layout':
      return 'layout'
    case 'interactive':
      return 'interactive'
    case 'advanced':
      return 'advanced'
    case 'content':
    default:
      return 'content'
  }
}

function createComponentDefinition(type: BlockTypeKey): ComponentDefinition {
  const block = getBlockOrThrow(type)

  if (!block) {
    throw new Error(`Unknown admin block type: ${type}`)
  }

  return {
    id: getAdminComponentIdForBlock(type) || block.admin.componentId,
    name: block.label,
    type: block.admin.type,
    category: toAdminCategory(type, block.libraryGroup),
    icon: block.admin.icon || block.admin.glyphKey,
    description: block.description,
    supportsChildren: Boolean(block.contract?.supportsChildren),
    defaultProps: getBlockDefaults(type),
    schema: getBlockSchema(type) as ComponentSchema,
    render: getAdminComponent(type),
  }
}

class ComponentRegistry {
  private components = new Map<string, ComponentDefinition>()
  private categories = new Map<string, ComponentDefinition[]>()

  clear(): void {
    this.components.clear()
    this.categories.clear()
  }

  register(component: ComponentDefinition): void {
    this.components.set(component.id, component)

    if (!this.categories.has(component.category)) {
      this.categories.set(component.category, [])
    }

    this.categories.get(component.category)?.push(component)
  }

  getComponent(id: string): ComponentDefinition | undefined {
    const resolvedId = getAdminComponentIdForBlock(id) || id
    return this.components.get(resolvedId)
  }

  getAllComponents(): ComponentDefinition[] {
    return Array.from(this.components.values())
  }

  getComponentsByCategory(category: string): ComponentDefinition[] {
    return this.categories.get(category) || []
  }

  getCategories(): string[] {
    return Array.from(this.categories.keys())
  }

  searchComponents(query: string): ComponentDefinition[] {
    const normalizedQuery = query.toLowerCase()

    return this.getAllComponents().filter((component) =>
      [component.name, component.description, component.category, component.type, component.id]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery),
    )
  }

  getComponentRenderer(id: string): ComponentDefinition['render'] | undefined {
    return this.getComponent(id)?.render
  }
}

export const componentRegistry = new ComponentRegistry()
let registryInitialized = false

export function initializeComponentRegistry(): void {
  if (registryInitialized) {
    return
  }

  componentRegistry.clear()
  blockDefinitions.map((definition) => createComponentDefinition(definition.key)).forEach((component) => {
    componentRegistry.register(component)
  })
  registryInitialized = true
}

initializeComponentRegistry()
