import {
  ADVANCED_CARD_BASE_DEFAULTS,
  ADVANCED_CARD_VARIANT_DEFAULTS,
  LEGACY_ADVANCED_CARD_DEFAULTS,
} from './defaults'
import type {
  AdvancedCard,
  AdvancedCardInput,
  AdvancedCardVariant,
  LegacyAdvancedCardProps,
} from './types'
import { deepMerge, pruneUndefined, isPlainObject, cloneValue } from '../../utils/merge'
import type { DeepPartial } from '../../utils/merge'



function hasStructuredSections(value: unknown): value is DeepPartial<AdvancedCard> {
  if (!isPlainObject(value)) {
    return false
  }

  return (
    'content' in value ||
    'layout' in value ||
    'style' in value ||
    'interaction' in value ||
    'animation' in value ||
    'responsive' in value ||
    'system' in value ||
    'meta' in value
  )
}

function resolveVariant(input: {
  variant?: unknown
  interaction?: { flip?: { enabled?: unknown } }
  enableFlip?: unknown
}): AdvancedCardVariant {
  if (input.variant === 'default' || input.variant === 'feature' || input.variant === 'blog' || input.variant === 'flip') {
    return input.variant
  }

  if (input.interaction?.flip?.enabled === true || input.enableFlip === true) {
    return 'flip'
  }

  return 'default'
}

function mapLegacyAdvancedCard(input: LegacyAdvancedCardProps): DeepPartial<AdvancedCard> {
  const legacy = {
    ...LEGACY_ADVANCED_CARD_DEFAULTS,
    ...input,
  }

  const variant = resolveVariant(legacy)

  return {
    id: String(legacy.id || ''),
    type: 'advancedCard',
    variant,
    schemaVersion: 2,
    content: {
      title: {
        text: String(legacy.title || ''),
        visible: legacy.showTitle !== false,
      },
      subtitle: {
        text: String(legacy.subtitle || ''),
        visible: legacy.showSubtitle !== false,
      },
      description: {
        text: String(legacy.description || ''),
        visible: legacy.showDescription !== false,
      },
      image: {
        src: String(legacy.image || ''),
        alt: String(legacy.alt || ''),
        visible: legacy.showImage !== false,
      },
      icon: {
        name: String(legacy.icon || ''),
        visible: legacy.showIcon === true,
      },
      badge: {
        text: String(legacy.badgeText || ''),
        visible: legacy.showBadge !== false,
      },
      button: {
        label: String(legacy.buttonText || ''),
        href: String(legacy.buttonLink || ''),
        icon: String(legacy.buttonIcon || ''),
        visible: legacy.showButton !== false,
      },
      extra: {},
    },
    layout: {
      imagePosition: legacy.imagePosition,
      iconPosition: legacy.iconPosition,
      alignment: input.textAlignment || input.titleAlignment || legacy.textAlignment || legacy.titleAlignment || 'left',
      textAlignment: input.textAlignment || legacy.textAlignment || 'left',
      titleAlignment: input.titleAlignment || input.textAlignment || legacy.titleAlignment || legacy.textAlignment || 'left',
      subtitleAlignment: input.subtitleAlign || input.textAlignment || legacy.subtitleAlign || legacy.textAlignment || 'left',
      descriptionAlignment: input.descriptionAlign || input.textAlignment || legacy.descriptionAlign || legacy.textAlignment || 'left',
      buttonAlignment: input.buttonAlignment || legacy.buttonAlignment || 'left',
      buttonFullWidth: Boolean(
        input.buttonFullWidth ??
        legacy.buttonFullWidth ??
        (String(input.buttonAlignment) === 'full-width' || String(input.buttonAlignment) === 'full' || String(legacy.buttonAlignment) === 'full-width' || String(legacy.buttonAlignment) === 'full')
      ),
      padding: legacy.padding,
      margin: legacy.margin,
      width: legacy.width,
      height: legacy.height,
      imageHeight: legacy.imageHeight,
      imageWidth: legacy.imageWidth,
      direction:
        legacy.imagePosition === 'left' || legacy.imagePosition === 'right'
          ? 'horizontal'
          : 'vertical',
    },
    style: {
      backgroundColor: legacy.backgroundColor,
      border: {
        color: legacy.borderColor,
        width: legacy.borderWidth,
        radius: legacy.borderRadius,
      },
      shadow: {
        card: legacy.shadow,
        image: legacy.imageShadow,
        icon: legacy.iconShadow,
      },
      text: {
        fontFamily: legacy.fontFamily,
        lineHeight: legacy.lineHeight,
        letterSpacing: legacy.textSpacing,
        title: {
          color: legacy.titleColor,
          fontSize: legacy.titleFontSize,
          fontFamily: legacy.titleFontFamily,
        },
        subtitle: {
          color: legacy.subtitleColor,
          fontSize: legacy.subtitleFontSize,
        },
        description: {
          color: legacy.descriptionColor,
          fontSize: legacy.descriptionFontSize,
        },
      },
      image: {
        objectFit: legacy.objectFit,
        overlayColor: legacy.overlayColor,
        overlayOpacity: legacy.overlayOpacity,
        borderRadius: legacy.imageBorderRadius,
      },
      icon: {
        size: legacy.iconSize,
        color: legacy.iconColor,
        backgroundColor: legacy.iconBackgroundColor,
        shape: legacy.iconShape,
        borderRadius: legacy.iconBorderRadius,
        padding: legacy.iconPadding,
      },
      badge: {
        color: legacy.badgeColor,
        textColor: legacy.badgeTextColor,
        position: legacy.badgePosition,
        shape: legacy.badgeShape,
      },
      button: {
        variant: legacy.buttonStyle,
        color: legacy.buttonColor,
        textColor: legacy.buttonTextColor,
        size: legacy.buttonSize,
        radius: legacy.buttonRadius,
      },
    },
    interaction: {
      hover: {
        card: {
          effect: legacy.cardHoverEffect,
          shadow: legacy.cardHoverShadow,
          scale: legacy.cardHoverScale,
          tilt: legacy.cardHoverTilt,
          glowColor: legacy.cardHoverGlowColor,
          glowIntensity: legacy.cardHoverGlowIntensity,
          gradientFrom: legacy.cardHoverGradientFrom,
          gradientTo: legacy.cardHoverGradientTo,
          duration: legacy.cardHoverDuration,
        },
        image: {
          effect: legacy.imageHoverEffect,
          zoom: legacy.imageHoverZoom,
          brightness: legacy.imageHoverBrightness,
          grayscale: legacy.imageHoverGrayscale,
          duration: legacy.imageHoverDuration,
        },
        icon: {
          effect: legacy.iconHoverEffect,
          scale: legacy.iconHoverScale,
          color: legacy.iconHoverColor,
          backgroundColor: legacy.iconBgHoverColor,
          duration: legacy.iconHoverDuration,
        },
        text: {
          title: legacy.titleHoverEffect,
          subtitle: legacy.subtitleHoverEffect,
          description: legacy.descriptionHoverEffect,
        },
        badge: {
          effect: legacy.badgeHoverEffect,
        },
        button: {
          effect: legacy.buttonHoverEffect,
          color: legacy.buttonHoverColor,
          textColor: legacy.buttonTextHoverColor,
        },
      },
      click: {
        href: typeof legacy.buttonLink === 'string' && legacy.buttonLink ? legacy.buttonLink : undefined,
        action: 'none',
      },
      flip: {
        enabled: legacy.enableFlip === true,
        trigger: legacy.flipOn,
        direction: legacy.flipDirection,
        duration: legacy.flipDuration,
        perspective: legacy.flipPerspective,
      },
    },
    animation: {
      entry: {
        type: legacy.animationType,
        delay: legacy.animationDelay,
        duration: legacy.transitionDuration,
        easing: 'ease',
      },
      hoverAnimation: legacy.hoverAnimation,
      transitionDuration: legacy.transitionDuration,
    },
    system: {
      visible: legacy.visible !== false,
      customClass: String(legacy.customClass || ''),
      componentId: String(legacy.componentId || ''),
      editable: legacy.editable === true,
      legacyProps: pruneUndefined(input),
    },
    meta: {
      migratedFrom: 'legacy-flat',
    },
  }
}

export function normalizeAdvancedCard(input: AdvancedCardInput = {}): AdvancedCard {
  let structuredInput: DeepPartial<AdvancedCard>

  if (hasStructuredSections(input)) {
    structuredInput = pruneUndefined(input) as DeepPartial<AdvancedCard>
    const raw = input as Record<string, any>
    const layout = (structuredInput.layout || {}) as Record<string, any>

    if (raw.textAlignment !== undefined) {
      layout.textAlignment = raw.textAlignment
      layout.alignment = raw.textAlignment
      layout.titleAlignment = raw.titleAlignment || raw.textAlignment
      layout.subtitleAlignment = raw.subtitleAlign || raw.textAlignment
      layout.descriptionAlignment = raw.descriptionAlign || raw.textAlignment
    }
    if (raw.titleAlignment !== undefined) {
      layout.titleAlignment = raw.titleAlignment
    }
    if (raw.subtitleAlign !== undefined) {
      layout.subtitleAlignment = raw.subtitleAlign
    }
    if (raw.descriptionAlign !== undefined) {
      layout.descriptionAlignment = raw.descriptionAlign
    }
    if (raw.buttonAlignment !== undefined) {
      layout.buttonAlignment = raw.buttonAlignment
    }
    if (raw.buttonFullWidth !== undefined) {
      layout.buttonFullWidth = Boolean(raw.buttonFullWidth)
    }
    if (
      layout.buttonAlignment === 'full-width' ||
      layout.buttonAlignment === 'full' ||
      raw.buttonAlignment === 'full-width' ||
      raw.buttonAlignment === 'full' ||
      raw.buttonFullWidth === true ||
      layout.buttonFullWidth === true
    ) {
      layout.buttonFullWidth = true
      layout.buttonAlignment = 'full-width'
    }
    if (layout.textAlignment && !layout.titleAlignment) {
      layout.titleAlignment = layout.textAlignment
    }
    if (layout.textAlignment && !layout.subtitleAlignment) {
      layout.subtitleAlignment = layout.textAlignment
    }
    if (layout.textAlignment && !layout.descriptionAlignment) {
      layout.descriptionAlignment = layout.textAlignment
    }

    structuredInput.layout = layout as any

    if (!structuredInput.content) {
      structuredInput.content = {}
    }
    const content = structuredInput.content as Record<string, any>
    if (raw.title !== undefined) {
      content.title = { ...(content.title || {}), text: String(raw.title) }
    }
    if (raw.subtitle !== undefined) {
      content.subtitle = { ...(content.subtitle || {}), text: String(raw.subtitle) }
    }
    if (raw.description !== undefined) {
      content.description = { ...(content.description || {}), text: String(raw.description) }
    }
    if (raw.buttonText !== undefined) {
      content.button = { ...(content.button || {}), label: String(raw.buttonText) }
    }
    if (raw.buttonLink !== undefined) {
      content.button = { ...(content.button || {}), href: String(raw.buttonLink) }
    }
    if (raw.image !== undefined) {
      content.image = { ...(content.image || {}), src: String(raw.image) }
    }
    if (raw.icon !== undefined) {
      content.icon = { ...(content.icon || {}), name: String(raw.icon) }
    }
  } else {
    structuredInput = mapLegacyAdvancedCard(input as LegacyAdvancedCardProps)
  }

  const variant = resolveVariant({
    variant: structuredInput.variant,
    interaction: structuredInput.interaction,
    enableFlip: (input as LegacyAdvancedCardProps).enableFlip,
  })

  const normalized = deepMerge<AdvancedCard>(
    ADVANCED_CARD_BASE_DEFAULTS,
    ADVANCED_CARD_VARIANT_DEFAULTS[variant],
    structuredInput,
    {
      id: String(structuredInput.id || ''),
      type: 'advancedCard',
      variant,
      schemaVersion: 2,
      meta: {
        migratedFrom: structuredInput.meta?.migratedFrom || (hasStructuredSections(input) ? 'structured' : 'legacy-flat'),
      },
    },
  )

  if (!normalized.layout.direction) {
    normalized.layout.direction =
      normalized.layout.imagePosition === 'left' || normalized.layout.imagePosition === 'right'
        ? 'horizontal'
        : 'vertical'
  }

  return normalized
}

function valuesAreEqual(left: unknown, right: unknown): boolean {
  if (left === right) {
    return true
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) {
      return false
    }

    for (let index = 0; index < left.length; index += 1) {
      if (!valuesAreEqual(left[index], right[index])) {
        return false
      }
    }

    return true
  }

  if (isPlainObject(left) && isPlainObject(right)) {
    const leftKeys = Object.keys(left)
    const rightKeys = Object.keys(right)

    if (leftKeys.length !== rightKeys.length) {
      return false
    }

    for (const key of leftKeys) {
      if (!valuesAreEqual((left as Record<string, unknown>)[key], (right as Record<string, unknown>)[key])) {
        return false
      }
    }

    return true
  }

  return false
}

function cleanupForStorage(value: unknown, defaultValue: unknown): unknown {
  if (value === undefined || value === null) {
    return undefined
  }

  if (typeof value === 'string' && value.trim() === '') {
    return undefined
  }

  if (Array.isArray(value)) {
    const cleanedArray = value
      .map((item, index) => cleanupForStorage(item, Array.isArray(defaultValue) ? defaultValue[index] : undefined))
      .filter((item) => item !== undefined)

    if (cleanedArray.length === 0) {
      return undefined
    }

    if (Array.isArray(defaultValue) && valuesAreEqual(cleanedArray, defaultValue)) {
      return undefined
    }

    return cleanedArray
  }

  if (isPlainObject(value)) {
    const cleanedObject: Record<string, unknown> = {}
    const valueEntries = Object.entries(value)

    for (const [key, nestedValue] of valueEntries) {
      const nestedDefault = isPlainObject(defaultValue) ? (defaultValue as Record<string, unknown>)[key] : undefined
      const cleanedNestedValue = cleanupForStorage(nestedValue, nestedDefault)

      if (cleanedNestedValue !== undefined) {
        cleanedObject[key] = cleanedNestedValue
      }
    }

    if (Object.keys(cleanedObject).length === 0) {
      return undefined
    }

    if (isPlainObject(defaultValue) && valuesAreEqual(cleanedObject, defaultValue)) {
      return undefined
    }

    return cleanedObject
  }

  if (defaultValue !== undefined && valuesAreEqual(value, defaultValue)) {
    return undefined
  }

  return value
}

export function sanitizeAdvancedCardForStorage(input: AdvancedCardInput = {}): Record<string, unknown> {
  const normalized = normalizeAdvancedCard(input)
  const variant = normalized.variant

  const defaultCard = deepMerge<AdvancedCard>(
    ADVANCED_CARD_BASE_DEFAULTS,
    ADVANCED_CARD_VARIANT_DEFAULTS[variant],
    {
      type: 'advancedCard',
      variant,
      schemaVersion: 2,
      id: '',
    },
  )

  const storageCandidate = cloneValue(normalized)

  if (storageCandidate.system && isPlainObject(storageCandidate.system)) {
    delete (storageCandidate.system as Record<string, unknown>).legacyProps
  }

  const cleaned = cleanupForStorage(storageCandidate, defaultCard)
  const cleanedObject = (isPlainObject(cleaned) ? cleaned : {}) as Record<string, unknown>

  cleanedObject.type = 'advancedCard'
  cleanedObject.schemaVersion = 2

  if (!cleanedObject.variant) {
    cleanedObject.variant = variant
  }

  return cleanedObject
}

export { deepMerge }
