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

    if (!isObject(migrated.props.content) || !isObject(migrated.props.style) || !migrated.props.version) {
      const isLegacyUnversioned = !migrated.props.version
      const legacyShape = migrated.props.shape || 'default'

      const isDefaultBorderRadius =
        typeof migrated.props.borderRadius === 'string' &&
        migrated.props.borderRadius.trim() === '0px'
      const shouldStripBorderRadius =
        isLegacyUnversioned && (legacyShape === 'circle' || legacyShape === 'rounded') && isDefaultBorderRadius

      const isDefaultPadding =
        typeof migrated.props.padding === 'string' &&
        migrated.props.padding.trim() === '0px'
      const shouldStripPadding = isLegacyUnversioned && isDefaultPadding

      const isDefaultOverlay =
        !migrated.props.showOverlay && !migrated.props.overlayText

      const borderRadius = shouldStripBorderRadius ? undefined : migrated.props.borderRadius
      const padding = shouldStripPadding ? undefined : migrated.props.padding
      const overlayColor = (isLegacyUnversioned && isDefaultOverlay) ? undefined : migrated.props.overlayColor
      const overlayOpacity = (isLegacyUnversioned && isDefaultOverlay) ? undefined : migrated.props.overlayOpacity

      const content = {
        src: migrated.props.src ?? migrated.props.image ?? migrated.props.url ?? migrated.props.imageUrl,
        alt: migrated.props.alt ?? 'Image',
        linkUrl: migrated.props.linkUrl ?? migrated.props.link ?? migrated.props.href,
        openInNewTab: migrated.props.openInNewTab,
        caption: migrated.props.caption,
        captionPosition: migrated.props.captionPosition,
        captionAlignment: migrated.props.captionAlignment,
      }

      const style = {
        width: migrated.props.width,
        height: migrated.props.height,
        maxWidth: migrated.props.maxWidth,
        maxHeight: migrated.props.maxHeight,
        alignment: migrated.props.alignment ?? migrated.props.textAlign ?? migrated.props.align,
        objectFit: migrated.props.objectFit,
        objectPosition: migrated.props.objectPosition,
        borderRadius,
        shape: migrated.props.shape,
        customShape: migrated.props.customShape,
        showGradientBorder: migrated.props.showGradientBorder,
        gradientBorderColors: migrated.props.gradientBorderColors,
        gradientBorderDirection: migrated.props.gradientBorderDirection,
        gradientBorderWidth: migrated.props.gradientBorderWidth,
        gradientBorderType: migrated.props.gradientBorderType,
        shadow: migrated.props.shadow,
        border: migrated.props.border,
        margin: migrated.props.margin,
        padding,
        filter: migrated.props.filter,
        imageZoom: migrated.props.imageZoom,
        componentPositionX: migrated.props.componentPositionX,
        componentPositionY: migrated.props.componentPositionY,
        showOverlay: migrated.props.showOverlay,
        overlayColor,
        overlayOpacity,
        overlayText: migrated.props.overlayText,
        hoverEffect: migrated.props.hoverEffect,
        hoverZoom: migrated.props.hoverZoom,
        hoverBrightness: migrated.props.hoverBrightness,
        hoverDuration: migrated.props.hoverDuration,
        lazyLoad: migrated.props.lazyLoad,
        showLightbox: migrated.props.showLightbox,
        className: migrated.props.className,
        customId: migrated.props.customId,
      }

      const beforeProps = { ...migrated.props }
      migrated.props = {
        ...migrated.props,
        version: 1,
        content,
        style,
        responsive: migrated.props.responsive ?? {},
      }

      const entry = {
        type: 'auto_migration' as const,
        migration: 'image_legacy_to_canonical',
        targetType: 'block' as const,
        blockOrSectionType: resolvedType,
        path: `${path}.props`,
        before: summarize(beforeProps),
        after: summarize(migrated.props),
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

    if (migrated.props && (!isObject(migrated.props.style) || !migrated.props.version)) {
      const beforeProps = { ...migrated.props }
      const content = {
        text: migrated.props.content?.text ?? migrated.props.text,
        level: migrated.props.content?.level ?? migrated.props.level,
        highlightText: migrated.props.content?.highlightText ?? migrated.props.highlight?.text ?? migrated.props.highlightText,
        highlightColor: migrated.props.content?.highlightColor ?? migrated.props.highlight?.color ?? migrated.props.highlightColor,
        seoEnabled: migrated.props.content?.seoEnabled ?? migrated.props.seo?.enabled ?? migrated.props.enableSeoChecks,
        seoMaxLength: migrated.props.content?.seoMaxLength ?? migrated.props.seo?.maxLength ?? migrated.props.seoMaxLength,
      }
      const style = {
        usePresetStyles: migrated.props.style?.usePresetStyles ?? migrated.props.usePresetStyles,
        fontFamily: migrated.props.style?.fontFamily ?? migrated.props.fontFamily,
        fontSize: migrated.props.style?.fontSize ?? migrated.props.fontSize,
        fontWeight: migrated.props.style?.fontWeight ?? migrated.props.fontWeight,
        lineHeight: migrated.props.style?.lineHeight ?? migrated.props.lineHeight,
        letterSpacing: migrated.props.style?.letterSpacing ?? migrated.props.letterSpacing,
        textTransform: migrated.props.style?.textTransform ?? migrated.props.textTransform,
        textDecoration: migrated.props.style?.textDecoration ?? migrated.props.textDecoration,
        fontStyle: migrated.props.style?.fontStyle ?? migrated.props.fontStyle,
        color: migrated.props.style?.color ?? migrated.props.color,
        hoverColor: migrated.props.style?.hoverColor ?? migrated.props.hoverColor,
        alignment: migrated.props.style?.alignment ?? migrated.props.alignment ?? migrated.props.textAlign,
        maxWidth: migrated.props.style?.maxWidth ?? migrated.props.maxWidth,
        margin: migrated.props.style?.margin ?? migrated.props.margin,
        padding: migrated.props.style?.padding ?? migrated.props.padding,
        className: migrated.props.style?.className ?? migrated.props.aria?.className ?? migrated.props.className,
        customId: migrated.props.style?.customId ?? migrated.props.aria?.customId ?? migrated.props.customId,
        htmlTag: migrated.props.style?.htmlTag ?? migrated.props.aria?.htmlTag ?? migrated.props.htmlTag,
        ariaLevel: migrated.props.style?.ariaLevel ?? migrated.props.aria?.ariaLevel ?? migrated.props.ariaLevel,
        ariaLabel: migrated.props.style?.ariaLabel ?? migrated.props.aria?.ariaLabel ?? migrated.props.ariaLabel,
        role: migrated.props.style?.role ?? migrated.props.aria?.role ?? migrated.props.role,
        visible: migrated.props.style?.visible ?? migrated.props.aria?.visible ?? migrated.props.visible,
      }
      const responsive = {
        fontSizeMobile: migrated.props.responsive?.fontSizeMobile ?? migrated.props.style?.fontSizeMobile ?? migrated.props.fontSizeMobile,
        fontSizeTablet: migrated.props.responsive?.fontSizeTablet ?? migrated.props.style?.fontSizeTablet ?? migrated.props.fontSizeTablet,
        textAlignMobile: migrated.props.responsive?.textAlignMobile ?? migrated.props.style?.textAlignMobile ?? migrated.props.textAlignMobile,
        textAlignTablet: migrated.props.responsive?.textAlignTablet ?? migrated.props.style?.textAlignTablet ?? migrated.props.textAlignTablet,
        ...(isObject(migrated.props.responsive) ? migrated.props.responsive : {}),
      }
      migrated.props = {
        ...migrated.props,
        version: 1,
        content,
        style,
        responsive,
      }
      const entry = {
        type: 'auto_migration' as const,
        migration: 'advancedheading_legacy_to_canonical',
        targetType: 'block' as const,
        blockOrSectionType: resolvedType,
        path: `${path}.props`,
        before: summarize(beforeProps),
        after: summarize(migrated.props),
        traceId,
      }
      migrations.push(entry)
      logAutoMigration(entry)
    }
  }

  if (resolvedType === 'advancedparagraph') {
    if (migrated.props && (!isObject(migrated.props.style) || !migrated.props.version)) {
      const beforeProps = { ...migrated.props }
      const content = {
        text: migrated.props.content?.text ?? (typeof migrated.props.content === 'string' ? migrated.props.content : undefined) ?? migrated.props.text ?? migrated.props.html,
        enableRichText: migrated.props.content?.enableRichText ?? migrated.props.aria?.enableRichText ?? migrated.props.enableRichText,
        allowedFormats: migrated.props.content?.allowedFormats ?? migrated.props.aria?.allowedFormats ?? migrated.props.allowedFormats,
      }
      const style = {
        color: migrated.props.style?.color ?? migrated.props.color ?? migrated.props.textColor ?? migrated.props.fontColor,
        fontSize: migrated.props.style?.fontSize ?? migrated.props.fontSize,
        fontWeight: migrated.props.style?.fontWeight ?? migrated.props.fontWeight,
        fontFamily: migrated.props.style?.fontFamily ?? migrated.props.fontFamily,
        lineHeight: migrated.props.style?.lineHeight ?? migrated.props.lineHeight,
        letterSpacing: migrated.props.style?.letterSpacing ?? migrated.props.letterSpacing,
        maxWidth: migrated.props.style?.maxWidth ?? migrated.props.maxWidth,
        backgroundColor: migrated.props.style?.backgroundColor ?? migrated.props.backgroundColor,
        margin: migrated.props.style?.margin ?? migrated.props.margin,
        padding: migrated.props.style?.padding ?? migrated.props.padding,
        width: migrated.props.style?.width ?? migrated.props.width,
        minHeight: migrated.props.style?.minHeight ?? migrated.props.minHeight,
        display: migrated.props.style?.display ?? migrated.props.display,
        border: migrated.props.style?.border ?? migrated.props.border,
        borderRadius: migrated.props.style?.borderRadius ?? migrated.props.borderRadius,
        borderColor: migrated.props.style?.borderColor ?? migrated.props.borderColor,
        textShadow: migrated.props.style?.textShadow ?? migrated.props.textShadow,
        boxShadow: migrated.props.style?.boxShadow ?? migrated.props.boxShadow,
        opacity: migrated.props.style?.opacity ?? migrated.props.opacity,
        textTransform: migrated.props.style?.textTransform ?? migrated.props.textTransform,
        textDecoration: migrated.props.style?.textDecoration ?? migrated.props.textDecoration,
        fontStyle: migrated.props.style?.fontStyle ?? migrated.props.fontStyle,
        transition: migrated.props.style?.transition ?? migrated.props.transition,
        alignment: migrated.props.style?.alignment ?? migrated.props.layout?.alignment ?? migrated.props.alignment ?? migrated.props.textAlign ?? migrated.props.align,
        hoverEffect: migrated.props.style?.hoverEffect ?? migrated.props.interaction?.hover?.effect ?? migrated.props.hoverEffect,
        hoverColor: migrated.props.style?.hoverColor ?? migrated.props.interaction?.hover?.color ?? migrated.props.hoverColor ?? migrated.props.hoverTextColor,
        hoverBackgroundColor: migrated.props.style?.hoverBackgroundColor ?? migrated.props.interaction?.hover?.backgroundColor ?? migrated.props.hoverBackgroundColor,
        className: migrated.props.style?.className ?? migrated.props.aria?.className ?? migrated.props.className,
        customId: migrated.props.style?.customId ?? migrated.props.aria?.customId ?? migrated.props.customId,
        selectable: migrated.props.style?.selectable ?? migrated.props.aria?.selectable ?? migrated.props.selectable,
        editable: migrated.props.style?.editable ?? migrated.props.aria?.editable ?? migrated.props.editable,
        truncate: migrated.props.style?.truncate ?? migrated.props.aria?.truncate ?? migrated.props.truncate,
        maxLines: migrated.props.style?.maxLines ?? migrated.props.aria?.maxLines ?? migrated.props.maxLines,
        visible: migrated.props.style?.visible ?? migrated.props.aria?.visible ?? migrated.props.visible,
        ariaLabel: migrated.props.style?.ariaLabel ?? migrated.props.aria?.ariaLabel ?? migrated.props.ariaLabel,
        role: migrated.props.style?.role ?? migrated.props.aria?.role ?? migrated.props.role,
        tabIndex: migrated.props.style?.tabIndex ?? migrated.props.aria?.tabIndex ?? migrated.props.tabIndex,
      }
      const responsive = {
        fontSizeMobile: migrated.props.responsive?.fontSizeMobile ?? migrated.props.style?.fontSizeMobile ?? migrated.props.fontSizeMobile,
        fontSizeTablet: migrated.props.responsive?.fontSizeTablet ?? migrated.props.style?.fontSizeTablet ?? migrated.props.fontSizeTablet,
        textAlignMobile: migrated.props.responsive?.textAlignMobile ?? migrated.props.style?.textAlignMobile ?? migrated.props.textAlignMobile,
        textAlignTablet: migrated.props.responsive?.textAlignTablet ?? migrated.props.style?.textAlignTablet ?? migrated.props.textAlignTablet,
        lineHeightMobile: migrated.props.responsive?.lineHeightMobile ?? migrated.props.style?.lineHeightMobile ?? migrated.props.lineHeightMobile,
        ...(isObject(migrated.props.responsive) ? migrated.props.responsive : {}),
      }
      migrated.props = {
        ...migrated.props,
        version: 1,
        content,
        style,
        responsive,
      }
      const entry = {
        type: 'auto_migration' as const,
        migration: 'advancedparagraph_legacy_to_canonical',
        targetType: 'block' as const,
        blockOrSectionType: resolvedType,
        path: `${path}.props`,
        before: summarize(beforeProps),
        after: summarize(migrated.props),
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

  if (resolvedType === 'container') {
    const rawChildren =
      Array.isArray(migrated.props?.children) && migrated.props.children.length > 0
        ? migrated.props.children
        : Array.isArray(migrated.props?.content?.children) && migrated.props.content.children.length > 0
          ? migrated.props.content.children
          : Array.isArray(migrated.props?.children)
            ? migrated.props.children
            : Array.isArray(migrated.props?.content?.children)
              ? migrated.props.content.children
              : undefined

    let migratedChildren = rawChildren
    if (Array.isArray(rawChildren)) {
      migratedChildren = rawChildren.map((child: unknown, cIdx: number) =>
        migrateBlock(child, traceId, `${path}.props.children[${cIdx}]`, migrations),
      )
    }

    if (migrated.props && (!isObject(migrated.props.style) || !migrated.props.version)) {
      const beforeProps = { ...migrated.props }
      const content = {
        content: migrated.props.content,
        children: migratedChildren,
      }
      const style = {
        maxWidth: migrated.props.maxWidth,
        width: migrated.props.width,
        minHeight: migrated.props.minHeight,
        padding: migrated.props.padding,
        margin: migrated.props.margin,
        backgroundColor: migrated.props.backgroundColor,
        borderRadius: migrated.props.borderRadius,
        border: migrated.props.border,
        borderColor: migrated.props.borderColor,
        shadow: migrated.props.shadow ?? migrated.props.boxShadow,
        boxShadow: migrated.props.boxShadow ?? migrated.props.shadow,
        alignment: migrated.props.alignment ?? migrated.props.textAlign,
        textAlign: migrated.props.textAlign ?? migrated.props.alignment,
        className: migrated.props.className,
      }
      migrated.props = {
        ...migrated.props,
        version: 1,
        content,
        children: migratedChildren,
        style,
        responsive: isObject(migrated.props.responsive) ? migrated.props.responsive : {},
      }
      const entry = {
        type: 'auto_migration' as const,
        migration: 'container_legacy_to_canonical',
        targetType: 'block' as const,
        blockOrSectionType: resolvedType,
        path: `${path}.props`,
        before: summarize(beforeProps),
        after: summarize(migrated.props),
        traceId,
      }
      migrations.push(entry)
      logAutoMigration(entry)
    } else if (migrated.props && migratedChildren) {
      if (!migrated.props.content) {
        migrated.props.content = {}
      }
      migrated.props.content.children = migratedChildren
      migrated.props.children = migratedChildren
    }
  }

  if (resolvedType === 'spacer') {
    if (migrated.props && (!isObject(migrated.props.style) || !migrated.props.version)) {
      const beforeProps = { ...migrated.props }
      const style = {
        height: migrated.props.height,
        backgroundColor: migrated.props.backgroundColor,
        showInEditor: migrated.props.showInEditor,
        className: migrated.props.className,
      }
      const responsive = {
        desktop: { height: migrated.props.desktopHeight },
        tablet: { height: migrated.props.tabletHeight },
        mobile: { height: migrated.props.mobileHeight },
      }
      migrated.props = {
        ...migrated.props,
        version: 1,
        content: {},
        style,
        responsive,
      }
      const entry = {
        type: 'auto_migration' as const,
        migration: 'spacer_legacy_to_canonical',
        targetType: 'block' as const,
        blockOrSectionType: resolvedType,
        path: `${path}.props`,
        before: summarize(beforeProps),
        after: summarize(migrated.props),
        traceId,
      }
      migrations.push(entry)
      logAutoMigration(entry)
    }
  }

  if (resolvedType === 'icon') {
    if (migrated.props && (!isObject(migrated.props.style) || !migrated.props.version)) {
      const beforeProps = { ...migrated.props }
      const rawName = migrated.props.content?.name ?? migrated.props.content?.icon ?? migrated.props.name ?? migrated.props.icon
      const content = {
        name: rawName,
        icon: rawName,
      }
      const style = {
        size: migrated.props.size,
        color: migrated.props.color,
        className: migrated.props.className,
      }
      migrated.props = {
        ...migrated.props,
        version: 1,
        content,
        style,
        responsive: isObject(migrated.props.responsive) ? migrated.props.responsive : {},
      }
      const entry = {
        type: 'auto_migration' as const,
        migration: 'icon_legacy_to_canonical',
        targetType: 'block' as const,
        blockOrSectionType: resolvedType,
        path: `${path}.props`,
        before: summarize(beforeProps),
        after: summarize(migrated.props),
        traceId,
      }
      migrations.push(entry)
      logAutoMigration(entry)
    }
  }

  if (resolvedType === 'divider') {
    if (migrated.props && (!isObject(migrated.props.style) || !migrated.props.version)) {
      const beforeProps = { ...migrated.props }
      const style = {
        thickness: migrated.props.thickness,
        color: migrated.props.color,
        width: migrated.props.width,
        margin: migrated.props.margin,
        className: migrated.props.className,
      }
      migrated.props = {
        ...migrated.props,
        version: 1,
        content: {},
        style,
        responsive: isObject(migrated.props.responsive) ? migrated.props.responsive : {},
      }
      const entry = {
        type: 'auto_migration' as const,
        migration: 'divider_legacy_to_canonical',
        targetType: 'block' as const,
        blockOrSectionType: resolvedType,
        path: `${path}.props`,
        before: summarize(beforeProps),
        after: summarize(migrated.props),
        traceId,
      }
      migrations.push(entry)
      logAutoMigration(entry)
    }
  }

  if (resolvedType === 'quote') {
    if (migrated.props && (!isObject(migrated.props.style) || !migrated.props.version)) {
      const beforeProps = { ...migrated.props }
      const text =
        migrated.props.content?.text ??
        (typeof migrated.props.content === 'string' ? migrated.props.content : undefined) ??
        migrated.props.text
      const author = migrated.props.content?.author ?? migrated.props.author ?? migrated.props.caption
      const content = {
        text,
        author,
      }
      const align =
        migrated.props.style?.align ??
        migrated.props.style?.alignment ??
        migrated.props.style?.textAlign ??
        migrated.props.align ??
        migrated.props.alignment ??
        migrated.props.textAlign
      const style = {
        align,
        alignment: align,
        textAlign: align,
        margin: migrated.props.margin,
        color: migrated.props.color,
        fontSize: migrated.props.fontSize,
        lineHeight: migrated.props.lineHeight,
        className: migrated.props.className,
      }
      migrated.props = {
        ...migrated.props,
        version: 1,
        content,
        style,
        responsive: isObject(migrated.props.responsive) ? migrated.props.responsive : {},
      }
      const entry = {
        type: 'auto_migration' as const,
        migration: 'quote_legacy_to_canonical',
        targetType: 'block' as const,
        blockOrSectionType: resolvedType,
        path: `${path}.props`,
        before: summarize(beforeProps),
        after: summarize(migrated.props),
        traceId,
      }
      migrations.push(entry)
      logAutoMigration(entry)
    }
  }

  if (resolvedType === 'video') {
    if (migrated.props && (!isObject(migrated.props.style) || !migrated.props.version)) {
      const beforeProps = { ...migrated.props }
      const content = {
        src: migrated.props.content?.src ?? migrated.props.src,
        sourceType: migrated.props.content?.sourceType ?? migrated.props.sourceType,
        title: migrated.props.content?.title ?? migrated.props.title,
        autoplay: migrated.props.content?.autoplay ?? migrated.props.autoplay,
        muted: migrated.props.content?.muted ?? migrated.props.muted,
        controls: migrated.props.content?.controls ?? migrated.props.controls,
        loop: migrated.props.content?.loop ?? migrated.props.loop,
      }
      const style = {
        width: migrated.props.style?.width ?? migrated.props.width,
        maxWidth: migrated.props.style?.maxWidth ?? migrated.props.maxWidth,
        aspectRatio: migrated.props.style?.aspectRatio ?? migrated.props.aspectRatio,
        margin: migrated.props.style?.margin ?? migrated.props.margin,
        borderRadius: migrated.props.style?.borderRadius ?? migrated.props.borderRadius,
        borderColor: migrated.props.style?.borderColor ?? migrated.props.borderColor,
        borderOpacity: migrated.props.style?.borderOpacity ?? migrated.props.borderOpacity,
        accentColor: migrated.props.style?.accentColor ?? migrated.props.accentColor,
        showOverlay: migrated.props.style?.showOverlay ?? migrated.props.showOverlay,
        overlayStrength: migrated.props.style?.overlayStrength ?? migrated.props.overlayStrength,
        showPreviewChrome: migrated.props.style?.showPreviewChrome ?? migrated.props.showPreviewChrome,
        previewProgress: migrated.props.style?.previewProgress ?? migrated.props.previewProgress,
        previewTime: migrated.props.style?.previewTime ?? migrated.props.previewTime,
        objectFit: migrated.props.style?.objectFit ?? migrated.props.objectFit,
        className: migrated.props.style?.className ?? migrated.props.className,
      }
      migrated.props = {
        ...migrated.props,
        version: 1,
        content,
        style,
        responsive: isObject(migrated.props.responsive) ? migrated.props.responsive : {},
      }
      const entry = {
        type: 'auto_migration' as const,
        migration: 'video_legacy_to_canonical',
        targetType: 'block' as const,
        blockOrSectionType: resolvedType,
        path: `${path}.props`,
        before: summarize(beforeProps),
        after: summarize(migrated.props),
        traceId,
      }
      migrations.push(entry)
      logAutoMigration(entry)
    }
  }

  if (resolvedType === 'filter') {
    if (migrated.props && (!isObject(migrated.props.style) || !migrated.props.version)) {
      const beforeProps = { ...migrated.props }
      const content = {
        filterType: migrated.props.content?.filterType ?? migrated.props.filterType,
        filterKey: migrated.props.content?.filterKey ?? migrated.props.filterKey,
        bindTo: migrated.props.content?.bindTo ?? migrated.props.bindTo,
        label: migrated.props.content?.label ?? migrated.props.label,
        helpText: migrated.props.content?.helpText ?? migrated.props.helpText,
        placeholder: migrated.props.content?.placeholder ?? migrated.props.placeholder,
        defaultValue: migrated.props.content?.defaultValue ?? migrated.props.defaultValue,
        defaultChecked: migrated.props.content?.defaultChecked ?? migrated.props.defaultChecked,
        value: migrated.props.content?.value ?? migrated.props.value,
        sourceType: migrated.props.content?.sourceType ?? migrated.props.sourceType,
        presetKey: migrated.props.content?.presetKey ?? migrated.props.presetKey,
        options: migrated.props.content?.options ?? migrated.props.options,
        apiEndpoint: migrated.props.content?.apiEndpoint ?? migrated.props.apiEndpoint,
        apiMethod: migrated.props.content?.apiMethod ?? migrated.props.apiMethod,
        apiLabelField: migrated.props.content?.apiLabelField ?? migrated.props.apiLabelField,
        apiValueField: migrated.props.content?.apiValueField ?? migrated.props.apiValueField,
        min: migrated.props.content?.min ?? migrated.props.min,
        max: migrated.props.content?.max ?? migrated.props.max,
        step: migrated.props.content?.step ?? migrated.props.step,
        rangeMode: migrated.props.content?.rangeMode ?? migrated.props.rangeMode,
        prefix: migrated.props.content?.prefix ?? migrated.props.prefix,
        suffix: migrated.props.content?.suffix ?? migrated.props.suffix,
        defaultSort: migrated.props.content?.defaultSort ?? migrated.props.defaultSort,
        sortField: migrated.props.content?.sortField ?? migrated.props.sortField,
        sortDirection: migrated.props.content?.sortDirection ?? migrated.props.sortDirection,
        onLabel: migrated.props.content?.onLabel ?? migrated.props.onLabel,
        offLabel: migrated.props.content?.offLabel ?? migrated.props.offLabel,
        selectAllLabel: migrated.props.content?.selectAllLabel ?? migrated.props.selectAllLabel,
        applyButtonLabel: migrated.props.content?.applyButtonLabel ?? migrated.props.applyButtonLabel,
        sectionTitle: migrated.props.content?.sectionTitle ?? migrated.props.sectionTitle,
        dependsOn: migrated.props.content?.dependsOn ?? migrated.props.dependsOn,
        visibleWhen: migrated.props.content?.visibleWhen ?? migrated.props.visibleWhen,
        disabledWhen: migrated.props.content?.disabledWhen ?? migrated.props.disabledWhen,
        storageKey: migrated.props.content?.storageKey ?? migrated.props.storageKey,
        queryParam: migrated.props.content?.queryParam ?? migrated.props.queryParam,
        emitEventName: migrated.props.content?.emitEventName ?? migrated.props.emitEventName,
      }
      const style = {
        variant: migrated.props.style?.variant ?? migrated.props.variant,
        size: migrated.props.style?.size ?? migrated.props.size,
        density: migrated.props.style?.density ?? migrated.props.density,
        fullWidth: migrated.props.style?.fullWidth ?? migrated.props.fullWidth,
        labelPosition: migrated.props.style?.labelPosition ?? migrated.props.labelPosition,
        orientation: migrated.props.style?.orientation ?? migrated.props.orientation,
        mobileVariant: migrated.props.style?.mobileVariant ?? migrated.props.mobileVariant,
        desktopVariant: migrated.props.style?.desktopVariant ?? migrated.props.desktopVariant,
        columns: migrated.props.style?.columns ?? migrated.props.columns,
        inline: migrated.props.style?.inline ?? migrated.props.inline,
        radioStyle: migrated.props.style?.radioStyle ?? migrated.props.radioStyle,
        toggleColor: migrated.props.style?.toggleColor ?? migrated.props.toggleColor,
        chipStyle: migrated.props.style?.chipStyle ?? migrated.props.chipStyle,
        chipVariant: migrated.props.style?.chipVariant ?? migrated.props.chipVariant,
        showLabel: migrated.props.style?.showLabel ?? migrated.props.showLabel,
        showClearButton: migrated.props.style?.showClearButton ?? migrated.props.showClearButton,
        showStateLabel: migrated.props.style?.showStateLabel ?? migrated.props.showStateLabel,
        showSelectedCount: migrated.props.style?.showSelectedCount ?? migrated.props.showSelectedCount,
        showTooltip: migrated.props.style?.showTooltip ?? migrated.props.showTooltip,
        showTicks: migrated.props.style?.showTicks ?? migrated.props.showTicks,
        showMinMaxLabels: migrated.props.style?.showMinMaxLabels ?? migrated.props.showMinMaxLabels,
        showDivider: migrated.props.style?.showDivider ?? migrated.props.showDivider,
        sticky: migrated.props.style?.sticky ?? migrated.props.sticky,
        collapsedByDefault: migrated.props.style?.collapsedByDefault ?? migrated.props.collapsedByDefault,
        disabled: migrated.props.style?.disabled ?? migrated.props.disabled,
        required: migrated.props.style?.required ?? migrated.props.required,
        clearable: migrated.props.style?.clearable ?? migrated.props.clearable,
        searchable: migrated.props.style?.searchable ?? migrated.props.searchable,
        closeMenuOnSelect: migrated.props.style?.closeMenuOnSelect ?? migrated.props.closeMenuOnSelect,
        maxSelections: migrated.props.style?.maxSelections ?? migrated.props.maxSelections,
        selectAllEnabled: migrated.props.style?.selectAllEnabled ?? migrated.props.selectAllEnabled,
        allowMultiple: migrated.props.style?.allowMultiple ?? migrated.props.allowMultiple,
        removable: migrated.props.style?.removable ?? migrated.props.removable,
        debounceMs: migrated.props.style?.debounceMs ?? migrated.props.debounceMs,
        autoFocus: migrated.props.style?.autoFocus ?? migrated.props.autoFocus,
        persistState: migrated.props.style?.persistState ?? migrated.props.persistState,
        syncWithUrl: migrated.props.style?.syncWithUrl ?? migrated.props.syncWithUrl,
        autoApply: migrated.props.style?.autoApply ?? migrated.props.autoApply,
        resetOnChange: migrated.props.style?.resetOnChange ?? migrated.props.resetOnChange,
        reloadOptionsOnDependencyChange: migrated.props.style?.reloadOptionsOnDependencyChange ?? migrated.props.reloadOptionsOnDependencyChange,
        className: migrated.props.style?.className ?? migrated.props.className,
        wrapperClassName: migrated.props.style?.wrapperClassName ?? migrated.props.wrapperClassName,
        ariaLabel: migrated.props.style?.ariaLabel ?? migrated.props.ariaLabel,
        ariaDescription: migrated.props.style?.ariaDescription ?? migrated.props.ariaDescription,
        tabIndex: migrated.props.style?.tabIndex ?? migrated.props.tabIndex,
      }
      migrated.props = {
        ...migrated.props,
        version: 1,
        content,
        style,
        responsive: isObject(migrated.props.responsive) ? migrated.props.responsive : {},
      }
      const entry = {
        type: 'auto_migration' as const,
        migration: 'filter_legacy_to_canonical',
        targetType: 'block' as const,
        blockOrSectionType: resolvedType,
        path: `${path}.props`,
        before: summarize(beforeProps),
        after: summarize(migrated.props),
        traceId,
      }
      migrations.push(entry)
      logAutoMigration(entry)
    }
  }

  if (resolvedType === 'swipercontainer') {
    const rawSlides = Array.isArray(migrated.props?.content?.slides)
      ? migrated.props.content.slides
      : Array.isArray(migrated.props?.slides)
        ? migrated.props.slides
        : undefined

    let migratedSlides = rawSlides
    if (Array.isArray(rawSlides)) {
      migratedSlides = rawSlides.map((slide: any, sIdx: number) => {
        if (!isObject(slide)) return slide
        const clonedSlide = { ...slide }
        if (Array.isArray(clonedSlide.components)) {
          clonedSlide.components = clonedSlide.components.map((comp: unknown, cIdx: number) =>
            migrateBlock(comp, traceId, `${path}.props.slides[${sIdx}].components[${cIdx}]`, migrations),
          )
        }
        return clonedSlide
      })
    }

    if (migrated.props && (!isObject(migrated.props.style) || !migrated.props.version)) {
      const beforeProps = { ...migrated.props }
      const content = {
        slides: migratedSlides,
        autoplay: migrated.props.content?.autoplay ?? migrated.props.autoplay,
        autoplayDelay: migrated.props.content?.autoplayDelay ?? migrated.props.autoplayDelay,
        loop: migrated.props.content?.loop ?? migrated.props.loop,
        speed: migrated.props.content?.speed ?? migrated.props.speed,
        direction: migrated.props.content?.direction ?? migrated.props.direction,
        draggable: migrated.props.content?.draggable ?? migrated.props.draggable,
        grabCursor: migrated.props.content?.grabCursor ?? migrated.props.grabCursor,
        freeMode: migrated.props.content?.freeMode ?? migrated.props.freeMode,
        mousewheel: migrated.props.content?.mousewheel ?? migrated.props.mousewheel,
        keyboard: migrated.props.content?.keyboard ?? migrated.props.keyboard,
        navigation: migrated.props.content?.navigation ?? migrated.props.navigation,
        pagination: migrated.props.content?.pagination ?? migrated.props.pagination,
        scrollbar: migrated.props.content?.scrollbar ?? migrated.props.scrollbar,
        scrollbarDraggable: migrated.props.content?.scrollbarDraggable ?? migrated.props.scrollbarDraggable,
        parallax: migrated.props.content?.parallax ?? migrated.props.parallax,
        parallaxBackground: migrated.props.content?.parallaxBackground ?? migrated.props.parallaxBackground,
      }
      const style = {
        slidesPerView: migrated.props.style?.slidesPerView ?? migrated.props.slidesPerView,
        slidesPerGroup: migrated.props.style?.slidesPerGroup ?? migrated.props.slidesPerGroup,
        spaceBetween: migrated.props.style?.spaceBetween ?? migrated.props.spaceBetween,
        centeredSlides: migrated.props.style?.centeredSlides ?? migrated.props.centeredSlides,
        height: migrated.props.style?.height ?? migrated.props.height,
        width: migrated.props.style?.width ?? migrated.props.width,
        slideWidth: migrated.props.style?.slideWidth ?? migrated.props.slideWidth,
        slideMinHeight: migrated.props.style?.slideMinHeight ?? migrated.props.slideMinHeight,
        backgroundColor: migrated.props.style?.backgroundColor ?? migrated.props.backgroundColor,
        padding: migrated.props.style?.padding ?? migrated.props.padding,
        borderRadius: migrated.props.style?.borderRadius ?? migrated.props.borderRadius,
        arrowStyle: migrated.props.style?.arrowStyle ?? migrated.props.arrowStyle,
        arrowPosition: migrated.props.style?.arrowPosition ?? migrated.props.arrowPosition,
        paginationType: migrated.props.style?.paginationType ?? migrated.props.paginationType,
        paginationDynamic: migrated.props.style?.paginationDynamic ?? migrated.props.paginationDynamic,
        paginationClickable: migrated.props.style?.paginationClickable ?? migrated.props.paginationClickable,
        effect: migrated.props.style?.effect ?? migrated.props.effect,
        effectFadeCrossFade: migrated.props.style?.effectFadeCrossFade ?? migrated.props.effectFadeCrossFade,
        effectCubeShadow: migrated.props.style?.effectCubeShadow ?? migrated.props.effectCubeShadow,
        effectCubeSlideShadows: migrated.props.style?.effectCubeSlideShadows ?? migrated.props.effectCubeSlideShadows,
        effectCoverflowRotate: migrated.props.style?.effectCoverflowRotate ?? migrated.props.effectCoverflowRotate,
        effectCoverflowDepth: migrated.props.style?.effectCoverflowDepth ?? migrated.props.effectCoverflowDepth,
        effectCoverflowStretch: migrated.props.style?.effectCoverflowStretch ?? migrated.props.effectCoverflowStretch,
        effectCoverflowModifier: migrated.props.style?.effectCoverflowModifier ?? migrated.props.effectCoverflowModifier,
        effectFlipSlideShadows: migrated.props.style?.effectFlipSlideShadows ?? migrated.props.effectFlipSlideShadows,
        effectCardsPerSlideOffset: migrated.props.style?.effectCardsPerSlideOffset ?? migrated.props.effectCardsPerSlideOffset,
        effectCardsRotate: migrated.props.style?.effectCardsRotate ?? migrated.props.effectCardsRotate,
        hoverEffects: migrated.props.style?.hoverEffects ?? migrated.props.hoverEffects,
        hoverEffectType: migrated.props.style?.hoverEffectType ?? migrated.props.hoverEffectType,
        hoverIntensity: migrated.props.style?.hoverIntensity ?? migrated.props.hoverIntensity,
        className: migrated.props.style?.className ?? migrated.props.className,
      }
      migrated.props = {
        ...migrated.props,
        version: 1,
        content,
        style,
        responsive: isObject(migrated.props.responsive) ? migrated.props.responsive : {},
      }
      const entry = {
        type: 'auto_migration' as const,
        migration: 'swipercontainer_legacy_to_canonical',
        targetType: 'block' as const,
        blockOrSectionType: resolvedType,
        path: `${path}.props`,
        before: summarize(beforeProps),
        after: summarize(migrated.props),
        traceId,
      }
      migrations.push(entry)
      logAutoMigration(entry)
    } else if (migrated.props && migratedSlides && migrated.props.content) {
      migrated.props.content.slides = migratedSlides
    }
  }

  if (resolvedType === 'flexbox') {
    const rawChildren =
      Array.isArray(migrated.props?.children) && migrated.props.children.length > 0
        ? migrated.props.children
        : Array.isArray(migrated.props?.content?.children) && migrated.props.content.children.length > 0
          ? migrated.props.content.children
          : Array.isArray(migrated.props?.children)
            ? migrated.props.children
            : Array.isArray(migrated.props?.content?.children)
              ? migrated.props.content.children
              : undefined

    let migratedChildren = rawChildren
    if (Array.isArray(rawChildren)) {
      migratedChildren = rawChildren.map((child: unknown, cIdx: number) =>
        migrateBlock(child, traceId, `${path}.props.children[${cIdx}]`, migrations),
      )
    }

    if (migrated.props && (!isObject(migrated.props.style) || !migrated.props.version)) {
      const beforeProps = { ...migrated.props }
      const content = {
        children: migratedChildren,
        preset: migrated.props.content?.preset ?? migrated.props.preset,
      }
      const style = {
        direction: migrated.props.style?.direction ?? migrated.props.direction,
        justifyContent: migrated.props.style?.justifyContent ?? migrated.props.justifyContent,
        alignItems: migrated.props.style?.alignItems ?? migrated.props.alignItems,
        alignContent: migrated.props.style?.alignContent ?? migrated.props.alignContent,
        wrap: migrated.props.style?.wrap ?? migrated.props.wrap,
        gap: migrated.props.style?.gap ?? migrated.props.gap,
        rowGap: migrated.props.style?.rowGap ?? migrated.props.rowGap,
        columnGap: migrated.props.style?.columnGap ?? migrated.props.columnGap,
        padding: migrated.props.style?.padding ?? migrated.props.padding,
        minHeight: migrated.props.style?.minHeight ?? migrated.props.minHeight,
        backgroundColor: migrated.props.style?.backgroundColor ?? migrated.props.backgroundColor,
        borderRadius: migrated.props.style?.borderRadius ?? migrated.props.borderRadius,
        border: migrated.props.style?.border ?? migrated.props.border,
        shadow: migrated.props.style?.shadow ?? migrated.props.shadow,
        width: migrated.props.style?.width ?? migrated.props.width,
        maxWidth: migrated.props.style?.maxWidth ?? migrated.props.maxWidth,
        className: migrated.props.style?.className ?? migrated.props.className,
      }
      const responsive = {
        stackOnMobile: migrated.props.responsive?.stackOnMobile ?? migrated.props.stackOnMobile,
        directionMobile: migrated.props.responsive?.directionMobile ?? migrated.props.directionMobile,
        mobileGap: migrated.props.responsive?.mobileGap ?? migrated.props.mobileGap,
        ...(isObject(migrated.props.responsive) ? migrated.props.responsive : {}),
      }
      migrated.props = {
        ...migrated.props,
        version: 1,
        content,
        children: migratedChildren,
        style,
        responsive,
      }
      const entry = {
        type: 'auto_migration' as const,
        migration: 'flexbox_legacy_to_canonical',
        targetType: 'block' as const,
        blockOrSectionType: resolvedType,
        path: `${path}.props`,
        before: summarize(beforeProps),
        after: summarize(migrated.props),
        traceId,
      }
      migrations.push(entry)
      logAutoMigration(entry)
    } else if (migrated.props && migratedChildren) {
      if (!migrated.props.content) {
        migrated.props.content = {}
      }
      migrated.props.content.children = migratedChildren
      migrated.props.children = migratedChildren
    }
  }

  if (resolvedType === 'advancedlist') {
    if (migrated.props && (!isObject(migrated.props.style) || !migrated.props.version)) {
      const beforeProps = { ...migrated.props }
      const items = migrated.props.content?.items ?? migrated.props.items
      const listType = migrated.props.content?.listType ?? migrated.props.listType

      const styleInput = isObject(migrated.props.style) ? migrated.props.style : {}
      const responsiveInput = isObject(migrated.props.responsive) ? migrated.props.responsive : {}

      const content = {
        ...(items !== undefined ? { items } : {}),
        ...(listType !== undefined ? { listType } : {}),
      }

      const style = {
        ...(styleInput.columns !== undefined || migrated.props.columns !== undefined
          ? { columns: Number(styleInput.columns ?? migrated.props.columns) }
          : {}),
        ...(styleInput.itemSpacing ?? migrated.props.itemSpacing ? { itemSpacing: String(styleInput.itemSpacing ?? migrated.props.itemSpacing) } : {}),
        ...(styleInput.gap ?? migrated.props.gap ? { gap: String(styleInput.gap ?? migrated.props.gap) } : {}),
        ...(styleInput.padding ?? migrated.props.padding ? { padding: String(styleInput.padding ?? migrated.props.padding) } : {}),
        ...(styleInput.margin ?? migrated.props.margin ? { margin: String(styleInput.margin ?? migrated.props.margin) } : {}),
        ...(styleInput.alignment ?? migrated.props.alignment ? { alignment: styleInput.alignment ?? migrated.props.alignment } : {}),
        ...(styleInput.displayStyle ?? migrated.props.displayStyle ? { displayStyle: styleInput.displayStyle ?? migrated.props.displayStyle } : {}),
        ...(styleInput.defaultIcon ?? migrated.props.defaultIcon ? { defaultIcon: String(styleInput.defaultIcon ?? migrated.props.defaultIcon) } : {}),
        ...(styleInput.iconSize ?? migrated.props.iconSize ? { iconSize: String(styleInput.iconSize ?? migrated.props.iconSize) } : {}),
        ...(styleInput.iconPosition ?? migrated.props.iconPosition ? { iconPosition: styleInput.iconPosition ?? migrated.props.iconPosition } : {}),
        ...(styleInput.autoNumbering !== undefined || migrated.props.autoNumbering !== undefined
          ? { autoNumbering: Boolean(styleInput.autoNumbering ?? migrated.props.autoNumbering) }
          : {}),
        ...(styleInput.titleFontSize ?? migrated.props.titleFontSize ? { titleFontSize: String(styleInput.titleFontSize ?? migrated.props.titleFontSize) } : {}),
        ...(styleInput.titleFontWeight ?? migrated.props.titleFontWeight ? { titleFontWeight: String(styleInput.titleFontWeight ?? migrated.props.titleFontWeight) } : {}),
        ...(styleInput.descriptionFontSize ?? migrated.props.descriptionFontSize ? { descriptionFontSize: String(styleInput.descriptionFontSize ?? migrated.props.descriptionFontSize) } : {}),
        ...(styleInput.fontFamily ?? migrated.props.fontFamily ? { fontFamily: String(styleInput.fontFamily ?? migrated.props.fontFamily) } : {}),
        ...(styleInput.lineHeight ?? migrated.props.lineHeight ? { lineHeight: String(styleInput.lineHeight ?? migrated.props.lineHeight) } : {}),
        ...(styleInput.titleColor ?? migrated.props.titleColor ? { titleColor: String(styleInput.titleColor ?? migrated.props.titleColor) } : {}),
        ...(styleInput.descriptionColor ?? migrated.props.descriptionColor ? { descriptionColor: String(styleInput.descriptionColor ?? migrated.props.descriptionColor) } : {}),
        ...(styleInput.iconColor ?? migrated.props.iconColor ? { iconColor: String(styleInput.iconColor ?? migrated.props.iconColor) } : {}),
        ...(styleInput.backgroundColor ?? migrated.props.backgroundColor ? { backgroundColor: String(styleInput.backgroundColor ?? migrated.props.backgroundColor) } : {}),
        ...(styleInput.border ?? migrated.props.border ? { border: String(styleInput.border ?? migrated.props.border) } : {}),
        ...(styleInput.borderRadius ?? migrated.props.borderRadius ? { borderRadius: String(styleInput.borderRadius ?? migrated.props.borderRadius) } : {}),
        ...(styleInput.itemBackground ?? migrated.props.itemBackground ? { itemBackground: String(styleInput.itemBackground ?? migrated.props.itemBackground) } : {}),
        ...(styleInput.itemPadding ?? migrated.props.itemPadding ? { itemPadding: String(styleInput.itemPadding ?? migrated.props.itemPadding) } : {}),
        ...(styleInput.boxShadow ?? migrated.props.boxShadow ? { boxShadow: String(styleInput.boxShadow ?? migrated.props.boxShadow) } : {}),
        ...(styleInput.boxHoverShadow ?? migrated.props.boxHoverShadow ? { boxHoverShadow: String(styleInput.boxHoverShadow ?? migrated.props.boxHoverShadow) } : {}),
        ...(styleInput.boxBorderWidth ?? migrated.props.boxBorderWidth ? { boxBorderWidth: String(styleInput.boxBorderWidth ?? migrated.props.boxBorderWidth) } : {}),
        ...(styleInput.boxBorderColor ?? migrated.props.boxBorderColor ? { boxBorderColor: String(styleInput.boxBorderColor ?? migrated.props.boxBorderColor) } : {}),
        ...(styleInput.fullBoxShadow ?? migrated.props.fullBoxShadow ? { fullBoxShadow: String(styleInput.fullBoxShadow ?? migrated.props.fullBoxShadow) } : {}),
        ...(styleInput.fullBoxPadding ?? migrated.props.fullBoxPadding ? { fullBoxPadding: String(styleInput.fullBoxPadding ?? migrated.props.fullBoxPadding) } : {}),
        ...(styleInput.fullBoxBackground ?? migrated.props.fullBoxBackground ? { fullBoxBackground: String(styleInput.fullBoxBackground ?? migrated.props.fullBoxBackground) } : {}),
        ...(styleInput.fullBoxBorder ?? migrated.props.fullBoxBorder ? { fullBoxBorder: String(styleInput.fullBoxBorder ?? migrated.props.fullBoxBorder) } : {}),
        ...(styleInput.fullBoxBorderRadius ?? migrated.props.fullBoxBorderRadius ? { fullBoxBorderRadius: String(styleInput.fullBoxBorderRadius ?? migrated.props.fullBoxBorderRadius) } : {}),
      }

      const responsive = {
        desktop: responsiveInput.desktop || {},
        tablet: responsiveInput.tablet || {},
        mobile: responsiveInput.mobile || {},
        ...(isObject(migrated.props.responsive) ? migrated.props.responsive : {}),
      }

      migrated.props = {
        ...migrated.props,
        version: 1,
        content,
        style,
        responsive,
      }

      const entry = {
        type: 'auto_migration' as const,
        migration: 'advancedlist_legacy_to_canonical',
        targetType: 'block' as const,
        blockOrSectionType: resolvedType,
        path: `${path}.props`,
        before: summarize(beforeProps),
        after: summarize(migrated.props),
        traceId,
      }
      migrations.push(entry)
      logAutoMigration(entry)
    }
  }

  if (resolvedType === 'advancedcard') {
    if (migrated.props && !migrated.props.version) {
      const beforeProps = { ...migrated.props }
      const contentInput = isObject(migrated.props.content) ? migrated.props.content : {}
      const styleInput = isObject(migrated.props.style) ? migrated.props.style : {}
      const responsiveInput = isObject(migrated.props.responsive) ? migrated.props.responsive : {}

      migrated.props = {
        ...migrated.props,
        version: 1,
        content: isObject(migrated.props.content) ? migrated.props.content : {
          title: migrated.props.title,
          subtitle: migrated.props.subtitle,
          description: migrated.props.description,
          image: migrated.props.image,
          alt: migrated.props.alt,
          icon: migrated.props.icon,
          badgeText: migrated.props.badgeText,
          buttonText: migrated.props.buttonText,
          buttonLink: migrated.props.buttonLink,
          buttonIcon: migrated.props.buttonIcon,
        },
        style: isObject(migrated.props.style) ? migrated.props.style : {
          variant: migrated.props.variant,
          textAlignment: migrated.props.textAlignment,
          titleAlignment: migrated.props.titleAlignment,
          subtitleAlignment: migrated.props.subtitleAlign,
          descriptionAlignment: migrated.props.descriptionAlign,
          buttonAlignment: migrated.props.buttonAlignment,
          buttonFullWidth: migrated.props.buttonFullWidth,
          backgroundColor: migrated.props.backgroundColor,
          borderColor: migrated.props.borderColor,
          borderWidth: migrated.props.borderWidth,
          borderRadius: migrated.props.borderRadius,
          shadow: migrated.props.shadow,
          padding: migrated.props.padding,
          margin: migrated.props.margin,
          width: migrated.props.width,
          height: migrated.props.height,
        },
        responsive: isObject(migrated.props.responsive) ? migrated.props.responsive : {
          hideOnMobile: migrated.props.hideOnMobile,
          hideOnTablet: migrated.props.hideOnTablet,
          desktop: responsiveInput.desktop || {},
          tablet: responsiveInput.tablet || {},
          mobile: responsiveInput.mobile || {},
        },
      }

      const entry = {
        type: 'auto_migration' as const,
        migration: 'advancedcard_legacy_to_canonical',
        targetType: 'block' as const,
        blockOrSectionType: resolvedType,
        path: `${path}.props`,
        before: summarize(beforeProps),
        after: summarize(migrated.props),
        traceId,
      }
      migrations.push(entry)
      logAutoMigration(entry)
    }
  }

  if (resolvedType === 'advancedaccordion') {
    if (migrated.props && (!isObject(migrated.props.style) || !migrated.props.version)) {
      const beforeProps = { ...migrated.props }
      const items = migrated.props.content?.items ?? migrated.props.items

      const styleInput = isObject(migrated.props.style) ? migrated.props.style : {}
      const interactionInput = isObject(migrated.props.interaction) ? migrated.props.interaction : {}
      const responsiveInput = isObject(migrated.props.responsive) ? migrated.props.responsive : {}

      const content = {
        ...(items !== undefined ? { items } : {}),
      }

      const style = {
        ...(styleInput.itemSpacing ?? migrated.props.itemSpacing ? { itemSpacing: String(styleInput.itemSpacing ?? migrated.props.itemSpacing) } : {}),
        ...(styleInput.padding ?? migrated.props.padding ? { padding: String(styleInput.padding ?? migrated.props.padding) } : {}),
        ...(styleInput.margin ?? migrated.props.margin ? { margin: String(styleInput.margin ?? migrated.props.margin) } : {}),
        ...(styleInput.titleFontSize ?? migrated.props.titleFontSize ? { titleFontSize: String(styleInput.titleFontSize ?? migrated.props.titleFontSize) } : {}),
        ...(styleInput.titleFontWeight ?? migrated.props.titleFontWeight ? { titleFontWeight: String(styleInput.titleFontWeight ?? migrated.props.titleFontWeight) } : {}),
        ...(styleInput.contentFontSize ?? migrated.props.contentFontSize ? { contentFontSize: String(styleInput.contentFontSize ?? migrated.props.contentFontSize) } : {}),
        ...(styleInput.fontFamily ?? migrated.props.fontFamily ? { fontFamily: String(styleInput.fontFamily ?? migrated.props.fontFamily) } : {}),
        ...(styleInput.lineHeight ?? migrated.props.lineHeight ? { lineHeight: String(styleInput.lineHeight ?? migrated.props.lineHeight) } : {}),
        ...(styleInput.titleColor ?? migrated.props.titleColor ? { titleColor: String(styleInput.titleColor ?? migrated.props.titleColor) } : {}),
        ...(styleInput.titleBackground ?? migrated.props.titleBackground ? { titleBackground: String(styleInput.titleBackground ?? migrated.props.titleBackground) } : {}),
        ...(styleInput.contentColor ?? migrated.props.contentColor ? { contentColor: String(styleInput.contentColor ?? migrated.props.contentColor) } : {}),
        ...(styleInput.contentBackground ?? migrated.props.contentBackground ? { contentBackground: String(styleInput.contentBackground ?? migrated.props.contentBackground) } : {}),
        ...(styleInput.border ?? migrated.props.border ? { border: String(styleInput.border ?? migrated.props.border) } : {}),
        ...(styleInput.borderRadius ?? migrated.props.borderRadius ? { borderRadius: String(styleInput.borderRadius ?? migrated.props.borderRadius) } : {}),
        ...(styleInput.activeTitleColor ?? migrated.props.activeTitleColor ? { activeTitleColor: String(styleInput.activeTitleColor ?? migrated.props.activeTitleColor) } : {}),
        ...(styleInput.activeTitleBackground ?? migrated.props.activeTitleBackground ? { activeTitleBackground: String(styleInput.activeTitleBackground ?? migrated.props.activeTitleBackground) } : {}),
      }

      const interaction = {
        ...(interactionInput.behavior ?? migrated.props.behavior ? { behavior: interactionInput.behavior ?? migrated.props.behavior } : {}),
        ...(interactionInput.allowAllClosed !== undefined || migrated.props.allowAllClosed !== undefined
          ? { allowAllClosed: Boolean(interactionInput.allowAllClosed ?? migrated.props.allowAllClosed) }
          : {}),
        ...(interactionInput.iconPosition ?? migrated.props.iconPosition ? { iconPosition: interactionInput.iconPosition ?? migrated.props.iconPosition } : {}),
        ...(interactionInput.icon ?? migrated.props.icon ? { icon: String(interactionInput.icon ?? migrated.props.icon) } : {}),
        ...(interactionInput.activeIcon ?? migrated.props.activeIcon ? { activeIcon: String(interactionInput.activeIcon ?? migrated.props.activeIcon) } : {}),
        ...(interactionInput.animation ?? migrated.props.animation ? { animation: interactionInput.animation ?? migrated.props.animation } : {}),
        ...(interactionInput.animationDuration !== undefined || migrated.props.animationDuration !== undefined
          ? { animationDuration: Number(interactionInput.animationDuration ?? migrated.props.animationDuration) }
          : {}),
      }

      const responsive = {
        desktop: responsiveInput.desktop || {},
        tablet: responsiveInput.tablet || {},
        mobile: responsiveInput.mobile || {},
        ...(isObject(migrated.props.responsive) ? migrated.props.responsive : {}),
      }

      migrated.props = {
        ...migrated.props,
        version: 1,
        content,
        style,
        interaction,
        responsive,
      }

      const entry = {
        type: 'auto_migration' as const,
        migration: 'advancedaccordion_legacy_to_canonical',
        targetType: 'block' as const,
        blockOrSectionType: resolvedType,
        path: `${path}.props`,
        before: summarize(beforeProps),
        after: summarize(migrated.props),
        traceId,
      }
      migrations.push(entry)
      logAutoMigration(entry)
    }
  }

  if (resolvedType === 'tabs') {
    const rawTabs = Array.isArray(migrated.props?.content?.tabs)
      ? migrated.props.content.tabs
      : Array.isArray(migrated.props?.tabs)
        ? migrated.props.tabs
        : undefined

    let migratedTabs = rawTabs
    if (Array.isArray(rawTabs)) {
      migratedTabs = rawTabs.map((tab: any, tIdx: number) => {
        if (!isObject(tab)) return tab
        const clonedTab = { ...tab }
        if (Array.isArray(clonedTab.components)) {
          clonedTab.components = clonedTab.components.map((comp: unknown, cIdx: number) =>
            migrateBlock(comp, traceId, `${path}.props.tabs[${tIdx}].components[${cIdx}]`, migrations),
          )
        }
        return clonedTab
      })
    }

    if (migrated.props && (!isObject(migrated.props.style) || !migrated.props.version)) {
      const beforeProps = { ...migrated.props }
      const activeTab = migrated.props.content?.activeTab ?? migrated.props.activeTab

      const styleInput = isObject(migrated.props.style) ? migrated.props.style : {}
      const ariaInput = isObject(migrated.props.aria) ? migrated.props.aria : {}
      const responsiveInput = isObject(migrated.props.responsive) ? migrated.props.responsive : {}

      const content = {
        ...(migratedTabs !== undefined ? { tabs: migratedTabs } : {}),
        ...(activeTab !== undefined ? { activeTab: Number(activeTab) } : {}),
      }

      const style = {
        ...(styleInput.width ?? migrated.props.width ? { width: String(styleInput.width ?? migrated.props.width) } : {}),
        ...(styleInput.tabGap ?? migrated.props.tabGap ? { tabGap: String(styleInput.tabGap ?? migrated.props.tabGap) } : {}),
        ...(styleInput.tabPadding ?? migrated.props.tabPadding ? { tabPadding: String(styleInput.tabPadding ?? migrated.props.tabPadding) } : {}),
        ...(styleInput.contentPadding ?? migrated.props.contentPadding ? { contentPadding: String(styleInput.contentPadding ?? migrated.props.contentPadding) } : {}),
        ...(styleInput.borderColor ?? migrated.props.borderColor ? { borderColor: String(styleInput.borderColor ?? migrated.props.borderColor) } : {}),
        ...(styleInput.activeBorderColor ?? migrated.props.activeBorderColor ? { activeBorderColor: String(styleInput.activeBorderColor ?? migrated.props.activeBorderColor) } : {}),
        ...(styleInput.activeTextColor ?? migrated.props.activeTextColor ? { activeTextColor: String(styleInput.activeTextColor ?? migrated.props.activeTextColor) } : {}),
        ...(styleInput.inactiveTextColor ?? migrated.props.inactiveTextColor ? { inactiveTextColor: String(styleInput.inactiveTextColor ?? migrated.props.inactiveTextColor) } : {}),
        ...(styleInput.activeFontWeight ?? migrated.props.activeFontWeight ? { activeFontWeight: String(styleInput.activeFontWeight ?? migrated.props.activeFontWeight) } : {}),
        ...(styleInput.inactiveFontWeight ?? migrated.props.inactiveFontWeight ? { inactiveFontWeight: String(styleInput.inactiveFontWeight ?? migrated.props.inactiveFontWeight) } : {}),
      }

      const aria = {
        ...(ariaInput.label ?? migrated.props.label ? { label: String(ariaInput.label ?? migrated.props.label) } : {}),
        ...(ariaInput.ariaLabel ?? migrated.props.ariaLabel ?? migrated.props.label ? { ariaLabel: String(ariaInput.ariaLabel ?? migrated.props.ariaLabel ?? migrated.props.label) } : {}),
        ...(ariaInput.className ?? migrated.props.className ? { className: String(ariaInput.className ?? migrated.props.className) } : {}),
        ...(ariaInput.customId ?? migrated.props.customId ? { customId: String(ariaInput.customId ?? migrated.props.customId) } : {}),
      }

      const responsive = {
        desktop: responsiveInput.desktop || {},
        tablet: responsiveInput.tablet || {},
        mobile: responsiveInput.mobile || {},
        ...(isObject(migrated.props.responsive) ? migrated.props.responsive : {}),
      }

      migrated.props = {
        ...migrated.props,
        version: 1,
        content,
        style,
        aria,
        responsive,
      }

      const entry = {
        type: 'auto_migration' as const,
        migration: 'tabs_legacy_to_canonical',
        targetType: 'block' as const,
        blockOrSectionType: resolvedType,
        path: `${path}.props`,
        before: summarize(beforeProps),
        after: summarize(migrated.props),
        traceId,
      }
      migrations.push(entry)
      logAutoMigration(entry)
    } else if (migrated.props && migratedTabs && migrated.props.content) {
      migrated.props.content.tabs = migratedTabs
    }
  }

  if (resolvedType === 'newgrid') {
    const rawComponents = Array.isArray(migrated.props?.content?.components)
      ? migrated.props.content.components
      : Array.isArray(migrated.props?.components)
        ? migrated.props.components
        : undefined

    let migratedComponents = rawComponents
    if (Array.isArray(rawComponents)) {
      migratedComponents = rawComponents.map((comp: unknown, cIdx: number) =>
        comp && isObject(comp) ? migrateBlock(comp, traceId, `${path}.props.components[${cIdx}]`, migrations) : comp,
      )
    }

    if (migrated.props && (!isObject(migrated.props.style) || !migrated.props.version)) {
      const beforeProps = { ...migrated.props }
      const layoutInput = isObject(migrated.props.layout) ? migrated.props.layout : {}
      const responsiveInput = isObject(migrated.props.responsive) ? migrated.props.responsive : {}
      const styleInput = isObject(migrated.props.style) ? migrated.props.style : {}
      const behaviorInput = isObject(migrated.props.behavior) ? migrated.props.behavior : {}

      const content = {
        ...(migratedComponents !== undefined ? { components: migratedComponents } : {}),
        ...(migrated.props.content?.cells ?? migrated.props.cells ? { cells: migrated.props.content?.cells ?? migrated.props.cells } : {}),
      }

      const layout = {
        ...(layoutInput.columns !== undefined || migrated.props.columns !== undefined ? { columns: Number(layoutInput.columns ?? migrated.props.columns) } : {}),
        ...(layoutInput.rows !== undefined || migrated.props.rows !== undefined ? { rows: Number(layoutInput.rows ?? migrated.props.rows) } : {}),
        ...(layoutInput.gap !== undefined || migrated.props.gap !== undefined ? { gap: Number(layoutInput.gap ?? migrated.props.gap) } : {}),
        ...(layoutInput.padding !== undefined || migrated.props.padding !== undefined ? { padding: Number(layoutInput.padding ?? migrated.props.padding) } : {}),
        ...(layoutInput.margin !== undefined || migrated.props.margin !== undefined ? { margin: Number(layoutInput.margin ?? migrated.props.margin) } : {}),
        ...(layoutInput.justifyContent ?? migrated.props.justifyContent ? { justifyContent: layoutInput.justifyContent ?? migrated.props.justifyContent } : {}),
        ...(layoutInput.alignItems ?? migrated.props.alignItems ? { alignItems: layoutInput.alignItems ?? migrated.props.alignItems } : {}),
        ...(layoutInput.gridTemplateColumns ?? migrated.props.gridTemplateColumns ? { gridTemplateColumns: String(layoutInput.gridTemplateColumns ?? migrated.props.gridTemplateColumns) } : {}),
        ...(layoutInput.gridAutoRows ?? migrated.props.gridAutoRows ? { gridAutoRows: String(layoutInput.gridAutoRows ?? migrated.props.gridAutoRows) } : {}),
        ...(layoutInput.minHeight ?? migrated.props.minHeight ? { minHeight: String(layoutInput.minHeight ?? migrated.props.minHeight) } : {}),
      }

      const responsive = {
        ...(responsiveInput.mobileColumns !== undefined || migrated.props.mobileColumns !== undefined ? { mobileColumns: Number(responsiveInput.mobileColumns ?? migrated.props.mobileColumns) } : {}),
        ...(responsiveInput.tabletColumns !== undefined || migrated.props.tabletColumns !== undefined ? { tabletColumns: Number(responsiveInput.tabletColumns ?? migrated.props.tabletColumns) } : {}),
        ...(responsiveInput.desktopColumns !== undefined || migrated.props.desktopColumns !== undefined ? { desktopColumns: Number(responsiveInput.desktopColumns ?? migrated.props.desktopColumns) } : {}),
        ...(responsiveInput.hideOnMobile !== undefined || migrated.props.hideOnMobile !== undefined ? { hideOnMobile: Boolean(responsiveInput.hideOnMobile ?? migrated.props.hideOnMobile) } : {}),
        ...(responsiveInput.hideOnTablet !== undefined || migrated.props.hideOnTablet !== undefined ? { hideOnTablet: Boolean(responsiveInput.hideOnTablet ?? migrated.props.hideOnTablet) } : {}),
        desktop: responsiveInput.desktop || {},
        tablet: responsiveInput.tablet || {},
        mobile: responsiveInput.mobile || {},
        ...(isObject(migrated.props.responsive) ? migrated.props.responsive : {}),
      }

      const style = {
        ...(styleInput.backgroundColor ?? migrated.props.backgroundColor ? { backgroundColor: String(styleInput.backgroundColor ?? migrated.props.backgroundColor) } : {}),
        ...(styleInput.border ?? migrated.props.border ? { border: String(styleInput.border ?? migrated.props.border) } : {}),
        ...(styleInput.borderRadius !== undefined || migrated.props.borderRadius !== undefined ? { borderRadius: Number(styleInput.borderRadius ?? migrated.props.borderRadius) } : {}),
        ...(styleInput.gridLineColor ?? migrated.props.gridLineColor ? { gridLineColor: String(styleInput.gridLineColor ?? migrated.props.gridLineColor) } : {}),
        ...(styleInput.customCSS ?? migrated.props.customCSS ? { customCSS: String(styleInput.customCSS ?? migrated.props.customCSS) } : {}),
        ...(styleInput.className ?? migrated.props.className ? { className: String(styleInput.className ?? migrated.props.className) } : {}),
        ...(styleInput.id ?? migrated.props.id ? { id: String(styleInput.id ?? migrated.props.id) } : {}),
        ...(styleInput.dataAttributes ?? migrated.props.dataAttributes ? { dataAttributes: String(styleInput.dataAttributes ?? migrated.props.dataAttributes) } : {}),
      }

      const behavior = {
        ...(behaviorInput.draggable !== undefined || migrated.props.draggable !== undefined ? { draggable: Boolean(behaviorInput.draggable ?? migrated.props.draggable) } : {}),
        ...(behaviorInput.resizable !== undefined || migrated.props.resizable !== undefined ? { resizable: Boolean(behaviorInput.resizable ?? migrated.props.resizable) } : {}),
        ...(behaviorInput.showGridLines !== undefined || migrated.props.showGridLines !== undefined ? { showGridLines: Boolean(behaviorInput.showGridLines ?? migrated.props.showGridLines) } : {}),
        ...(behaviorInput.snapToGrid !== undefined || migrated.props.snapToGrid !== undefined ? { snapToGrid: Boolean(behaviorInput.snapToGrid ?? migrated.props.snapToGrid) } : {}),
        ...(behaviorInput.visible !== undefined || migrated.props.visible !== undefined ? { visible: Boolean(behaviorInput.visible ?? migrated.props.visible) } : {}),
      }

      migrated.props = {
        ...migrated.props,
        version: 1,
        content,
        layout,
        responsive,
        style,
        behavior,
      }

      const entry = {
        type: 'auto_migration' as const,
        migration: 'newgrid_legacy_to_canonical',
        targetType: 'block' as const,
        blockOrSectionType: resolvedType,
        path: `${path}.props`,
        before: summarize(beforeProps),
        after: summarize(migrated.props),
        traceId,
      }
      migrations.push(entry)
      logAutoMigration(entry)
    } else if (migrated.props && migratedComponents && migrated.props.content) {
      migrated.props.content.components = migratedComponents
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
