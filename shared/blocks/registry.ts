import { containerContract } from './container'
import { buttonContract } from './button'
import { dividerContract } from './divider'
import { filterContract } from './filter'
import { flexboxContract } from './flexbox'
import { imageContract } from './image'
import { iconContract } from './icon'
import { advancedHeadingContract } from './advancedheading'
import { advancedParagraphContract } from './advancedparagraph'
import { advancedCardContract } from './advancedcard'
import { advancedAccordionContract } from './advancedaccordion'
import { advancedListContract } from './advancedlist'
import { quoteContract } from './quote'
import { spacerContract } from './spacer'
import { tabsContract } from './tabs'
import { videoContract } from './video'
import { swiperContainerContract } from './swipercontainer'
import { newGridContract } from './newgrid'

export type BlockTypeKey =
  | 'spacer'
  | 'container'
  | 'flexbox'
  | 'button'
  | 'image'
  | 'advancedheading'
  | 'advancedparagraph'
  | 'advancedcard'
  | 'advancedlist'
  | 'advancedaccordion'
  | 'swipercontainer'
  | 'newgrid'
  | 'quote'
  | 'filter'
  | 'video'
  | 'icon'
  | 'divider'
  | 'tabs'

export type BlockLibraryGroup = 'layout' | 'content' | 'interactive' | 'advanced'

export type BlockContractSchema = {
  title?: string
  fields?: Array<Record<string, any>>
  properties?: Record<string, Record<string, any>>
}

export type BlockContract<Props extends Record<string, any> = Record<string, any>, ViewModel extends Record<string, any> = Props> = {
  defaultProps?: Props
  schema?: BlockContractSchema
  supportsChildren?: boolean
  normalize?: (props?: any) => Props
  createViewModel?: (props?: any) => ViewModel
}

export type BlockDefinition = {
  type: BlockTypeKey
  key: BlockTypeKey
  label: string
  description: string
  libraryGroup: BlockLibraryGroup
  aliases: string[]
  contract?: BlockContract
  admin: {
    componentId: string
    type: string
    glyphKey: string
    icon?: string
  }
  website: {
    rendererKey: BlockTypeKey
  }
}

export type BlockAdminComponent<T = any> = (props: any) => T
export type BlockWebsiteRenderer<T = any> = (props: any) => T

const adminComponentRegistry: Partial<Record<BlockTypeKey, BlockAdminComponent>> = {}
const websiteRendererRegistry: Partial<Record<BlockTypeKey, BlockWebsiteRenderer>> = {}

function createTraceId() {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  return `trace-${Math.random().toString(36).slice(2, 10)}`
}

function getEnvironment() {
  const processLike =
    typeof globalThis !== 'undefined' && 'process' in globalThis
      ? (globalThis as typeof globalThis & { process?: { env?: { NODE_ENV?: string } } }).process
      : undefined

  return processLike?.env?.NODE_ENV === 'production' ? 'production' : 'development'
}

export function registerAdminComponents(components: Partial<Record<BlockTypeKey, BlockAdminComponent>>) {
  Object.assign(adminComponentRegistry, components)
}

export function registerWebsiteRenderers(renderers: Partial<Record<BlockTypeKey, BlockWebsiteRenderer>>) {
  Object.assign(websiteRendererRegistry, renderers)
}

export function clearBlockRuntimeRegistrations() {
  ;(Object.keys(adminComponentRegistry) as BlockTypeKey[]).forEach((key) => {
    delete adminComponentRegistry[key]
  })
  ;(Object.keys(websiteRendererRegistry) as BlockTypeKey[]).forEach((key) => {
    delete websiteRendererRegistry[key]
  })
}

function getRegisteredAdminComponent(type: BlockTypeKey): BlockAdminComponent | undefined {
  return adminComponentRegistry[type]
}

function getRegisteredWebsiteRenderer(type: BlockTypeKey): BlockWebsiteRenderer | undefined {
  return websiteRendererRegistry[type]
}

function hasAdminRenderer(type: BlockTypeKey) {
  return Boolean(getRegisteredAdminComponent(type))
}

function hasWebsiteRenderer(type: BlockTypeKey) {
  return Boolean(getRegisteredWebsiteRenderer(type))
}

function getAliasLookup() {
  const cachedLookup = (getAliasLookup as typeof getAliasLookup & {
    cache?: Map<string, BlockTypeKey>
  }).cache

  if (cachedLookup) {
    return cachedLookup
  }

  const lookup = new Map<string, BlockTypeKey>()

  for (const definition of Object.values(blockRegistry)) {
    lookup.set(definition.key.toLowerCase(), definition.key)
    lookup.set(definition.admin.componentId.toLowerCase(), definition.key)
    lookup.set(definition.admin.type.toLowerCase(), definition.key)

    for (const alias of definition.aliases) {
      lookup.set(alias.toLowerCase(), definition.key)
    }
  }

  ;(getAliasLookup as typeof getAliasLookup & {
    cache?: Map<string, BlockTypeKey>
  }).cache = lookup
  return lookup
}

export const blockRegistry: Record<BlockTypeKey, BlockDefinition> = {
  spacer: {
    type: 'spacer',
    key: 'spacer',
    label: 'Spacer',
    description: 'Add vertical spacing between blocks.',
    libraryGroup: 'layout',
    aliases: ['spacer'],
    contract: spacerContract,
    admin: { componentId: 'spacer', type: 'spacer', glyphKey: 'spacer', icon: '⤸' },
    website: { rendererKey: 'spacer' },
  },
  container: {
    type: 'container',
    key: 'container',
    label: 'Container',
    description: 'Wrap content in a structural container.',
    libraryGroup: 'layout',
    aliases: ['container'],
    contract: containerContract,
    admin: { componentId: 'container', type: 'container', glyphKey: 'container', icon: '📦' },
    website: { rendererKey: 'container' },
  },
  flexbox: {
    type: 'flexbox',
    key: 'flexbox',
    label: 'Flex',
    description: 'Arrange nested content with flexible layout controls.',
    libraryGroup: 'layout',
    aliases: ['flexbox', 'flex-box'],
    contract: flexboxContract,
    admin: { componentId: 'flexbox', type: 'flexbox', glyphKey: 'flex', icon: '⎸ ☰ ⎹' },
    website: { rendererKey: 'flexbox' },
  },
  button: {
    type: 'button',
    key: 'button',
    label: 'Button',
    description: 'Render the canonical button block with full styling, icon, state, and responsive controls.',
    libraryGroup: 'interactive',
    aliases: ['button', 'advancedbutton'],
    contract: buttonContract,
    admin: { componentId: 'button', type: 'button', glyphKey: 'button', icon: '🔘' },
    website: { rendererKey: 'button' },
  },
  divider: {
    type: 'divider',
    key: 'divider',
    label: 'Divider',
    description: 'Separate content areas with a visual divider.',
    libraryGroup: 'layout',
    aliases: ['divider'],
    contract: dividerContract,
    admin: { componentId: 'divider', type: 'divider', glyphKey: 'divider', icon: '➖' },
    website: { rendererKey: 'divider' },
  },
  advancedheading: {
    type: 'advancedheading',
    key: 'advancedheading',
    label: 'Heading',
    description: 'Render the canonical heading block with structured styling, highlight, SEO, and accessibility controls.',
    libraryGroup: 'content',
    aliases: ['advancedheading', 'heading'],
    contract: advancedHeadingContract,
    admin: { componentId: 'advancedheading', type: 'advancedheading', glyphKey: 'heading' },
    website: { rendererKey: 'advancedheading' },
  },
  advancedparagraph: {
    type: 'advancedparagraph',
    key: 'advancedparagraph',
    label: 'Paragraph',
    description: 'Render long-form text or rich text content.',
    libraryGroup: 'content',
    aliases: ['advancedparagraph', 'paragraph', 'richtext', 'rich-text'],
    contract: advancedParagraphContract,
    admin: { componentId: 'advancedparagraph', type: 'advancedparagraph', glyphKey: 'paragraph' },
    website: { rendererKey: 'advancedparagraph' },
  },
  advancedlist: {
    type: 'advancedlist',
    key: 'advancedlist',
    label: 'List',
    description: 'Render stylized lists and item groups.',
    libraryGroup: 'content',
    aliases: ['advancedlist', 'list'],
    contract: advancedListContract,
    admin: { componentId: 'advancedlist', type: 'advancedlist', glyphKey: 'list' },
    website: { rendererKey: 'advancedlist' },
  },
  image: {
    type: 'image',
    key: 'image',
    label: 'Image',
    description: 'Render the canonical image block with layout, shape, overlay, hover, and lightbox controls.',
    libraryGroup: 'content',
    aliases: ['image', 'advancedimage', 'advancedimagecomponent', 'advancedImage'],
    contract: imageContract,
    admin: { componentId: 'image', type: 'image', glyphKey: 'image', icon: '🖼️' },
    website: { rendererKey: 'image' },
  },
  video: {
    type: 'video',
    key: 'video',
    label: 'Video',
    description: 'Embed video content.',
    libraryGroup: 'content',
    aliases: ['video'],
    contract: videoContract,
    admin: { componentId: 'video', type: 'video', glyphKey: 'video' },
    website: { rendererKey: 'video' },
  },
  filter: {
    type: 'filter',
    key: 'filter',
    label: 'Filter',
    description: 'Render interactive filtering controls.',
    libraryGroup: 'interactive',
    aliases: ['filter'],
    contract: filterContract,
    admin: { componentId: 'filter', type: 'filter', glyphKey: 'filter' },
    website: { rendererKey: 'filter' },
  },
  tabs: {
    type: 'tabs',
    key: 'tabs',
    label: 'Tabs',
    description: 'Render tabbed content regions.',
    libraryGroup: 'interactive',
    aliases: ['tabs'],
    contract: tabsContract,
    admin: { componentId: 'tabs', type: 'tabs', glyphKey: 'form' },
    website: { rendererKey: 'tabs' },
  },
  advancedaccordion: {
    type: 'advancedaccordion',
    key: 'advancedaccordion',
    label: 'Accordion',
    description: 'Render collapsible accordion content.',
    libraryGroup: 'interactive',
    aliases: ['accordion', 'advancedaccordion'],
    contract: advancedAccordionContract,
    admin: { componentId: 'advancedaccordion', type: 'advancedaccordion', glyphKey: 'accordion' },
    website: { rendererKey: 'advancedaccordion' },
  },
  swipercontainer: {
    type: 'swipercontainer',
    key: 'swipercontainer',
    label: 'Carousel',
    description: 'Render carousel or slider content.',
    libraryGroup: 'interactive',
    aliases: ['swipercontainer'],
    contract: swiperContainerContract,
    admin: { componentId: 'swipercontainer', type: 'swipercontainer', glyphKey: 'carousel' },
    website: { rendererKey: 'swipercontainer' },
  },
  newgrid: {
    type: 'newgrid',
    key: 'newgrid',
    label: 'Grid',
    description: 'Render nested grid-based layouts.',
    libraryGroup: 'advanced',
    aliases: ['newgrid', 'NewGrid', 'grid'],
    contract: newGridContract,
    admin: { componentId: 'NewGrid', type: 'NewGrid', glyphKey: 'grid' },
    website: { rendererKey: 'newgrid' },
  },
  advancedcard: {
    type: 'advancedcard',
    key: 'advancedcard',
    label: 'Card',
    description: 'Render advanced card-based layouts.',
    libraryGroup: 'advanced',
    aliases: ['advancedcard', 'advancedcardcomponent', 'advancedCard', 'card'],
    contract: advancedCardContract,
    admin: { componentId: 'advancedCard', type: 'advancedCard', glyphKey: 'chart' },
    website: { rendererKey: 'advancedcard' },
  },
  quote: {
    type: 'quote',
    key: 'quote',
    label: 'Quote',
    description: 'Render quotation content.',
    libraryGroup: 'content',
    aliases: ['quote'],
    contract: quoteContract,
    admin: { componentId: 'quote', type: 'quote', glyphKey: 'quote', icon: '💬' },
    website: { rendererKey: 'quote' },
  },
  icon: {
    type: 'icon',
    key: 'icon',
    label: 'Icon',
    description: 'Render icon-based content.',
    libraryGroup: 'content',
    aliases: ['icon'],
    contract: iconContract,
    admin: { componentId: 'icon', type: 'icon', glyphKey: 'icon', icon: '⭐' },
    website: { rendererKey: 'icon' },
  },
}

export const blockDefinitions = Object.values(blockRegistry)

function resolveBlockTypeFromIdentifier(type: string): BlockTypeKey | undefined {
  if (!type) {
    return undefined
  }

  const aliasEntries = Array.from(getAliasLookup().entries()).sort((left, right) => right[0].length - left[0].length)
  for (const [alias, resolvedType] of aliasEntries) {
    if (!type.startsWith(`${alias}-`) && !type.startsWith(`${alias}_`)) {
      continue
    }

    const suffix = type.slice(alias.length + 1)
    if (!suffix || !/\d/.test(suffix)) {
      continue
    }

    return resolvedType
  }

  return undefined
}

export function getBlockDefinition(type?: string | null): BlockDefinition | undefined {
  const key = resolveBlockType(type)
  return key ? blockRegistry[key] : undefined
}

export function getBlockOrThrow(type?: string | null): BlockDefinition | null {
  const definition = getBlockDefinition(type)
  if (definition) {
    return definition
  }

  const message = `Unknown block type: ${String(type || 'unknown')}`
  if (getEnvironment() !== 'production') {
    throw new Error(message)
  }

  console.error('unknown_block_type', {
    type: String(type || 'unknown'),
    traceId: createTraceId(),
  })
  return null
}

export function resolveBlockType(type?: string | null): BlockTypeKey | undefined {
  const normalized = String(type || '').trim().toLowerCase()
  if (!normalized) {
    return undefined
  }

  return getAliasLookup().get(normalized) || resolveBlockTypeFromIdentifier(normalized)
}

export function isRegisteredBlockType(type?: string | null): boolean {
  return Boolean(resolveBlockType(type))
}

export function getBlockDefinitionsByGroup(group: BlockLibraryGroup): BlockDefinition[] {
  return blockDefinitions.filter((definition) => definition.libraryGroup === group)
}

export function getAdminComponentIdForBlock(type?: string | null): string | undefined {
  return getBlockOrThrow(type)?.admin.componentId
}

export function getWebsiteRendererKey(type?: string | null): BlockTypeKey | undefined {
  return getBlockOrThrow(type)?.website.rendererKey
}

export function assertAdminComponentsRegistered() {
  const missing = blockDefinitions.filter((definition) => !hasAdminRenderer(definition.key)).map((definition) => definition.key)
  if (missing.length) {
    throw new Error(`Missing admin components for blocks: ${missing.join(', ')}`)
  }
}

export function assertWebsiteRenderersRegistered() {
  const missing = blockDefinitions.filter((definition) => !hasWebsiteRenderer(definition.key)).map((definition) => definition.key)
  if (missing.length) {
    throw new Error(`Missing website renderers for blocks: ${missing.join(', ')}`)
  }
}

export function getAdminComponent<T = any>(type?: string | null): (props: Record<string, unknown>) => T {
  const definition = getBlockOrThrow(type)
  if (!definition) {
    throw new Error(`Unknown admin block type: ${String(type || 'unknown')}`)
  }

  const adminComponent = getRegisteredAdminComponent(definition.key)
  if (adminComponent) {
    return adminComponent as (props: Record<string, unknown>) => T
  }

  throw new Error(`Missing admin component for block type: ${String(type || 'unknown')}`)
}

export function getWebsiteRenderer<T = any>(type?: string | null): (props: Record<string, unknown>) => T {
  const definition = getBlockOrThrow(type)
  if (!definition) {
    throw new Error(`Unknown website block type: ${String(type || 'unknown')}`)
  }

  const websiteRenderer = getRegisteredWebsiteRenderer(definition.key)
  if (websiteRenderer) {
    return websiteRenderer as (props: Record<string, unknown>) => T
  }

  throw new Error(`Missing website renderer for block type: ${String(type || 'unknown')}`)
}

export function getBlockDefaults(type?: string | null): Record<string, any> {
  return { ...(getBlockDefinition(type)?.contract?.defaultProps || {}) }
}

export function getBlockSchema(type?: string | null): BlockContractSchema {
  return getBlockDefinition(type)?.contract?.schema || {}
}

export function normalizeBlockProps(type?: string | null, props?: Record<string, any>) {
  const definition = getBlockOrThrow(type)
  if (!definition) {
    return props || {}
  }

  const normalized = definition.contract?.normalize ? definition.contract.normalize(props) : { ...(props || {}) }
  if (!normalized || typeof normalized !== 'object' || Array.isArray(normalized)) {
    return normalized as Record<string, any>
  }

  const { type: _type, schemaVersion: _schemaVersion, meta: _meta, ...rest } = normalized as Record<string, any>
  return rest
}

export function createBlockViewModel(type?: string | null, props?: Record<string, any>) {
  const definition = getBlockOrThrow(type)
  if (!definition) {
    return props || {}
  }

  if (definition.contract?.createViewModel) {
    return definition.contract.createViewModel(props)
  }

  if (definition.contract?.normalize) {
    return normalizeBlockProps(type, props)
  }

  return { ...(props || {}) }
}
