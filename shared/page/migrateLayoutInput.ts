import { resolveBlockType } from '../blocks/registry'
import { getSectionSchema, validateSectionProps } from './sectionSchemas'
import { PageLayoutValidationError } from './validateCanonicalLayout'

type MigrationIssue = {
  path: string
  message: string
  code: 'INVALID_LAYOUT'
}

type AutoMigrationLog = {
  type: 'auto_migration'
  migration: string
  targetType: 'layout' | 'section' | 'block'
  blockOrSectionType?: string
  path: string
  before: string
  after: string
  traceId: string
}

type MigrationOptions = {
  pageId?: string | number | null
  slug?: string | null
}

export type MigrationResult<T = unknown> = {
  traceId: string
  value: T
  migrations: AutoMigrationLog[]
}

function createTraceId() {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  return `migration-trace-${Math.random().toString(36).slice(2, 10)}`
}

function isObject(value: unknown): value is Record<string, any> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function cloneValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item)) as T
  }

  if (isObject(value)) {
    const output: Record<string, unknown> = {}
    Object.entries(value).forEach(([key, nestedValue]) => {
      output[key] = cloneValue(nestedValue)
    })
    return output as T
  }

  return value
}

function summarize(value: unknown) {
  const text = JSON.stringify(value)
  if (!text) {
    return String(value)
  }

  return text.length > 140 ? `${text.slice(0, 137)}...` : text
}

function logAutoMigration(entry: AutoMigrationLog) {
  console.info('auto_migration', entry)
}

function fail(traceId: string, path: string, message: string): never {
  throw new PageLayoutValidationError(`Invalid layout: ${message}`, traceId, [
    {
      path,
      message,
      code: 'INVALID_LAYOUT',
    },
  ])
}

function normalizeLegacySectionType(type: string) {
  const normalized = String(type || '').trim()
  if (normalized === 'home_banner') return 'hero'
  if (normalized === 'choose') return 'features'
  return normalized
}

function migrateBlock(
  block: unknown,
  traceId: string,
  path: string,
  migrations: AutoMigrationLog[],
) {
  if (!isObject(block)) {
    fail(traceId, path, `${path} must be an object`)
  }

  const migrated = cloneValue(block)
  const rawType = String(migrated.type || '').trim()
  if (!rawType) {
    fail(traceId, `${path}.type`, `${path}.type must be a non-empty string`)
  }

  const resolvedType = resolveBlockType(rawType)
  if (!resolvedType) {
    fail(traceId, `${path}.type`, `Unknown block type: ${rawType}`)
  }

  if (resolvedType !== rawType) {
    const entry = {
      type: 'auto_migration' as const,
      migration: 'block_type_alias',
      targetType: 'block' as const,
      blockOrSectionType: rawType,
      path: `${path}.type`,
      before: rawType,
      after: resolvedType,
      traceId,
    }
    migrations.push(entry)
    logAutoMigration(entry)
    migrated.type = resolvedType
  }

  if (migrated.props === undefined || migrated.props === null) {
    const entry = {
      type: 'auto_migration' as const,
      migration: 'missing_block_props_to_empty_object',
      targetType: 'block' as const,
      blockOrSectionType: resolvedType,
      path: `${path}.props`,
      before: summarize(migrated.props),
      after: '{}',
      traceId,
    }
    migrations.push(entry)
    logAutoMigration(entry)
    migrated.props = {}
  }

  if (!isObject(migrated.props)) {
    fail(traceId, `${path}.props`, `${path}.props must be an object`)
  }

  if (resolvedType === 'image') {
    const hasLegacyImage = typeof migrated.props.image === 'string' && migrated.props.image.trim().length > 0
    const hasSrc = typeof migrated.props.src === 'string' && migrated.props.src.trim().length > 0

    if (hasLegacyImage && hasSrc && String(migrated.props.image).trim() !== String(migrated.props.src).trim()) {
      fail(traceId, `${path}.props`, `${path}.props.image and ${path}.props.src conflict`)
    }

    if (hasLegacyImage && !hasSrc) {
      const before = migrated.props.image
      migrated.props.src = migrated.props.image
      delete migrated.props.image
      const entry = {
        type: 'auto_migration' as const,
        migration: 'image_prop_rename',
        targetType: 'block' as const,
        blockOrSectionType: resolvedType,
        path: `${path}.props`,
        before: summarize({ image: before }),
        after: summarize({ src: before }),
        traceId,
      }
      migrations.push(entry)
      logAutoMigration(entry)
    }
  }

  if (resolvedType === 'advancedheading') {
    if (migrated.props && 'textAlign' in migrated.props) {
      const before = migrated.props.textAlign
      if (!isObject(migrated.props.style)) {
        migrated.props.style = {}
      }
      if (!migrated.props.style.alignment && before) {
        migrated.props.style.alignment = before
      }
      delete migrated.props.textAlign
      const entry = {
        type: 'auto_migration' as const,
        migration: 'heading_prop_text_align_to_style_alignment',
        targetType: 'block' as const,
        blockOrSectionType: resolvedType,
        path: `${path}.props`,
        before: summarize({ textAlign: before }),
        after: summarize({ style: { alignment: migrated.props.style?.alignment } }),
        traceId,
      }
      migrations.push(entry)
      logAutoMigration(entry)
    }
  }

  if (resolvedType === 'button') {
    if (migrated.props && (!isObject(migrated.props.content) || !isObject(migrated.props.style) || !migrated.props.version)) {
      const isLegacyUnversioned = !migrated.props.version
      const legacyVariant = migrated.props.variant || 'primary'
      const legacySize = migrated.props.size || 'medium'

      const isDefaultBg =
        typeof migrated.props.backgroundColor === 'string' &&
        migrated.props.backgroundColor.trim().toLowerCase() === '#7c6dfa'
      const shouldStripBg = isLegacyUnversioned && legacyVariant !== 'primary' && isDefaultBg

      const isDefaultFontSize =
        typeof migrated.props.fontSize === 'string' &&
        migrated.props.fontSize.trim() === '16px'
      const shouldStripFontSize = isLegacyUnversioned && legacySize !== 'medium' && isDefaultFontSize

      const isDefaultPaddingTop =
        typeof migrated.props.paddingTop === 'string' &&
        migrated.props.paddingTop.trim() === '14px'
      const shouldStripPadding = isLegacyUnversioned && legacySize !== 'medium' && isDefaultPaddingTop

      const backgroundColor = shouldStripBg ? undefined : migrated.props.backgroundColor
      const fontSize = shouldStripFontSize ? undefined : migrated.props.fontSize
      const paddingTop = shouldStripPadding ? undefined : migrated.props.paddingTop
      const paddingRight = shouldStripPadding ? undefined : migrated.props.paddingRight
      const paddingBottom = shouldStripPadding ? undefined : migrated.props.paddingBottom
      const paddingLeft = shouldStripPadding ? undefined : migrated.props.paddingLeft
      const padding = shouldStripPadding ? undefined : migrated.props.padding

      const content = {
        text: migrated.props.text ?? migrated.props.label,
        link: migrated.props.link ?? migrated.props.linkUrl ?? migrated.props.url ?? migrated.props.href,
        openInNewTab: migrated.props.openInNewTab,
        loadingText: migrated.props.loadingText,
        ariaLabel: migrated.props.ariaLabel,
      }

      const style = {
        variant: migrated.props.variant,
        size: migrated.props.size,
        primaryColor: migrated.props.primaryColor,
        backgroundColor,
        textColor: migrated.props.textColor,
        hoverColor: migrated.props.hoverColor,
        activeColor: migrated.props.activeColor,
        borderColor: migrated.props.borderColor,
        useGradient: migrated.props.useGradient,
        gradientColors: migrated.props.gradientColors,
        gradientDirection: migrated.props.gradientDirection,
        gradientType: migrated.props.gradientType,
        borderRadius: migrated.props.borderRadius,
        borderWidth: migrated.props.borderWidth,
        shadow: migrated.props.shadow,
        alignment: migrated.props.alignment ?? migrated.props.textAlign,
        textAlign: migrated.props.textAlign ?? migrated.props.alignment,
        fullWidth: migrated.props.fullWidth,
        width: migrated.props.width,
        margin: migrated.props.margin,
        padding,
        marginTop: migrated.props.marginTop,
        marginRight: migrated.props.marginRight,
        marginBottom: migrated.props.marginBottom,
        marginLeft: migrated.props.marginLeft,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
        fontFamily: migrated.props.fontFamily,
        fontSize,
        fontWeight: migrated.props.fontWeight,
        letterSpacing: migrated.props.letterSpacing,
        textTransform: migrated.props.textTransform,
        lineHeight: migrated.props.lineHeight,
        icon: migrated.props.icon,
        iconPosition: migrated.props.iconPosition,
        iconSize: migrated.props.iconSize,
        iconSpacing: migrated.props.iconSpacing,
        disabled: migrated.props.disabled,
        loading: migrated.props.loading,
        hoverEffect: migrated.props.hoverEffect,
        hoverScale: migrated.props.hoverScale,
        hoverShadow: migrated.props.hoverShadow,
        animationType: migrated.props.animationType,
        animationDuration: migrated.props.animationDuration,
        className: migrated.props.className ?? migrated.props.customClass,
        customClass: migrated.props.customClass ?? migrated.props.className,
        customId: migrated.props.customId,
        onClick: migrated.props.onClick,
        dataTracking: migrated.props.dataTracking,
      }

      const responsive = {
        desktop: isObject(migrated.props.responsive?.desktop) ? migrated.props.responsive.desktop : {},
        tablet: isObject(migrated.props.responsive?.tablet) ? migrated.props.responsive.tablet : {},
        mobile: {
          size: migrated.props.mobileSize ?? migrated.props.responsive?.mobile?.size,
          fullWidth: migrated.props.mobileFullWidth ?? migrated.props.responsive?.mobile?.fullWidth,
          hidden: migrated.props.hideOnMobile ?? migrated.props.responsive?.mobile?.hidden,
        },
      }

      if (shouldStripBg) {
        delete migrated.props.backgroundColor
      }
      if (shouldStripFontSize) {
        delete migrated.props.fontSize
      }
      if (shouldStripPadding) {
        delete migrated.props.paddingTop
        delete migrated.props.paddingRight
        delete migrated.props.paddingBottom
        delete migrated.props.paddingLeft
        delete migrated.props.padding
      }

      const before = summarize({
        text: migrated.props.text,
        variant: migrated.props.variant,
      })

      migrated.props.version = 1
      migrated.props.content = {
        ...(isObject(migrated.props.content) ? migrated.props.content : {}),
        ...content,
      }
      migrated.props.style = {
        ...(isObject(migrated.props.style) ? migrated.props.style : {}),
        ...style,
      }
      migrated.props.responsive = responsive

      const entry = {
        type: 'auto_migration' as const,
        migration: 'button_legacy_to_canonical',
        targetType: 'block' as const,
        blockOrSectionType: resolvedType,
        path: `${path}.props`,
        before,
        after: summarize({
          version: 1,
          content: migrated.props.content,
          style: migrated.props.style,
        }),
        traceId,
      }
      migrations.push(entry)
      logAutoMigration(entry)
    }
  }

  return migrated
}

function migrateSection(
  section: unknown,
  traceId: string,
  path: string,
  migrations: AutoMigrationLog[],
) {
  if (!isObject(section)) {
    fail(traceId, path, `${path} must be an object`)
  }

  const migrated = cloneValue(section)
  const rawType = String(migrated.type || 'custom').trim()
  const nextType = normalizeLegacySectionType(rawType || 'custom')

  if (rawType && nextType !== rawType) {
    const entry = {
      type: 'auto_migration' as const,
      migration: 'section_type_alias',
      targetType: 'section' as const,
      blockOrSectionType: rawType,
      path: `${path}.type`,
      before: rawType,
      after: nextType,
      traceId,
    }
    migrations.push(entry)
    logAutoMigration(entry)
    migrated.type = nextType
  }

  if (migrated.props === undefined && isObject(migrated.content)) {
    const entry = {
      type: 'auto_migration' as const,
      migration: 'section_content_to_props',
      targetType: 'section' as const,
      blockOrSectionType: nextType,
      path: `${path}.props`,
      before: summarize(migrated.content),
      after: summarize(migrated.content),
      traceId,
    }
    migrations.push(entry)
    logAutoMigration(entry)
    migrated.props = cloneValue(migrated.content)
  }

  if (migrated.settings === undefined || migrated.settings === null) {
    migrated.settings = {}
  }

  if (!isObject(migrated.settings)) {
    fail(traceId, `${path}.settings`, `${path}.settings must be an object`)
  }

  const hasRows = Array.isArray(migrated.rows)
  const hasContainerRows = Array.isArray(migrated.container?.rows)
  const hasLegacyColumns = Array.isArray(migrated.columns)

  if (!hasRows && !hasContainerRows && !hasLegacyColumns) {
    fail(
      traceId,
      path,
      `${path} must provide rows, container.rows, or legacy columns so layout structure is explicit`,
    )
  }

  const stickyMappings = [
    ['stickyEnabled', 'sticky_enabled'],
    ['stickyColumnIndex', 'sticky_column_index'],
    ['stickyPosition', 'sticky_position'],
    ['stickyOffset', 'sticky_offset'],
  ] as const

  stickyMappings.forEach(([legacyKey, settingsKey]) => {
    if (migrated[legacyKey] === undefined) {
      return
    }

    if (
      migrated.settings[settingsKey] !== undefined &&
      JSON.stringify(migrated.settings[settingsKey]) !== JSON.stringify(migrated[legacyKey])
    ) {
      fail(traceId, `${path}.${legacyKey}`, `${path}.${legacyKey} conflicts with ${path}.settings.${settingsKey}`)
    }

    if (migrated.settings[settingsKey] === undefined) {
      const before = migrated[legacyKey]
      migrated.settings[settingsKey] = before
      const entry = {
        type: 'auto_migration' as const,
        migration: 'section_sticky_field_move',
        targetType: 'section' as const,
        blockOrSectionType: nextType,
        path: `${path}.${legacyKey}`,
        before: summarize({ [legacyKey]: before }),
        after: summarize({ [`settings.${settingsKey}`]: before }),
        traceId,
      }
      migrations.push(entry)
      logAutoMigration(entry)
    }

    delete migrated[legacyKey]
  })

  if (!Array.isArray(migrated.rows) && !Array.isArray(migrated.container?.rows) && Array.isArray(migrated.columns)) {
    const migratedRow = {
      id: `migrated-row-${String(migrated.id || 'section')}`,
      columns: cloneValue(migrated.columns),
    }
    migrated.rows = [migratedRow]
    delete migrated.columns
    const entry = {
      type: 'auto_migration' as const,
      migration: 'section_columns_to_rows',
      targetType: 'section' as const,
      blockOrSectionType: nextType,
      path,
      before: summarize({ columns: `count:${migratedRow.columns.length}` }),
      after: summarize({ rows: 1, columns: `count:${migratedRow.columns.length}` }),
      traceId,
    }
    migrations.push(entry)
    logAutoMigration(entry)
  }

  if (Array.isArray(migrated.rows)) {
    migrated.rows = migrated.rows.map((row: unknown, rowIndex: number) => {
      if (!isObject(row)) {
        fail(traceId, `${path}.rows[${rowIndex}]`, `${path}.rows[${rowIndex}] must be an object`)
      }

      if (!Array.isArray(row.columns)) {
        fail(traceId, `${path}.rows[${rowIndex}].columns`, `${path}.rows[${rowIndex}].columns must be an array`)
      }

      return {
        ...row,
        columns: row.columns.map((column: unknown, columnIndex: number) => {
          if (!isObject(column)) {
            fail(traceId, `${path}.rows[${rowIndex}].columns[${columnIndex}]`, `${path}.rows[${rowIndex}].columns[${columnIndex}] must be an object`)
          }

          if (!Array.isArray(column.components)) {
            fail(
              traceId,
              `${path}.rows[${rowIndex}].columns[${columnIndex}].components`,
              `${path}.rows[${rowIndex}].columns[${columnIndex}].components must be an array`,
            )
          }

          return {
            ...column,
            components: column.components.map((block: unknown, blockIndex: number) =>
              migrateBlock(block, traceId, `${path}.rows[${rowIndex}].columns[${columnIndex}].components[${blockIndex}]`, migrations),
            ),
          }
        }),
      }
    })
  }

  if (Array.isArray(migrated.container?.rows)) {
    migrated.container = {
      ...migrated.container,
      rows: migrated.container.rows.map((row: unknown, rowIndex: number) => {
        if (!isObject(row)) {
          fail(traceId, `${path}.container.rows[${rowIndex}]`, `${path}.container.rows[${rowIndex}] must be an object`)
        }

        if (!Array.isArray(row.columns)) {
          fail(traceId, `${path}.container.rows[${rowIndex}].columns`, `${path}.container.rows[${rowIndex}].columns must be an array`)
        }

        return {
          ...row,
          columns: row.columns.map((column: unknown, columnIndex: number) => {
            if (!isObject(column)) {
              fail(
                traceId,
                `${path}.container.rows[${rowIndex}].columns[${columnIndex}]`,
                `${path}.container.rows[${rowIndex}].columns[${columnIndex}] must be an object`,
              )
            }

            if (!Array.isArray(column.components)) {
              fail(
                traceId,
                `${path}.container.rows[${rowIndex}].columns[${columnIndex}].components`,
                `${path}.container.rows[${rowIndex}].columns[${columnIndex}].components must be an array`,
              )
            }

            return {
              ...column,
              components: column.components.map((block: unknown, blockIndex: number) =>
                migrateBlock(
                  block,
                  traceId,
                  `${path}.container.rows[${rowIndex}].columns[${columnIndex}].components[${blockIndex}]`,
                  migrations,
                ),
              ),
            }
          }),
        }
      }),
    }
  }

  if (getSectionSchema(nextType)) {
    const validation = validateSectionProps(nextType, migrated.props)
    if (!validation.valid) {
      fail(traceId, `${path}.props`, `${path}.props failed schema validation: ${validation.errors.join('; ')}`)
    }
  }

  return migrated
}

export function migrateLayoutInput<T = unknown>(
  layout: unknown,
  _options: MigrationOptions = {},
): MigrationResult<T> {
  const traceId = createTraceId()

  if (!isObject(layout)) {
    fail(traceId, 'layout', 'layout must be an object')
  }

  if (layout.sections !== undefined && !Array.isArray(layout.sections)) {
    fail(traceId, 'layout.sections', 'layout.sections must be an array when present')
  }

  const migrated = cloneValue(layout)
  const migrations: AutoMigrationLog[] = []
  const sections = Array.isArray(migrated.sections) ? migrated.sections : []

  migrated.sections = sections.map((section: unknown, index: number) =>
    migrateSection(section, traceId, `layout.sections[${index}]`, migrations),
  )

  return {
    traceId,
    value: migrated as T,
    migrations,
  }
}
