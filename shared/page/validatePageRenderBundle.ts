import {
  type BlockContractSchema,
  getBlockDefaults,
  getBlockSchema,
  normalizeBlockProps,
  resolveBlockType,
} from '../blocks/registry'
import type {
  ContentIdentifier,
  BasePageRenderBundle,
  PageBanner,
  PageFooter,
  PageHeader,
  PageBlock,
  PageLayout,
  PageNavigationItem,
  PageRecord,
  PageRenderBundle,
  PageRevisionMeta,
  PageSection,
} from './PageRenderBundle'
import { PAGE_RENDER_BUNDLE_SCHEMA_VERSION } from './schemaVersion'
import { validateSeo } from './seo'

type ValidationIssue = {
  path: string
  message: string
  code:
    | 'INVALID_PAGE_RENDER_BUNDLE'
    | 'UNKNOWN_BLOCK'
    | 'INVALID_BLOCK_PROPS'
}

type JsonObject = Record<string, unknown>
type SchemaField = { type?: string }
type SchemaDefinition = Pick<BlockContractSchema, 'fields' | 'properties'>
type ViewStructureSection = BasePageRenderBundle['view']['structure']['sections'][number]
type BundleRecord = Record<string, unknown>

export class PageRenderBundleValidationError extends Error {
  code: ValidationIssue['code']
  traceId: string
  issues: ValidationIssue[]

  constructor(message: string, traceId: string, issues: ValidationIssue[]) {
    super(message)
    this.name = 'PageRenderBundleValidationError'
    this.code = issues[0]?.code || 'INVALID_PAGE_RENDER_BUNDLE'
    this.traceId = traceId
    this.issues = issues
  }
}

function isObject(value: unknown): value is JsonObject {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

function isStringOrNumber(value: unknown): value is string | number {
  return typeof value === 'string' || typeof value === 'number'
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function getTraceId(data: unknown): string {
  if (isObject(data) && isObject(data.view) && isString(data.view.traceId)) {
    return data.view.traceId
  }

  if (isObject(data) && isObject(data.diagnostics) && isString(data.diagnostics.traceId)) {
    return data.diagnostics.traceId
  }

  return 'unknown-trace'
}

function fail(traceId: string, path: string, message: string, code: ValidationIssue['code'] = 'INVALID_PAGE_RENDER_BUNDLE'): never {
  throw new PageRenderBundleValidationError(`Invalid PageRenderBundle: ${message}`, traceId, [{ path, message, code }])
}

function assert(condition: unknown, traceId: string, path: string, message: string, code?: ValidationIssue['code']): asserts condition {
  if (!condition) {
    fail(traceId, path, message, code)
  }
}

function validateIdentifier(value: unknown, traceId: string, path: string, allowNull = false): asserts value is ContentIdentifier | null {
  assert(
    (allowNull && value === null) || isStringOrNumber(value),
    traceId,
    path,
    `${path} must be ${allowNull ? 'null, string, or number' : 'a string or number'}`,
  )
}

function getSchemaDefinition(type: string): SchemaDefinition {
  return getBlockSchema(type) || {}
}

function getAllowedPropKeys(type: string): Set<string> {
  const schema = getSchemaDefinition(type)
  const defaults = getBlockDefaults(type)
  const normalizedDefaults = normalizeBlockProps(type, defaults)
  const keys = new Set<string>()

  ;(schema.fields || []).forEach((field) => {
    if (isObject(field) && isString(field.name) && field.name.trim()) {
      keys.add(field.name)
    }
  })

  Object.keys(schema.properties || {}).forEach((key) => keys.add(key))
  Object.keys(defaults || {}).forEach((key) => keys.add(key))
  if (normalizedDefaults && typeof normalizedDefaults === 'object' && !Array.isArray(normalizedDefaults)) {
    Object.keys(normalizedDefaults).forEach((key) => keys.add(key))
  }
  return keys
}

function validateScalarFromDefault(value: unknown, defaultValue: unknown, traceId: string, path: string) {
  if (typeof defaultValue === 'string') {
    assert(isString(value), traceId, path, `${path} must be a string`, 'INVALID_BLOCK_PROPS')
    return
  }

  if (typeof defaultValue === 'boolean') {
    assert(isBoolean(value), traceId, path, `${path} must be a boolean`, 'INVALID_BLOCK_PROPS')
    return
  }

  if (typeof defaultValue === 'number') {
    assert(isFiniteNumber(value), traceId, path, `${path} must be a number`, 'INVALID_BLOCK_PROPS')
  }
}

function validateShapeFromDefault(value: unknown, defaultValue: unknown, traceId: string, path: string) {
  if (Array.isArray(defaultValue)) {
    assert(Array.isArray(value), traceId, path, `${path} must be an array`, 'INVALID_BLOCK_PROPS')

    if (defaultValue.length > 0) {
      value.forEach((entry, index) => {
        validateShapeFromDefault(entry, defaultValue[0], traceId, `${path}[${index}]`)
      })
    }

    return
  }

  if (isObject(defaultValue)) {
    assert(isObject(value), traceId, path, `${path} must be an object`, 'INVALID_BLOCK_PROPS')

    const allowedKeys = new Set(Object.keys(defaultValue))
    Object.keys(value).forEach((key) => {
      assert(allowedKeys.has(key), traceId, `${path}.${key}`, `${path}.${key} is not allowed`, 'INVALID_BLOCK_PROPS')
    })

    Object.entries(value).forEach(([key, childValue]) => {
      validateShapeFromDefault(childValue, defaultValue[key], traceId, `${path}.${key}`)
    })
    return
  }

  validateScalarFromDefault(value, defaultValue, traceId, path)
}

function validateOptionList(value: unknown, traceId: string, path: string) {
  assert(Array.isArray(value), traceId, path, `${path} must be an array`, 'INVALID_BLOCK_PROPS')

  const allowedOptionKeys = new Set(['value', 'label', 'disabled', 'icon', 'badge', 'group', 'description'])

  value.forEach((option, index) => {
    const optionPath = `${path}[${index}]`
    assert(isObject(option), traceId, optionPath, `${optionPath} must be an object`, 'INVALID_BLOCK_PROPS')

    Object.keys(option).forEach((key) => {
      assert(allowedOptionKeys.has(key), traceId, `${optionPath}.${key}`, `${optionPath}.${key} is not allowed`, 'INVALID_BLOCK_PROPS')
    })

    assert(isStringOrNumber(option.value), traceId, `${optionPath}.value`, `${optionPath}.value must be a string or number`, 'INVALID_BLOCK_PROPS')
    assert(isString(option.label), traceId, `${optionPath}.label`, `${optionPath}.label must be a string`, 'INVALID_BLOCK_PROPS')

    if (option.disabled !== undefined) {
      assert(isBoolean(option.disabled), traceId, `${optionPath}.disabled`, `${optionPath}.disabled must be a boolean`, 'INVALID_BLOCK_PROPS')
    }

    ;['icon', 'badge', 'group', 'description'].forEach((key) => {
      if (option[key] !== undefined) {
        assert(isString(option[key]), traceId, `${optionPath}.${key}`, `${optionPath}.${key} must be a string`, 'INVALID_BLOCK_PROPS')
      }
    })
  })
}

function validateFilterValue(value: unknown, traceId: string, path: string) {
  if (value === null || value === undefined) {
    return
  }

  if (isString(value) || isBoolean(value) || isFiniteNumber(value)) {
    return
  }

  if (Array.isArray(value)) {
    const validArray = value.every((entry) => isString(entry) || isFiniteNumber(entry))
    assert(validArray, traceId, path, `${path} must contain only strings or numbers`, 'INVALID_BLOCK_PROPS')
    return
  }

  assert(false, traceId, path, `${path} must be a string, number, boolean, array, or null`, 'INVALID_BLOCK_PROPS')
}

function validateSchemaValue(
  value: unknown,
  schemaField: SchemaField | undefined,
  defaultValue: unknown,
  traceId: string,
  path: string,
  blockType?: string,
  propName?: string,
) {
  const schemaType = schemaField?.type

  if (schemaType === 'option-list') {
    validateOptionList(value, traceId, path)
    return
  }

  if (blockType === 'filter' && (propName === 'defaultValue' || propName === 'value')) {
    validateFilterValue(value, traceId, path)
    return
  }

  if (defaultValue !== undefined) {
    validateShapeFromDefault(value, defaultValue, traceId, path)
  }

  if (!schemaType) {
    return
  }

  switch (schemaType) {
    case 'toggle':
    case 'boolean':
      assert(isBoolean(value), traceId, path, `${path} must be a boolean`, 'INVALID_BLOCK_PROPS')
      return
    case 'number':
    case 'range':
      assert(isFiniteNumber(value), traceId, path, `${path} must be a number`, 'INVALID_BLOCK_PROPS')
      return
    case 'select':
      assert(
        isString(value) || isStringOrNumber(value) || isBoolean(value),
        traceId,
        path,
        `${path} must be a string, number, or boolean`,
        'INVALID_BLOCK_PROPS',
      )
      return
    case 'list-items':
    case 'image-array':
    case 'slide-array':
    case 'card-array':
    case 'accordion-items':
    case 'carousel-slides':
    case 'grid-cells':
    case 'component-list':
      assert(Array.isArray(value), traceId, path, `${path} must be an array`, 'INVALID_BLOCK_PROPS')
      return
    default:
      assert(isString(value), traceId, path, `${path} must be a string`, 'INVALID_BLOCK_PROPS')
  }
}

function validateBlockProps(type: string, props: unknown, traceId: string, path: string) {
  assert(isObject(props), traceId, path, `${path} must be an object`, 'INVALID_BLOCK_PROPS')
  const schema = getSchemaDefinition(type)
  const defaults = getBlockDefaults(type)
  const allowedPropKeys = getAllowedPropKeys(type)

  Object.keys(props).forEach((key) => {
    assert(allowedPropKeys.has(key), traceId, `${path}.${key}`, `${path}.${key} is not declared in the shared registry`, 'INVALID_BLOCK_PROPS')
  })

  Object.entries(props).forEach(([key, value]) => {
    const schemaField = schema.properties?.[key] || schema.fields?.find((field) => isObject(field) && field.name === key)
    validateSchemaValue(value, schemaField, defaults[key], traceId, `${path}.${key}`, type, key)
  })
}

function validateBlock(block: unknown, traceId: string, path: string) {
  assert(isObject(block), traceId, path, `${path} must be an object`)
  validateIdentifier(block.id, traceId, `${path}.id`)
  assert(isString(block.type) && block.type.trim().length > 0, traceId, `${path}.type`, `${path}.type must be a non-empty string`)
  assert(isObject(block.props), traceId, `${path}.props`, `${path}.props must be an object`, 'INVALID_BLOCK_PROPS')

  const blockType = resolveBlockType(block.type)
  assert(blockType, traceId, `${path}.type`, `Unknown block type: ${String(block.type)}`, 'UNKNOWN_BLOCK')

  validateBlockProps(blockType, block.props, traceId, `${path}.props`)
}

function flattenSectionBlocks(section: PageSection): Array<Pick<PageBlock, 'id' | 'type'>> {
  return section.rows.flatMap((row) =>
    row.columns.flatMap((column) =>
      column.components.map((component) => ({
        id: component.id,
        type: component.type,
      })),
    ),
  )
}

function validateSection(section: unknown, traceId: string, path: string): asserts section is PageSection {
  assert(isObject(section), traceId, path, `${path} must be an object`)
  validateIdentifier(section.id, traceId, `${path}.id`)
  assert(isString(section.name), traceId, `${path}.name`, `${path}.name must be a string`)
  assert(isString(section.type), traceId, `${path}.type`, `${path}.type must be a string`)
  assert(isObject(section.props), traceId, `${path}.props`, `${path}.props must be an object`)
  assert(isObject(section.settings), traceId, `${path}.settings`, `${path}.settings must be an object`)
  assert(Array.isArray(section.blocks), traceId, `${path}.blocks`, `${path}.blocks must be an array`)
  assert(Array.isArray(section.rows), traceId, `${path}.rows`, `${path}.rows must be an array`)
  assert(section.rows.length > 0, traceId, `${path}.rows`, `${path}.rows must contain at least one row`)

  section.blocks.forEach((block: unknown, index: number) => validateBlock(block, traceId, `${path}.blocks[${index}]`))

  section.rows.forEach((row: unknown, rowIndex: number) => {
    assert(isObject(row), traceId, `${path}.rows[${rowIndex}]`, `${path}.rows[${rowIndex}] must be an object`)
    validateIdentifier(row.id, traceId, `${path}.rows[${rowIndex}].id`)
    assert(Array.isArray(row.columns), traceId, `${path}.rows[${rowIndex}].columns`, `${path}.rows[${rowIndex}].columns must be an array`)

    row.columns.forEach((column: unknown, columnIndex: number) => {
      assert(isObject(column), traceId, `${path}.rows[${rowIndex}].columns[${columnIndex}]`, `${path}.rows[${rowIndex}].columns[${columnIndex}] must be an object`)
      validateIdentifier(column.id, traceId, `${path}.rows[${rowIndex}].columns[${columnIndex}].id`)
      assert(
        Array.isArray(column.components),
        traceId,
        `${path}.rows[${rowIndex}].columns[${columnIndex}].components`,
        `${path}.rows[${rowIndex}].columns[${columnIndex}].components must be an array`,
      )

      column.components.forEach((component: unknown, componentIndex: number) =>
        validateBlock(component, traceId, `${path}.rows[${rowIndex}].columns[${columnIndex}].components[${componentIndex}]`),
      )
    })
  })

  const pageSection = section as PageSection
  const flattenedBlocks = flattenSectionBlocks(pageSection)
  assert(
    flattenedBlocks.length === pageSection.blocks.length,
    traceId,
    `${path}.blocks`,
    `${path}.blocks must match the row/column rendering structure`,
  )

  flattenedBlocks.forEach((block, index) => {
    const declared = pageSection.blocks[index]
    assert(
      declared.id === block.id && declared.type === block.type,
      traceId,
      `${path}.blocks[${index}]`,
      `${path}.blocks[${index}] must match the row/column rendering structure`,
    )
  })
}

function validateLayout(layout: unknown, traceId: string): asserts layout is PageLayout {
  assert(isObject(layout), traceId, 'layout', '`layout` must be an object')
  assert(layout.schemaVersion === PAGE_RENDER_BUNDLE_SCHEMA_VERSION, traceId, 'layout.schemaVersion', '`layout.schemaVersion` is invalid')
  assert(isString(layout.id), traceId, 'layout.id', '`layout.id` must be a string')
  assert(isString(layout.name), traceId, 'layout.name', '`layout.name` must be a string')
  assert(Array.isArray(layout.sections), traceId, 'layout.sections', '`layout.sections` must be an array')

  layout.sections.forEach((section: unknown, index: number) => {
    validateSection(section, traceId, `layout.sections[${index}]`)
  })
}

function validatePageRecord(page: unknown, traceId: string): asserts page is PageRecord {
  assert(isObject(page), traceId, 'page', '`page` must be an object')
  validateIdentifier(page.id, traceId, 'page.id', true)
  assert(isString(page.slug) && page.slug.trim().length > 0, traceId, 'page.slug', '`page.slug` must be a non-empty string')
  try {
    validateSeo(page.seo)
  } catch (error) {
    fail(traceId, 'page.seo', error instanceof Error ? error.message : 'Invalid SEO contract')
  }
}

function validateNavigationItems(items: unknown, traceId: string, path: string): asserts items is PageNavigationItem[] {
  assert(Array.isArray(items), traceId, path, `${path} must be an array`)

  items.forEach((item: unknown, index: number) => {
    assert(isObject(item), traceId, `${path}[${index}]`, `${path}[${index}] must be an object`)
    validateIdentifier(item.id, traceId, `${path}[${index}].id`)
    assert(isString(item.href), traceId, `${path}[${index}].href`, `${path}[${index}].href must be a string`)
    assert(isBoolean(item.open_new_tab), traceId, `${path}[${index}].open_new_tab`, `${path}[${index}].open_new_tab must be a boolean`)
    assert(isString(item.label), traceId, `${path}[${index}].label`, `${path}[${index}].label must be a string`)
    validateNavigationItems(item.children, traceId, `${path}[${index}].children`)
  })
}

function validateHeader(header: unknown, traceId: string): asserts header is PageHeader {
  assert(isObject(header), traceId, 'header', '`header` must be an object')
  validateIdentifier(header.id, traceId, 'header.id', true)
  assert(isString(header.slug), traceId, 'header.slug', '`header.slug` must be a string')
  assert(isString(header.name), traceId, 'header.name', '`header.name` must be a string')
  assert(isString(header.logo), traceId, 'header.logo', '`header.logo` must be a string')
  assert(isString(header.logo_dark), traceId, 'header.logo_dark', '`header.logo_dark` must be a string')
  assert(isString(header.cta_label), traceId, 'header.cta_label', '`header.cta_label` must be a string')
  assert(isString(header.cta_link), traceId, 'header.cta_link', '`header.cta_link` must be a string')
  assert(isBoolean(header.is_sticky), traceId, 'header.is_sticky', '`header.is_sticky` must be a boolean')
  assert(isString(header.bg_color), traceId, 'header.bg_color', '`header.bg_color` must be a string')
  assert(isObject(header.settings), traceId, 'header.settings', '`header.settings` must be an object')
  validateNavigationItems(header.navigation_items, traceId, 'header.navigation_items')
}

function validateFooter(footer: unknown, traceId: string): asserts footer is PageFooter {
  assert(isObject(footer), traceId, 'footer', '`footer` must be an object')
  validateIdentifier(footer.id, traceId, 'footer.id', true)
  assert(isString(footer.slug), traceId, 'footer.slug', '`footer.slug` must be a string')
  assert(isString(footer.name), traceId, 'footer.name', '`footer.name` must be a string')
  assert(isString(footer.copyright), traceId, 'footer.copyright', '`footer.copyright` must be a string')
  assert(isString(footer.bg_color), traceId, 'footer.bg_color', '`footer.bg_color` must be a string')
  assert(Array.isArray(footer.columns), traceId, 'footer.columns', '`footer.columns` must be an array')
  assert(Array.isArray(footer.social_links), traceId, 'footer.social_links', '`footer.social_links` must be an array')
  assert(isObject(footer.settings), traceId, 'footer.settings', '`footer.settings` must be an object')
  assert(isString(footer.settings.logo_url), traceId, 'footer.settings.logo_url', '`footer.settings.logo_url` must be a string')
  assert(isString(footer.settings.copyright_text), traceId, 'footer.settings.copyright_text', '`footer.settings.copyright_text` must be a string')
  assert(isBoolean(footer.settings.newsletter_enabled), traceId, 'footer.settings.newsletter_enabled', '`footer.settings.newsletter_enabled` must be a boolean')
  assert(isString(footer.settings.company_address), traceId, 'footer.settings.company_address', '`footer.settings.company_address` must be a string')
  assert(isString(footer.settings.company_email), traceId, 'footer.settings.company_email', '`footer.settings.company_email` must be a string')
  assert(isString(footer.settings.company_phone), traceId, 'footer.settings.company_phone', '`footer.settings.company_phone` must be a string')
  assert(
    footer.settings.social_style === 'text' || footer.settings.social_style === 'icon' || footer.settings.social_style === 'circle',
    traceId,
    'footer.settings.social_style',
    '`footer.settings.social_style` must be `text`, `icon`, or `circle`',
  )

  footer.columns.forEach((column: unknown, index: number) => {
    assert(isObject(column), traceId, `footer.columns[${index}]`, `footer.columns[${index}] must be an object`)
    validateIdentifier(column.id, traceId, `footer.columns[${index}].id`)
    assert(isString(column.heading), traceId, `footer.columns[${index}].heading`, `footer.columns[${index}].heading must be a string`)
    assert(Array.isArray(column.links), traceId, `footer.columns[${index}].links`, `footer.columns[${index}].links must be an array`)

    column.links.forEach((link: unknown, linkIndex: number) => {
      assert(isObject(link), traceId, `footer.columns[${index}].links[${linkIndex}]`, `footer.columns[${index}].links[${linkIndex}] must be an object`)
      validateIdentifier(link.id, traceId, `footer.columns[${index}].links[${linkIndex}].id`)
      assert(
        isString(link.href),
        traceId,
        `footer.columns[${index}].links[${linkIndex}].href`,
        `footer.columns[${index}].links[${linkIndex}].href must be a string`,
      )
      assert(
        isString(link.label),
        traceId,
        `footer.columns[${index}].links[${linkIndex}].label`,
        `footer.columns[${index}].links[${linkIndex}].label must be a string`,
      )
    })
  })

  footer.social_links.forEach((link: unknown, index: number) => {
    assert(isObject(link), traceId, `footer.social_links[${index}]`, `footer.social_links[${index}] must be an object`)
    validateIdentifier(link.id, traceId, `footer.social_links[${index}].id`)
    assert(isString(link.url), traceId, `footer.social_links[${index}].url`, `footer.social_links[${index}].url must be a string`)
    assert(
      isString(link.platform),
      traceId,
      `footer.social_links[${index}].platform`,
      `footer.social_links[${index}].platform must be a string`,
    )
  })
}

function validateBanner(banner: unknown, traceId: string): asserts banner is PageBanner {
  assert(isObject(banner), traceId, 'banner', '`banner` must be an object')
  validateIdentifier(banner.id, traceId, 'banner.id', true)
  assert(isString(banner.slug), traceId, 'banner.slug', '`banner.slug` must be a string')
  assert(isString(banner.name), traceId, 'banner.name', '`banner.name` must be a string')
  assert(isObject(banner.content), traceId, 'banner.content', '`banner.content` must be an object')

  const content = banner.content as Record<string, unknown>
  ;['title', 'subtitle', 'description', 'buttonText', 'buttonLink'].forEach((key) => {
    assert(isString(content[key]), traceId, `banner.content.${key}`, `banner.content.${key} must be a string`)
  })
}

function validateRevisionMeta(meta: unknown, traceId: string, path: string): asserts meta is PageRevisionMeta | null {
  if (meta === null || meta === undefined) {
    return
  }

  assert(isObject(meta), traceId, path, `${path} must be an object`)
  const revisionMeta = meta as Record<string, unknown>
  if (revisionMeta.id !== null && revisionMeta.id !== undefined) {
    validateIdentifier(revisionMeta.id, traceId, `${path}.id`)
  }
}

function validateView(data: BundleRecord, traceId: string, layout: PageLayout) {
  assert(isObject(data.view), traceId, 'view', '`view` must be an object')
  const view = data.view as Record<string, unknown>
  assert(isString(view.traceId) && view.traceId.trim().length > 0, traceId, 'view.traceId', '`view.traceId` must be a non-empty string')
  assert(Array.isArray(view.content), traceId, 'view.content', '`view.content` must be an array')
  assert(isObject(view.structure), traceId, 'view.structure', '`view.structure` must be an object')
  const contentSections = view.content as PageSection[]
  const structure = view.structure as Record<string, unknown>
  assert(Array.isArray(structure.sections), traceId, 'view.structure.sections', '`view.structure.sections` must be an array')
  const structureSections = structure.sections as Array<ViewStructureSection & BundleRecord>

  contentSections.forEach((section: unknown, index: number) => {
    validateSection(section, traceId, `view.content[${index}]`)
  })

  const layoutSections = layout.sections
  assert(
    contentSections.length === layoutSections.length,
    traceId,
    'view.content',
    '`view.content` must match `layout.sections`',
  )

  structureSections.forEach((section: unknown, index: number) => {
    assert(isObject(section), traceId, `view.structure.sections[${index}]`, `view.structure.sections[${index}] must be an object`)
    validateIdentifier(section.id, traceId, `view.structure.sections[${index}].id`)
    assert(Array.isArray(section.blockIds), traceId, `view.structure.sections[${index}].blockIds`, `view.structure.sections[${index}].blockIds must be an array`)
    assert(Array.isArray(section.blockTypes), traceId, `view.structure.sections[${index}].blockTypes`, `view.structure.sections[${index}].blockTypes must be an array`)
  })

  layoutSections.forEach((layoutSection, index) => {
    const contentSection = contentSections[index]
    const structureSection = structureSections[index]
    assert(contentSection.id === layoutSection.id, traceId, `view.content[${index}].id`, '`view.content` must preserve section ids from layout')
    assert(structureSection.id === layoutSection.id, traceId, `view.structure.sections[${index}].id`, '`view.structure` must preserve section ids from layout')

    const expectedBlockIds = layoutSection.blocks.map((block) => block.id)
    const expectedBlockTypes = layoutSection.blocks.map((block) => block.type)
    assert(
      JSON.stringify(structureSection.blockIds) === JSON.stringify(expectedBlockIds),
      traceId,
      `view.structure.sections[${index}].blockIds`,
      '`view.structure` block ids must match layout',
    )
    assert(
      JSON.stringify(structureSection.blockTypes) === JSON.stringify(expectedBlockTypes),
      traceId,
      `view.structure.sections[${index}].blockTypes`,
      '`view.structure` block types must match layout',
    )
  })
}

export function validatePageRenderBundle(data: unknown): PageRenderBundle {
  const traceId = getTraceId(data)
  assert(isObject(data), traceId, 'bundle', 'bundle must be an object')
  assert(data.success === true, traceId, 'success', '`success` must be `true`')
  assert(data.schemaVersion === PAGE_RENDER_BUNDLE_SCHEMA_VERSION, traceId, 'schemaVersion', '`schemaVersion` is invalid')
  assert(data.mode === 'public' || data.mode === 'preview', traceId, 'mode', '`mode` must be `public` or `preview`')

  validatePageRecord(data.page, traceId)
  validateLayout(data.layout, traceId)
  assert(Array.isArray(data.sections), traceId, 'sections', '`sections` must be an array')
  assert(
    JSON.stringify(data.sections.map((section: PageSection) => section.id)) === JSON.stringify(data.layout.sections.map((section: PageSection) => section.id)),
    traceId,
    'sections',
    '`sections` must mirror `layout.sections`',
  )

  validateView(data, traceId, data.layout)

  if ('header' in data && data.header !== null && data.header !== undefined) {
    validateHeader(data.header, traceId)
  }

  if ('footer' in data && data.footer !== null && data.footer !== undefined) {
    validateFooter(data.footer, traceId)
  }

  if ('banner' in data && data.banner !== null && data.banner !== undefined) {
    validateBanner(data.banner, traceId)
  }

  if (data.mode === 'preview') {
    validateRevisionMeta(data.revision, traceId, 'revision')
    validateRevisionMeta(data.draft_revision, traceId, 'draft_revision')
    validateRevisionMeta(data.published_revision, traceId, 'published_revision')
    assert(typeof data.has_published_revision === 'boolean', traceId, 'has_published_revision', '`has_published_revision` must be a boolean')
  }

  if ('diagnostics' in data && data.diagnostics !== undefined && data.diagnostics !== null) {
    assert(isObject(data.diagnostics), traceId, 'diagnostics', '`diagnostics` must be an object when present')
    assert(isString(data.diagnostics.traceId), traceId, 'diagnostics.traceId', '`diagnostics.traceId` must be a string')
    assert(Array.isArray(data.diagnostics.unknownBlocks), traceId, 'diagnostics.unknownBlocks', '`diagnostics.unknownBlocks` must be an array')
  }

  return data as PageRenderBundle
}

export function isPageRenderBundle(data: unknown): data is PageRenderBundle {
  try {
    validatePageRenderBundle(data)
    return true
  } catch {
    return false
  }
}
