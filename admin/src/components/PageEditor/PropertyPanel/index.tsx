'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LayoutComponent, PageLayout, Section } from '@/types/page-editor'
import { componentRegistry } from '@/lib/componentRegistry'
import { PropertyField } from './PropertyField'
import { SectionProperties } from '@/components/PageEditor/components/SectionProperties'
import { sanitizeSectionProps, sectionSchemaList } from '@/lib/sectionSchemas'
import { createAdvancedCardView } from '../../../../../shared/blocks/advancedcard/viewModel'
import { normalizeAdvancedAccordion } from '../../../../../shared/blocks/advancedaccordion/normalize'
import { normalizeAdvancedCard } from '../../../../../shared/blocks/advancedcard/normalize'
import { normalizeAdvancedHeading } from '../../../../../shared/blocks/advancedheading/normalize'
import { normalizeAdvancedList } from '../../../../../shared/blocks/advancedlist/normalize'
import { normalizeAdvancedParagraph } from '../../../../../shared/blocks/advancedparagraph/normalize'
import { normalizeNewGrid } from '../../../../../shared/blocks/newgrid/normalize'
import { normalizeTabs } from '../../../../../shared/blocks/tabs/normalize'
import { normalizeButton } from '../../../../../shared/blocks/button/normalize'
import { normalizeImage } from '../../../../../shared/blocks/image/normalize'
import { getBlockDefaults, normalizeBlockProps, resolveBlockType } from '../../../../../shared/blocks/registry'
import { THEME_PRESETS } from '../../../../../shared/theme'

interface PropertyPanelProps {
  selectedComponent?: {
    sectionId: string
    containerId: string
    rowId: string
    colId: string
    component: LayoutComponent
    compId: string
    gridId?: string
    carouselId?: string
    slideIndex?: number
    cellRow?: number
    cellCol?: number
  } | null
  sections?: Section[]
  layout?: PageLayout
  onComponentUpdate?: (componentId: string, props: Record<string, any>) => void
  onClose?: () => void
  selectedSectionId?: string
  onConfigureSectionColumns?: (sectionId: string) => void
  onSectionUpdate?: (sectionId: string, updates: any) => void
}

type TabType = 'content' | 'style' | 'ai'

const COLOR_SWATCHES = ['#ffffff', '#7c6dfa', '#a594ff', '#3ecf8e', '#f87171', '#fbbf24']
const QUICK_PROMPTS = ['Larger + bolder', 'Gradient text', 'Add animation', 'Pro tone', 'More padding', 'Center align']

const stripEditorMeta = (value: Record<string, any>) => {
  const { type: _type, schemaVersion: _schemaVersion, meta: _meta, ...rest } = value || {}
  return rest
}

const getEditorPropsForComponent = (type: string | undefined, props: Record<string, any> = {}) => {
  const normalizedType = String(type || '').trim().toLowerCase()

  if (normalizedType === 'advancedparagraph' || normalizedType === 'paragraph') {
    const paragraph = normalizeAdvancedParagraph(props)
    return {
      text: paragraph.content.text,
      enableRichText: paragraph.aria.enableRichText,
      allowedFormats: paragraph.aria.allowedFormats.join(', '),
      fontSize: paragraph.style.fontSize,
      fontWeight: paragraph.style.fontWeight,
      fontFamily: paragraph.style.fontFamily,
      lineHeight: paragraph.style.lineHeight,
      letterSpacing: paragraph.style.letterSpacing,
      textTransform: paragraph.style.textTransform,
      textDecoration: paragraph.style.textDecoration,
      fontStyle: paragraph.style.fontStyle,
      textColor: paragraph.style.color,
      backgroundColor: paragraph.style.backgroundColor,
      border: paragraph.style.border,
      borderRadius: paragraph.style.borderRadius,
      borderColor: paragraph.style.borderColor,
      textShadow: paragraph.style.textShadow,
      boxShadow: paragraph.style.boxShadow,
      opacity: paragraph.style.opacity,
      textAlign: paragraph.layout.alignment,
      alignment: paragraph.layout.alignment,
      margin: paragraph.style.margin,
      padding: paragraph.style.padding,
      width: paragraph.style.width,
      maxWidth: paragraph.style.maxWidth,
      minHeight: paragraph.style.minHeight,
      display: paragraph.style.display,
      fontSizeMobile: paragraph.style.fontSizeMobile,
      fontSizeTablet: paragraph.style.fontSizeTablet,
      textAlignMobile: paragraph.style.textAlignMobile,
      textAlignTablet: paragraph.style.textAlignTablet,
      lineHeightMobile: paragraph.style.lineHeightMobile,
      hoverEffect: paragraph.interaction.hover.effect,
      hoverTextColor: paragraph.interaction.hover.color,
      hoverBackgroundColor: paragraph.interaction.hover.backgroundColor,
      transition: paragraph.style.transition,
      ariaLabel: paragraph.aria.ariaLabel,
      role: paragraph.aria.role,
      tabIndex: paragraph.aria.tabIndex,
      className: paragraph.aria.className,
      customId: paragraph.aria.customId,
      selectable: paragraph.aria.selectable,
      editable: paragraph.aria.editable,
      truncate: paragraph.aria.truncate,
      maxLines: paragraph.aria.maxLines,
      visible: paragraph.aria.visible,
      componentId: paragraph.aria.componentId,
    }
  }

  if (normalizedType === 'advancedheading') {
    const heading = normalizeAdvancedHeading(props)
    return {
      text: heading.text,
      level: heading.level,
      usePresetStyles: heading.style.usePresetStyles,
      fontFamily: heading.style.fontFamily,
      fontSize: heading.style.fontSize,
      fontSizeMobile: heading.style.fontSizeMobile,
      fontSizeTablet: heading.style.fontSizeTablet,
      fontWeight: heading.style.fontWeight,
      lineHeight: heading.style.lineHeight,
      letterSpacing: heading.style.letterSpacing,
      textTransform: heading.style.textTransform,
      textDecoration: heading.style.textDecoration,
      fontStyle: heading.style.fontStyle,
      color: heading.style.color,
      hoverColor: heading.style.hoverColor,
      alignment: heading.style.alignment,
      textAlign: heading.style.alignment,
      textAlignMobile: heading.style.textAlignMobile,
      textAlignTablet: heading.style.textAlignTablet,
      maxWidth: heading.style.maxWidth,
      margin: heading.style.margin,
      padding: heading.style.padding,
      highlightText: heading.highlight.text,
      highlightColor: heading.highlight.color,
      enableSeoChecks: heading.seo.enabled,
      seoMaxLength: heading.seo.maxLength,
      semanticLevel: heading.aria.semanticLevel,
      htmlTag: heading.aria.htmlTag,
      ariaLevel: heading.aria.ariaLevel,
      ariaLabel: heading.aria.ariaLabel,
      role: heading.aria.role,
      autoId: heading.aria.autoId,
      customId: heading.aria.customId,
      className: heading.aria.className,
      dataTracking: heading.aria.dataTracking,
      visible: heading.aria.visible,
      componentId: heading.aria.componentId,
    }
  }

  if (normalizedType === 'advancedcard' || normalizedType === 'advancedcardcomponent' || normalizedType === 'card') {
    const card = normalizeAdvancedCard(props)
    const view = createAdvancedCardView(card, {}, String(card.content.image.src || ''))
    return {
      ...props,
      ...view,
      id: view.id || card.id || '',
      customClass: view.customClass || card.system?.customClass || '',
    }
  }

  if (normalizedType === 'advancedlist' || normalizedType === 'list') {
    const list = normalizeAdvancedList(props)
    return {
      items: list.items,
      listType: list.listType,
      columns: list.style.columns,
      itemSpacing: list.style.itemSpacing,
      gap: list.style.gap,
      padding: list.style.padding,
      margin: list.style.margin,
      alignment: list.style.alignment,
      displayStyle: list.style.displayStyle,
      defaultIcon: list.style.defaultIcon,
      iconSize: list.style.iconSize,
      iconPosition: list.style.iconPosition,
      autoNumbering: list.style.autoNumbering,
      titleFontSize: list.style.titleFontSize,
      titleFontWeight: list.style.titleFontWeight,
      descriptionFontSize: list.style.descriptionFontSize,
      fontFamily: list.style.fontFamily,
      lineHeight: list.style.lineHeight,
      titleColor: list.style.titleColor,
      descriptionColor: list.style.descriptionColor,
      iconColor: list.style.iconColor,
      backgroundColor: list.style.backgroundColor,
      border: list.style.border,
      borderRadius: list.style.borderRadius,
      itemBackground: list.style.itemBackground,
      itemPadding: list.style.itemPadding,
      boxShadow: list.style.boxShadow,
      boxHoverShadow: list.style.boxHoverShadow,
      boxBorderWidth: list.style.boxBorderWidth,
      boxBorderColor: list.style.boxBorderColor,
      fullBoxShadow: list.style.fullBoxShadow,
      fullBoxPadding: list.style.fullBoxPadding,
      fullBoxBackground: list.style.fullBoxBackground,
      fullBoxBorder: list.style.fullBoxBorder,
      fullBoxBorderRadius: list.style.fullBoxBorderRadius,
    }
  }

  if (normalizedType === 'advancedaccordion' || normalizedType === 'accordion') {
    const accordion = normalizeAdvancedAccordion(props)
    return {
      items: accordion.items,
      behavior: accordion.interaction.behavior,
      allowAllClosed: accordion.interaction.allowAllClosed,
      itemSpacing: accordion.style.itemSpacing,
      padding: accordion.style.padding,
      margin: accordion.style.margin,
      titleFontSize: accordion.style.titleFontSize,
      titleFontWeight: accordion.style.titleFontWeight,
      contentFontSize: accordion.style.contentFontSize,
      fontFamily: accordion.style.fontFamily,
      lineHeight: accordion.style.lineHeight,
      titleColor: accordion.style.titleColor,
      titleBackground: accordion.style.titleBackground,
      contentColor: accordion.style.contentColor,
      contentBackground: accordion.style.contentBackground,
      border: accordion.style.border,
      borderRadius: accordion.style.borderRadius,
      activeTitleColor: accordion.style.activeTitleColor,
      activeTitleBackground: accordion.style.activeTitleBackground,
      iconPosition: accordion.interaction.iconPosition,
      icon: accordion.interaction.icon,
      activeIcon: accordion.interaction.activeIcon,
      animation: accordion.interaction.animation,
      animationDuration: accordion.interaction.animationDuration,
    }
  }

  if (normalizedType === 'newgrid' || normalizedType === 'grid') {
    const grid = normalizeNewGrid(props)
    return {
      columns: grid.columns,
      rows: grid.rows,
      gap: grid.gap,
      padding: grid.padding,
      margin: grid.margin,
      backgroundColor: grid.backgroundColor,
      border: grid.border,
      borderRadius: grid.borderRadius,
      gridLineColor: grid.gridLineColor,
      justifyContent: grid.justifyContent,
      alignItems: grid.alignItems,
      mobileColumns: grid.mobileColumns,
      tabletColumns: grid.tabletColumns,
      desktopColumns: grid.desktopColumns,
      hideOnMobile: grid.hideOnMobile,
      hideOnTablet: grid.hideOnTablet,
      draggable: grid.draggable,
      resizable: grid.resizable,
      showGridLines: grid.showGridLines,
      snapToGrid: grid.snapToGrid,
      visible: grid.visible,
      customCSS: grid.customCSS,
      className: grid.className,
      id: grid.id,
      dataAttributes: grid.dataAttributes,
      cells: grid.cells,
      components: grid.components,
    }
  }

  if (normalizedType === 'tabs') {
    const tabs = normalizeTabs(props)
    return {
      tabs: tabs.tabs,
      activeTab: tabs.activeTab,
      ariaLabel: tabs.aria.ariaLabel,
      className: tabs.aria.className,
      customId: tabs.aria.customId,
    }
  }

  if (normalizedType === 'button') {
    const button = normalizeButton(props)
    const variant = button.style?.variant ?? button.variant ?? 'primary'
    const size = button.style?.size ?? button.size ?? 'medium'

    const rawBg = button.style?.backgroundColor ?? button.backgroundColor
    const isDefaultBgOnNonPrimary = variant !== 'primary' && typeof rawBg === 'string' && rawBg.toLowerCase() === '#7c6dfa'
    const editorBg = isDefaultBgOnNonPrimary ? '' : (rawBg ?? '')

    const rawFontSize = button.style?.fontSize ?? button.fontSize
    const isDefaultFontOnNonMedium = size !== 'medium' && rawFontSize === '16px'
    const editorFontSize = isDefaultFontOnNonMedium ? '' : (rawFontSize ?? '')

    const rawPaddingTop = button.style?.paddingTop ?? button.paddingTop
    const isDefaultPadOnNonMedium = size !== 'medium' && rawPaddingTop === '14px'
    const editorPaddingTop = isDefaultPadOnNonMedium ? '' : (rawPaddingTop ?? '')

    return {
      text: button.content?.text ?? button.text,
      link: button.content?.link ?? button.link,
      openInNewTab: button.content?.openInNewTab ?? button.openInNewTab,
      loadingText: button.content?.loadingText ?? button.loadingText,
      ariaLabel: button.content?.ariaLabel ?? button.ariaLabel,
      variant,
      size,
      primaryColor: button.style?.primaryColor ?? button.primaryColor ?? '',
      backgroundColor: editorBg,
      textColor: button.style?.textColor ?? button.textColor ?? '',
      hoverColor: button.style?.hoverColor ?? button.hoverColor ?? '',
      activeColor: button.style?.activeColor ?? button.activeColor ?? '',
      borderColor: button.style?.borderColor ?? button.borderColor ?? '',
      useGradient: button.style?.useGradient ?? button.useGradient ?? false,
      gradientColors: button.style?.gradientColors ?? button.gradientColors ?? '#7f00ff, #e100ff',
      gradientDirection: button.style?.gradientDirection ?? button.gradientDirection ?? '135deg',
      gradientType: button.style?.gradientType ?? button.gradientType ?? 'linear',
      borderRadius: button.style?.borderRadius ?? button.borderRadius ?? '',
      borderWidth: button.style?.borderWidth ?? button.borderWidth ?? '',
      shadow: button.style?.shadow ?? button.shadow ?? 'md',
      alignment: button.style?.alignment ?? button.alignment ?? 'left',
      textAlign: button.style?.textAlign ?? button.textAlign ?? 'left',
      fullWidth: button.style?.fullWidth ?? button.fullWidth ?? false,
      width: button.style?.width ?? button.width ?? 'auto',
      margin: button.style?.margin ?? button.margin ?? '0px',
      padding: button.style?.padding ?? button.padding ?? '',
      marginTop: button.style?.marginTop ?? button.marginTop ?? '0px',
      marginRight: button.style?.marginRight ?? button.marginRight ?? '0px',
      marginBottom: button.style?.marginBottom ?? button.marginBottom ?? '0px',
      marginLeft: button.style?.marginLeft ?? button.marginLeft ?? '0px',
      paddingTop: editorPaddingTop,
      paddingRight: button.style?.paddingRight ?? button.paddingRight ?? '',
      paddingBottom: button.style?.paddingBottom ?? button.paddingBottom ?? '',
      paddingLeft: button.style?.paddingLeft ?? button.paddingLeft ?? '',
      fontFamily: button.style?.fontFamily ?? button.fontFamily ?? '',
      fontSize: editorFontSize,
      fontWeight: button.style?.fontWeight ?? button.fontWeight ?? '600',
      letterSpacing: button.style?.letterSpacing ?? button.letterSpacing ?? '0px',
      textTransform: button.style?.textTransform ?? button.textTransform ?? 'none',
      lineHeight: button.style?.lineHeight ?? button.lineHeight ?? '1.5',
      icon: button.style?.icon ?? button.icon ?? '',
      iconPosition: button.style?.iconPosition ?? button.iconPosition ?? 'left',
      iconSize: button.style?.iconSize ?? button.iconSize ?? '16px',
      iconSpacing: button.style?.iconSpacing ?? button.iconSpacing ?? '8px',
      disabled: button.style?.disabled ?? button.disabled ?? false,
      loading: button.style?.loading ?? button.loading ?? false,
      hoverEffect: button.style?.hoverEffect ?? button.hoverEffect ?? 'scale',
      hoverScale: button.style?.hoverScale ?? button.hoverScale ?? 1.05,
      hoverShadow: button.style?.hoverShadow ?? button.hoverShadow ?? 'lg',
      animationType: button.style?.animationType ?? button.animationType ?? 'none',
      animationDuration: button.style?.animationDuration ?? button.animationDuration ?? '0.3s',
      className: button.style?.className ?? button.className ?? '',
      customClass: button.style?.customClass ?? button.customClass ?? '',
      customId: button.style?.customId ?? button.customId ?? '',
      onClick: button.style?.onClick ?? button.onClick ?? '',
      dataTracking: button.style?.dataTracking ?? button.dataTracking ?? '',
      mobileSize: button.responsive?.mobile?.size ?? button.mobileSize ?? 'medium',
      mobileFullWidth: button.responsive?.mobile?.fullWidth ?? button.mobileFullWidth ?? false,
      hideOnMobile: button.responsive?.mobile?.hidden ?? button.hideOnMobile ?? false,
    }
  }

  if (normalizedType === 'image') {
    const img = normalizeImage(props)
    const shape = img.style?.shape ?? img.shape ?? 'default'
    const rawBorderRadius = img.style?.borderRadius ?? img.borderRadius
    const isDefaultRadius = (shape === 'circle' || shape === 'rounded') && (rawBorderRadius === '0px' || !rawBorderRadius)
    const editorBorderRadius = isDefaultRadius ? '' : (rawBorderRadius ?? '')

    const rawPadding = img.style?.padding ?? img.padding
    const editorPadding = rawPadding === '0px' ? '' : (rawPadding ?? '')

    const showOverlay = Boolean(img.style?.showOverlay ?? img.showOverlay)
    const overlayText = img.style?.overlayText ?? img.overlayText ?? ''

    return {
      src: img.content?.src ?? img.src ?? '',
      alt: img.content?.alt ?? img.alt ?? 'Image',
      linkUrl: img.content?.linkUrl ?? img.linkUrl ?? '',
      openInNewTab: Boolean(img.content?.openInNewTab ?? img.openInNewTab),
      caption: img.content?.caption ?? img.caption ?? '',
      captionPosition: img.content?.captionPosition ?? img.captionPosition ?? 'bottom',
      captionAlignment: img.content?.captionAlignment ?? img.captionAlignment ?? 'center',

      width: img.style?.width ?? img.width ?? '',
      height: img.style?.height ?? img.height ?? '',
      maxWidth: img.style?.maxWidth ?? img.maxWidth ?? '',
      maxHeight: img.style?.maxHeight ?? img.maxHeight ?? '',
      alignment: img.style?.alignment ?? img.alignment ?? 'center',
      objectFit: img.style?.objectFit ?? img.objectFit ?? 'contain',
      objectPosition: img.style?.objectPosition ?? img.objectPosition ?? 'center',
      borderRadius: editorBorderRadius,
      shape,
      customShape: img.style?.customShape ?? img.customShape ?? '',
      showGradientBorder: Boolean(img.style?.showGradientBorder ?? img.showGradientBorder),
      gradientBorderColors: img.style?.gradientBorderColors ?? img.gradientBorderColors ?? '',
      gradientBorderDirection: img.style?.gradientBorderDirection ?? img.gradientBorderDirection ?? '135deg',
      gradientBorderWidth: img.style?.gradientBorderWidth ?? img.gradientBorderWidth ?? '10px',
      gradientBorderType: img.style?.gradientBorderType ?? img.gradientBorderType ?? 'conic',
      shadow: img.style?.shadow ?? img.shadow ?? 'none',
      border: img.style?.border ?? img.border ?? '',
      margin: img.style?.margin ?? img.margin ?? '',
      padding: editorPadding,
      filter: img.style?.filter ?? img.filter ?? '',
      imageZoom: img.style?.imageZoom ?? img.imageZoom ?? 1,
      componentPositionX: img.style?.componentPositionX ?? img.componentPositionX ?? '',
      componentPositionY: img.style?.componentPositionY ?? img.componentPositionY ?? '',
      showOverlay,
      overlayColor: img.style?.overlayColor ?? img.overlayColor ?? '#000000',
      overlayOpacity: img.style?.overlayOpacity ?? img.overlayOpacity ?? 0.3,
      overlayText,
      hoverEffect: img.style?.hoverEffect ?? img.hoverEffect ?? 'none',
      hoverZoom: img.style?.hoverZoom ?? img.hoverZoom ?? 1.1,
      hoverBrightness: img.style?.hoverBrightness ?? img.hoverBrightness ?? 1.2,
      hoverDuration: img.style?.hoverDuration ?? img.hoverDuration ?? 0.3,
      lazyLoad: Boolean(img.style?.lazyLoad ?? img.lazyLoad),
      showLightbox: Boolean(img.style?.showLightbox ?? img.showLightbox),
      className: img.style?.className ?? img.className ?? '',
      customId: img.style?.customId ?? img.customId ?? '',
    }
  }

  const resolvedBlockKey = resolveBlockType(type)
  if (resolvedBlockKey) {
    const defaults = getBlockDefaults(resolvedBlockKey)
    const normalized = normalizeBlockProps(resolvedBlockKey, { ...defaults, ...props })
    return { ...defaults, ...props, ...normalized }
  }

  return props || {}
}

const preparePropsForUpdate = (type: string | undefined, props: Record<string, any>) => {
  const normalizedType = String(type || '').trim().toLowerCase()

  if (normalizedType === 'advancedparagraph' || normalizedType === 'paragraph') {
    return stripEditorMeta(normalizeAdvancedParagraph(props) as Record<string, any>)
  }

  if (normalizedType === 'advancedheading') {
    const normalized = normalizeAdvancedHeading({
      text: props.text,
      level: props.level,
      alignment: props.alignment,
      textAlign: props.alignment,
      textAlignMobile: props.textAlignMobile,
      textAlignTablet: props.textAlignTablet,
      style: {
        usePresetStyles: props.usePresetStyles,
        fontFamily: props.fontFamily,
        fontSize: props.fontSize,
        fontSizeMobile: props.fontSizeMobile,
        fontSizeTablet: props.fontSizeTablet,
        fontWeight: props.fontWeight,
        lineHeight: props.lineHeight,
        letterSpacing: props.letterSpacing,
        textTransform: props.textTransform,
        textDecoration: props.textDecoration,
        fontStyle: props.fontStyle,
        color: props.color,
        hoverColor: props.hoverColor,
        alignment: props.alignment,
        textAlignMobile: props.textAlignMobile,
        textAlignTablet: props.textAlignTablet,
        maxWidth: props.maxWidth,
        margin: props.margin,
        padding: props.padding,
      },
      highlight: {
        text: props.highlightText,
        color: props.highlightColor,
      },
      seo: {
        enabled: props.enableSeoChecks,
        maxLength: props.seoMaxLength,
      },
      aria: {
        visible: props.visible,
        semanticLevel: props.semanticLevel || props.level,
        htmlTag: props.htmlTag,
        ariaLevel: props.ariaLevel,
        ariaLabel: props.ariaLabel,
        role: props.role,
        autoId: props.autoId,
        customId: props.customId,
        className: props.className,
        dataTracking: props.dataTracking,
        componentId: props.componentId,
      },
    })
    return stripEditorMeta(normalized as Record<string, any>)
  }

  if (normalizedType === 'advancedcard' || normalizedType === 'advancedcardcomponent' || normalizedType === 'card') {
    const normalized = normalizeAdvancedCard(props)
    return {
      ...props,
      ...stripEditorMeta(normalized as Record<string, any>),
      textAlignment: props.textAlignment ?? normalized.layout?.textAlignment,
      titleAlignment: props.titleAlignment ?? props.textAlignment ?? normalized.layout?.titleAlignment,
      subtitleAlign: props.subtitleAlign ?? props.textAlignment ?? normalized.layout?.subtitleAlignment,
      descriptionAlign: props.descriptionAlign ?? props.textAlignment ?? normalized.layout?.descriptionAlignment,
      buttonAlignment: props.buttonAlignment ?? normalized.layout?.buttonAlignment,
      buttonFullWidth: Boolean(
        props.buttonFullWidth ??
        normalized.layout?.buttonFullWidth ??
        (props.buttonAlignment === 'full-width' || props.buttonAlignment === 'full')
      ),
      layout: {
        ...(normalized.layout || {}),
        textAlignment: props.textAlignment ?? normalized.layout?.textAlignment ?? 'left',
        titleAlignment: props.titleAlignment ?? props.textAlignment ?? normalized.layout?.titleAlignment ?? 'left',
        subtitleAlignment: props.subtitleAlign ?? props.textAlignment ?? normalized.layout?.subtitleAlignment ?? 'left',
        descriptionAlignment: props.descriptionAlign ?? props.textAlignment ?? normalized.layout?.descriptionAlignment ?? 'left',
        buttonAlignment: props.buttonAlignment ?? normalized.layout?.buttonAlignment ?? 'left',
        buttonFullWidth: Boolean(
          props.buttonFullWidth ??
          normalized.layout?.buttonFullWidth ??
          (props.buttonAlignment === 'full-width' || props.buttonAlignment === 'full')
        ),
      },
    }
  }

  if (normalizedType === 'advancedlist' || normalizedType === 'list') {
    return stripEditorMeta(
      normalizeAdvancedList({
        items: props.items,
        listType: props.listType,
        columns: props.columns,
        itemSpacing: props.itemSpacing,
        gap: props.gap,
        padding: props.padding,
        margin: props.margin,
        alignment: props.alignment,
        displayStyle: props.displayStyle,
        defaultIcon: props.defaultIcon,
        iconSize: props.iconSize,
        iconPosition: props.iconPosition,
        autoNumbering: props.autoNumbering,
        titleFontSize: props.titleFontSize,
        titleFontWeight: props.titleFontWeight,
        descriptionFontSize: props.descriptionFontSize,
        fontFamily: props.fontFamily,
        lineHeight: props.lineHeight,
        titleColor: props.titleColor,
        descriptionColor: props.descriptionColor,
        iconColor: props.iconColor,
        backgroundColor: props.backgroundColor,
        border: props.border,
        borderRadius: props.borderRadius,
        itemBackground: props.itemBackground,
        itemPadding: props.itemPadding,
        boxShadow: props.boxShadow,
        boxHoverShadow: props.boxHoverShadow,
        boxBorderWidth: props.boxBorderWidth,
        boxBorderColor: props.boxBorderColor,
        fullBoxShadow: props.fullBoxShadow,
        fullBoxPadding: props.fullBoxPadding,
        fullBoxBackground: props.fullBoxBackground,
        fullBoxBorder: props.fullBoxBorder,
        fullBoxBorderRadius: props.fullBoxBorderRadius,
      }) as Record<string, any>,
    )
  }

  if (normalizedType === 'advancedaccordion' || normalizedType === 'accordion') {
    return stripEditorMeta(
      normalizeAdvancedAccordion({
        items: props.items,
        behavior: props.behavior,
        allowAllClosed: props.allowAllClosed,
        itemSpacing: props.itemSpacing,
        padding: props.padding,
        margin: props.margin,
        titleFontSize: props.titleFontSize,
        titleFontWeight: props.titleFontWeight,
        contentFontSize: props.contentFontSize,
        fontFamily: props.fontFamily,
        lineHeight: props.lineHeight,
        titleColor: props.titleColor,
        titleBackground: props.titleBackground,
        contentColor: props.contentColor,
        contentBackground: props.contentBackground,
        border: props.border,
        borderRadius: props.borderRadius,
        activeTitleColor: props.activeTitleColor,
        activeTitleBackground: props.activeTitleBackground,
        iconPosition: props.iconPosition,
        icon: props.icon,
        activeIcon: props.activeIcon,
        animation: props.animation,
        animationDuration: props.animationDuration,
      }) as Record<string, any>,
     )
   }

  if (normalizedType === 'newgrid' || normalizedType === 'grid') {
    return stripEditorMeta(normalizeNewGrid(props) as Record<string, any>)
  }

  if (normalizedType === 'tabs') {
    return stripEditorMeta(normalizeTabs(props) as Record<string, any>)
  }

  if (normalizedType === 'button') {
    const toOptionalString = (v: any) => {
      if (v === undefined || v === null) return undefined
      const str = String(v).trim()
      return str.length > 0 ? str : undefined
    }

    const normalized = normalizeButton({
      content: {
        text: props.text,
        link: props.link,
        openInNewTab: props.openInNewTab,
        loadingText: props.loadingText,
        ariaLabel: props.ariaLabel,
      },
      style: {
        variant: props.variant || 'primary',
        size: props.size || 'medium',
        primaryColor: toOptionalString(props.primaryColor),
        backgroundColor: toOptionalString(props.backgroundColor),
        textColor: toOptionalString(props.textColor),
        hoverColor: toOptionalString(props.hoverColor),
        activeColor: toOptionalString(props.activeColor),
        borderColor: toOptionalString(props.borderColor),
        useGradient: props.useGradient,
        gradientColors: props.gradientColors,
        gradientDirection: props.gradientDirection,
        gradientType: props.gradientType,
        borderRadius: toOptionalString(props.borderRadius),
        borderWidth: toOptionalString(props.borderWidth),
        shadow: props.shadow,
        alignment: props.alignment,
        textAlign: props.textAlign,
        fullWidth: props.fullWidth,
        width: props.width,
        margin: props.margin,
        padding: toOptionalString(props.padding),
        marginTop: props.marginTop,
        marginRight: props.marginRight,
        marginBottom: props.marginBottom,
        marginLeft: props.marginLeft,
        paddingTop: toOptionalString(props.paddingTop),
        paddingRight: toOptionalString(props.paddingRight),
        paddingBottom: toOptionalString(props.paddingBottom),
        paddingLeft: toOptionalString(props.paddingLeft),
        fontFamily: toOptionalString(props.fontFamily),
        fontSize: toOptionalString(props.fontSize),
        fontWeight: props.fontWeight,
        letterSpacing: props.letterSpacing,
        textTransform: props.textTransform,
        lineHeight: props.lineHeight,
        icon: props.icon,
        iconPosition: props.iconPosition,
        iconSize: props.iconSize,
        iconSpacing: props.iconSpacing,
        disabled: props.disabled,
        loading: props.loading,
        hoverEffect: props.hoverEffect,
        hoverScale: props.hoverScale,
        hoverShadow: props.hoverShadow,
        animationType: props.animationType,
        animationDuration: props.animationDuration,
        className: props.className,
        customClass: props.customClass,
        customId: props.customId,
        onClick: props.onClick,
        dataTracking: props.dataTracking,
      },
      responsive: {
        desktop: props.responsive?.desktop || {},
        tablet: props.responsive?.tablet || {},
        mobile: {
          size: props.mobileSize,
          fullWidth: props.mobileFullWidth,
          hidden: props.hideOnMobile,
        },
      },
    })
    return stripEditorMeta({
      ...normalized,
      version: 1,
    })
  }

  if (normalizedType === 'image') {
    const toOptionalString = (v: any) => {
      if (v === undefined || v === null) return undefined
      const str = String(v).trim()
      return str.length > 0 ? str : undefined
    }
    const toOptionalNumber = (v: any) => {
      if (v === undefined || v === null || v === '') return undefined
      const num = Number(v)
      return Number.isNaN(num) ? undefined : num
    }

    const showOverlay = Boolean(props.showOverlay)
    const overlayText = toOptionalString(props.overlayText)
    const hasOverlayActive = showOverlay || Boolean(overlayText)

    const normalized = normalizeImage({
      content: {
        src: toOptionalString(props.src) || '',
        alt: toOptionalString(props.alt) || 'Image',
        linkUrl: toOptionalString(props.linkUrl),
        openInNewTab: Boolean(props.openInNewTab),
        caption: toOptionalString(props.caption),
        captionPosition: props.captionPosition || 'bottom',
        captionAlignment: props.captionAlignment || 'center',
      },
      style: {
        width: toOptionalString(props.width),
        height: toOptionalString(props.height),
        maxWidth: toOptionalString(props.maxWidth),
        maxHeight: toOptionalString(props.maxHeight),
        alignment: props.alignment || 'center',
        objectFit: props.objectFit || 'contain',
        objectPosition: toOptionalString(props.objectPosition),
        borderRadius: toOptionalString(props.borderRadius),
        shape: props.shape || 'default',
        customShape: toOptionalString(props.customShape),
        showGradientBorder: Boolean(props.showGradientBorder),
        gradientBorderColors: toOptionalString(props.gradientBorderColors),
        gradientBorderDirection: toOptionalString(props.gradientBorderDirection),
        gradientBorderWidth: toOptionalString(props.gradientBorderWidth),
        gradientBorderType: props.gradientBorderType || 'conic',
        shadow: props.shadow || 'none',
        border: toOptionalString(props.border),
        margin: toOptionalString(props.margin),
        padding: toOptionalString(props.padding),
        filter: toOptionalString(props.filter),
        imageZoom: toOptionalNumber(props.imageZoom),
        componentPositionX: toOptionalString(props.componentPositionX),
        componentPositionY: toOptionalString(props.componentPositionY),
        showOverlay,
        overlayColor: hasOverlayActive ? toOptionalString(props.overlayColor) : undefined,
        overlayOpacity: hasOverlayActive ? toOptionalNumber(props.overlayOpacity) : undefined,
        overlayText,
        hoverEffect: props.hoverEffect || 'none',
        hoverZoom: toOptionalNumber(props.hoverZoom),
        hoverBrightness: toOptionalNumber(props.hoverBrightness),
        hoverDuration: toOptionalNumber(props.hoverDuration),
        lazyLoad: Boolean(props.lazyLoad),
        showLightbox: Boolean(props.showLightbox),
        className: toOptionalString(props.className),
        customId: toOptionalString(props.customId),
      },
      responsive: {
        desktop: props.responsive?.desktop || {},
        tablet: props.responsive?.tablet || {},
        mobile: props.responsive?.mobile || {},
      },
    })

    return stripEditorMeta({
      ...normalized,
      version: 1,
    })
  }

  const resolvedBlockKey = resolveBlockType(type)
  if (resolvedBlockKey) {
    return stripEditorMeta(normalizeBlockProps(resolvedBlockKey, props) as Record<string, any>)
  }

  return props
}

const getSectionRows = (section: any) => {
  if (Array.isArray(section?.container?.rows)) {
    return section.container.rows
  }

  if (Array.isArray(section?.rows)) {
    return section.rows
  }

  return []
}

const findComponentInLayout = (layout: PageLayout, componentId: string): LayoutComponent | null => {
  const search = (component: LayoutComponent | null | undefined): LayoutComponent | null => {
    if (!component) return null
    if (component.id === componentId) return component

    if (component.props?.components) {
      for (const nested of component.props.components) {
        const result = search(nested)
        if (result) return result
      }
    }

    if (component.props?.slides) {
      for (const slide of component.props.slides) {
        for (const nested of slide?.components || []) {
          const result = search(nested)
          if (result) return result
        }
      }
    }

    if (component.props?.cells) {
      for (const row of component.props.cells) {
        for (const cell of row || []) {
          const result = search(cell?.component)
          if (result) return result
        }
      }
    }

    return null
  }

  for (const section of layout?.sections || []) {
    for (const row of getSectionRows(section)) {
      for (const column of row.columns || []) {
        for (const component of column.components || []) {
          const result = search(component)
          if (result) return result
        }
      }
    }
  }

  return null
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  selectedComponent,
  sections = [],
  layout,
  onComponentUpdate,
  selectedSectionId,
  onSectionUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('content')
  const [localProps, setLocalProps] = useState<Record<string, any>>({})
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [aiPrompt, setAiPrompt] = useState('')
  const [expandedCategoryState, setExpandedCategoryState] = useState<Record<string, boolean>>({})
  const sectionDebounceRef = useRef<NodeJS.Timeout>()
  const activeThemeColors = useMemo(() => {
    const colors = layout?.theme?.colors
    if (colors) {
      return [
        colors.primary,
        colors.secondary,
        colors.accent,
        colors.background,
        colors.surface,
        colors.text,
        colors.textMuted,
        colors.border,
      ].filter(Boolean)
    }
    return COLOR_SWATCHES
  }, [layout?.theme?.colors])

  const resolvedComponent = useMemo(() => {
    if (!selectedComponent) return null
    if (layout) return findComponentInLayout(layout, selectedComponent.compId) || selectedComponent.component
    return selectedComponent.component
  }, [layout, selectedComponent])

  const componentDef = useMemo(
    () => (resolvedComponent ? componentRegistry.getComponent(resolvedComponent.type) : null),
    [resolvedComponent],
  )

  useEffect(() => {
    setLocalProps(getEditorPropsForComponent(resolvedComponent?.type, resolvedComponent?.props || {}))
  }, [resolvedComponent])

  useEffect(() => {
    if (!selectedSectionId) {
      setSelectedSection(null)
      return
    }
    setSelectedSection(sections.find((section) => section.id === selectedSectionId) || null)
  }, [sections, selectedSectionId])

  useEffect(() => {
    return () => {
      if (sectionDebounceRef.current) clearTimeout(sectionDebounceRef.current)
    }
  }, [])

  const isPropertyVisible = useCallback(
    (config: any) => {
      if (!config) return false
      if (typeof config.showIf === 'function') {
        try {
          return Boolean(config.showIf(localProps))
        } catch {
          return false
        }
      }
      return true
    },
    [localProps],
  )

  const isPropertyDisabled = useCallback(
    (config: any) => {
      if (!config) return false
      if (typeof config.disabledWhen === 'function') {
        try {
          return Boolean(config.disabledWhen(localProps))
        } catch {
          return false
        }
      }
      return false
    },
    [localProps],
  )

  const groupedProperties = useMemo(() => {
    const groups = {
      content: [] as Array<{ name: string; config: any }>,
      style: [] as Array<{ name: string; config: any }>,
    }

    if (!componentDef?.schema?.properties) return groups

    Object.entries(componentDef.schema.properties).forEach(([name, config]) => {
      if (!isPropertyVisible(config)) return
      const low = name.toLowerCase()
      if (['font', 'color', 'align', 'padding', 'margin', 'border', 'radius', 'opacity', 'background'].some((key) => low.includes(key))) {
        groups.style.push({ name, config })
      } else {
        groups.content.push({ name, config })
      }
    })

    return groups
  }, [componentDef, isPropertyVisible])

  const usedProps = new Set([
    'text',
    'title',
    'headingText',
    'content',
    'label',
    'level',
    'semanticLevel',
    'fontFamily',
    'fontSize',
    'size',
    'fontWeight',
    'weight',
    'lineHeight',
    'textAlign',
    'align',
    'color',
    'marginTop',
    'marginBottom',
    'padding',
    'opacity',
    'borderRadius',
    'borderStyle',
    'customCSS',
  ])

  const handlePropChange = useCallback(
    (propName: string, value: any) => {
      if (!selectedComponent || !resolvedComponent) return
      const nextEditorProps = { ...localProps, [propName]: value }
      if (propName === 'level') nextEditorProps.semanticLevel = value
      if (propName === 'fullWidth') {
        nextEditorProps.width = value ? '100%' : 'auto'
      }
      if (propName === 'width') {
        if (value === '100%') {
          nextEditorProps.fullWidth = true
        } else if (value && value !== '100%') {
          nextEditorProps.fullWidth = false
        }
      }
      if (propName === 'alignment' && String(resolvedComponent?.type || '').toLowerCase() === 'advancedheading') {
        if (!localProps.textAlignTablet || localProps.textAlignTablet === localProps.alignment || localProps.textAlignTablet === 'left') {
          nextEditorProps.textAlignTablet = value
        }
        if (!localProps.textAlignMobile || localProps.textAlignMobile === localProps.alignment || localProps.textAlignMobile === 'center') {
          nextEditorProps.textAlignMobile = value
        }
      }
      const compType = String(resolvedComponent?.type || '').toLowerCase()
      const isCard = compType === 'advancedcard' || compType === 'advancedcardcomponent' || compType === 'card'
      if (isCard) {
        if (propName === 'textAlignment') {
          nextEditorProps.titleAlignment = value
          nextEditorProps.subtitleAlign = value
          nextEditorProps.descriptionAlign = value
          nextEditorProps.alignment = value
          if (nextEditorProps.layout) {
            nextEditorProps.layout = {
              ...nextEditorProps.layout,
              textAlignment: value,
              titleAlignment: value,
              subtitleAlignment: value,
              descriptionAlignment: value,
              alignment: value,
            }
          }
        }
        if (propName === 'buttonAlignment') {
          const isFull = value === 'full-width' || value === 'full'
          nextEditorProps.buttonFullWidth = isFull
          if (nextEditorProps.layout) {
            nextEditorProps.layout = {
              ...nextEditorProps.layout,
              buttonAlignment: value,
              buttonFullWidth: isFull,
            }
          }
        }
        if (propName === 'buttonFullWidth') {
          if (value) {
            nextEditorProps.buttonAlignment = 'full-width'
          } else if (nextEditorProps.buttonAlignment === 'full-width' || nextEditorProps.buttonAlignment === 'full') {
            nextEditorProps.buttonAlignment = 'left'
          }
          if (nextEditorProps.layout) {
            nextEditorProps.layout = {
              ...nextEditorProps.layout,
              buttonFullWidth: Boolean(value),
              buttonAlignment: value ? 'full-width' : (nextEditorProps.buttonAlignment || 'left'),
            }
          }
        }
      }
      setLocalProps(nextEditorProps)
      onComponentUpdate?.(
        resolvedComponent.id || selectedComponent.compId,
        preparePropsForUpdate(resolvedComponent.type, nextEditorProps),
      )
    },
    [localProps, onComponentUpdate, resolvedComponent, selectedComponent],
  )

  const handleSectionUpdate = useCallback(
    (sectionId: string, updates: any) => {
      if (!onSectionUpdate) return
      if (sectionDebounceRef.current) clearTimeout(sectionDebounceRef.current)
      sectionDebounceRef.current = setTimeout(() => onSectionUpdate(sectionId, updates), 220)
    },
    [onSectionUpdate],
  )

  const levelValue = localProps.level || localProps.semanticLevel || 'h1'
  const normalizedComponentType = String(resolvedComponent?.type || '').toLowerCase()
  const isAdvancedCard = normalizedComponentType === 'advancedcard' || normalizedComponentType === 'card' || normalizedComponentType === 'advancedcardcomponent'
  const isAdvancedHeading = normalizedComponentType === 'advancedheading'
  const isAdvancedParagraph = normalizedComponentType === 'advancedparagraph' || normalizedComponentType === 'paragraph'

  const schemaCategories = useMemo(() => {
    const rawCategories = Array.isArray(componentDef?.schema?.categories) ? componentDef.schema.categories : []

    if (rawCategories.length > 0) {
      return rawCategories.map((category: any) => ({
        id: String(category?.id || category?.label || 'group').trim().toLowerCase(),
        label: String(category?.label || category?.id || 'Group'),
        expanded: category?.expanded !== false,
      }))
    }

    if (componentDef?.schema?.properties) {
      const discovered = new Map<string, { id: string; label: string; expanded: boolean }>()
      Object.values(componentDef.schema.properties).forEach((prop: any) => {
        const cat = prop?.category
        if (cat && typeof cat === 'string' && cat.trim()) {
          const id = cat.trim().toLowerCase().replace(/\s+/g, '-')
          if (!discovered.has(id)) {
            discovered.set(id, { id, label: cat.trim(), expanded: discovered.size === 0 })
          }
        }
      })
      if (discovered.size > 0) {
        return Array.from(discovered.values())
      }
    }

    return []
  }, [componentDef])

  const usesSchemaAccordion = isAdvancedCard || isAdvancedHeading || isAdvancedParagraph || schemaCategories.length > 0

  const schemaGroupedFields = useMemo(() => {
    const groups = new Map<string, Array<{ name: string; config: any }>>()

    if (!componentDef?.schema?.properties) {
      return groups
    }

    const knownCategoryIds = new Set(schemaCategories.map((category) => category.id.toLowerCase()))

    Object.entries(componentDef.schema.properties).forEach(([name, config]) => {
      if (!isPropertyVisible(config)) return

      const rawCat = String(config?.category || '').trim().toLowerCase().replace(/\s+/g, '-')
      const fallbackCat = schemaCategories[0]?.id || 'general'
      const resolvedCategory = knownCategoryIds.has(rawCat) ? rawCat : fallbackCat
      const existing = groups.get(resolvedCategory) || []
      existing.push({ name, config })
      groups.set(resolvedCategory, existing)
    })

    return groups
  }, [componentDef, isPropertyVisible, schemaCategories])

  useEffect(() => {
    if (!schemaCategories.length) {
      setExpandedCategoryState({})
      return
    }

    const nextState = schemaCategories.reduce<Record<string, boolean>>((accumulator, category) => {
      accumulator[category.id] = category.expanded ?? false
      return accumulator
    }, {})

    if (schemaCategories.length > 0 && !Object.values(nextState).some(Boolean)) {
      nextState[schemaCategories[0].id] = true
    }

    setExpandedCategoryState(nextState)
  }, [resolvedComponent?.id, schemaCategories])

  useEffect(() => {
    if (usesSchemaAccordion && activeTab === 'style') {
      setActiveTab('content')
    }
  }, [activeTab, usesSchemaAccordion])

  const getDefaultHeadingSize = (level: string) => {
    const sizeMap: Record<string, number> = {
      h1: 36,
      h2: 24,
      h3: 17,
      h4: 15,
      h5: 14,
      h6: 12,
    }
    return sizeMap[level] || 24
  }

  const parseFontSize = (value: any) => {
    if (value === undefined || value === null) return undefined
    if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
    const str = String(value).trim()
    if (!str) return undefined
    if (/^-?\d+(\.\d+)?$/.test(str)) return Number(str)
    if (/^-?\d+(\.\d+)?px$/i.test(str)) return parseFloat(str)
    return undefined
  }

  const parseNumberValue = (value: any, fallback: number) => {
    const parsed = parseFontSize(value)
    return parsed ?? fallback
  }

  const parseLineHeight = (value: any) => {
    if (value === undefined || value === null) return 1.2
    const parsed = Number.parseFloat(String(value))
    return Number.isFinite(parsed) ? parsed : 1.2
  }

  const explicitFontSize = parseFontSize(localProps.fontSize ?? localProps.size)
  const fontSize = explicitFontSize ?? (isAdvancedHeading ? getDefaultHeadingSize(levelValue) : 50)
  const fontFamily = localProps.fontFamily || (isAdvancedHeading ? "'DM Sans', system-ui, sans-serif" : 'Inter')
  const fontWeight = String(localProps.fontWeight || localProps.weight || 600)
  const textAlign = String(localProps.textAlign || localProps.align || 'left')
  const colorValue = String(localProps.color || '#ffffff')
  const lineHeightValue = parseLineHeight(localProps.lineHeight)
  const marginTopValue = parseNumberValue(localProps.marginTop, 0)
  const marginBottomValue = parseNumberValue(localProps.marginBottom, 16)
  const paddingValue = String(localProps.padding ?? '24')
  const opacityValue = Number(localProps.opacity ?? 100)
  const radiusValue = Number(localProps.borderRadius ?? 0)
  const borderStyle = String(localProps.borderStyle || 'solid').toLowerCase()
  const sectionSettings = (selectedSection?.settings || {}) as Record<string, any>
  const sectionPaddingValue = String(sectionSettings.padding ?? 24)
  const sectionOpacityValue = Number(sectionSettings.opacity ?? 100)
  const sectionRadiusValue = Number(sectionSettings.borderRadius ?? 0)
  const sectionBorderStyle = String(sectionSettings.borderStyle || (sectionSettings.borderWidth ? 'solid' : 'none')).toLowerCase()

  const extraContentFields = groupedProperties.content.filter(({ name }) => !usedProps.has(name))
  const extraStyleFields = groupedProperties.style.filter(({ name }) => !usedProps.has(name))
  const groupedContentFields = useMemo(() => {
    const groups = new Map<string, Array<{ name: string; config: any }>>()
    if (!componentDef?.schema?.properties) return groups

    const labelForCategory = (value: string) => {
      const normalized = value.trim().toLowerCase()
      if (normalized === 'content') return 'Content'
      if (normalized === 'style') return 'Style'
      if (normalized === 'layout') return 'Layout'
      if (normalized === 'typography') return 'Typography'
      if (normalized === 'colors' || normalized === 'color') return 'Color'
      if (normalized === 'spacing') return 'Spacing'
      if (normalized === 'effects') return 'Effects'
      if (normalized === 'advanced') return 'Advanced'
      if (normalized === 'responsive') return 'Responsive'
      if (normalized === 'position') return 'Position'
      if (normalized === 'behavior') return 'Behavior'
      return value
    }

    Object.entries(componentDef.schema.properties).forEach(([name, config]) => {
      if (!isPropertyVisible(config)) return
      const rawCategory = String(config?.category || 'Content')
      const category = labelForCategory(rawCategory)
      const existing = groups.get(category) || []
      existing.push({ name, config })
      groups.set(category, existing)
    })

    const ordered = new Map<string, Array<{ name: string; config: any }>>()
    const categoryOrder = [
      'General',
      'Options',
      'Dropdown',
      'Multi-select',
      'Checkbox Group',
      'Radio Group',
      'Toggle',
      'Sort',
      'Tag Chips',
      'Range',
      'Search',
      'Behavior',
      'Layout',
      'Accessibility',
      'Content',
      'Typography',
      'Color',
      'Spacing',
      'Effects',
      'Responsive',
      'Position',
      'Style',
      'Advanced',
    ]
    categoryOrder.forEach((category) => {
      const fields = groups.get(category)
      if (fields?.length) ordered.set(category, fields)
    })
    groups.forEach((fields, category) => {
      if (!ordered.has(category)) ordered.set(category, fields)
    })

    return ordered
  }, [componentDef, localProps, isPropertyVisible])
  const isSwiper = resolvedComponent?.type === 'swipercontainer'
  const swiperSlides = Array.isArray(localProps.slides) ? localProps.slides : []
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(selectedComponent?.slideIndex ?? 0)

  useEffect(() => {
    if (!isSwiper) return
    setActiveSlideIndex(selectedComponent?.slideIndex ?? 0)
  }, [isSwiper, selectedComponent?.slideIndex, resolvedComponent?.id])

  useEffect(() => {
    if (!isSwiper) return
    if (!swiperSlides.length) return
    if (activeSlideIndex >= swiperSlides.length) {
      setActiveSlideIndex(Math.max(0, swiperSlides.length - 1))
    }
  }, [activeSlideIndex, isSwiper, swiperSlides.length])

  const activeSlide = isSwiper && swiperSlides.length ? swiperSlides[activeSlideIndex] : null

  const updateSlideProp = (key: string, value: any) => {
    if (!isSwiper) return
    if (!swiperSlides.length) return
    const nextSlides = swiperSlides.map((slide: any, idx: number) => (idx === activeSlideIndex ? { ...slide, [key]: value } : slide))
    handlePropChange('slides', nextSlides)
  }

  const applySlidePreset = (preset: Record<string, any>) => {
    if (!isSwiper) return
    if (!swiperSlides.length) return
    const nextSlides = swiperSlides.map((slide: any, idx: number) => (idx === activeSlideIndex ? { ...slide, ...preset } : slide))
    handlePropChange('slides', nextSlides)
  }

  const slidePresets = [
    {
      id: 'hero',
      label: 'Hero',
      apply: {
        bgType: 'gradient',
        bgGradient: 'linear-gradient(135deg, #1a1628, #22263a)',
        bgColor: '#13161e',
        bgImage: '',
        bgOverlay: false,
      },
    },
    {
      id: 'dark',
      label: 'Dark',
      apply: {
        bgType: 'color',
        bgColor: '#13161e',
        bgGradient: '',
        bgImage: '',
        bgOverlay: false,
      },
    },
    {
      id: 'gradient',
      label: 'Gradient',
      apply: {
        bgType: 'gradient',
        bgGradient: 'linear-gradient(135deg, rgba(124,109,250,0.35), rgba(26,29,40,0.95))',
        bgColor: '#13161e',
        bgImage: '',
        bgOverlay: false,
      },
    },
    {
      id: 'image',
      label: 'Image Overlay',
      apply: {
        bgType: 'image',
        bgImage:
          'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80',
        bgGradient: '',
        bgOverlay: true,
        bgOverlayColor: '#000000',
        bgOverlayOpacity: 0.45,
      },
    },
  ]

  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategoryState((current) => ({
      ...current,
      [categoryId]: !current[categoryId],
    }))
  }, [])

  const renderSchemaAccordion = useCallback(() => {
    if (!schemaCategories.length) {
      return <div className="note-ok">No editable settings are available for this component.</div>
    }

    const visibleCategoryIds = schemaCategories.filter((category) => {
      const fields = schemaGroupedFields.get(category.id)
      return Boolean(fields?.length)
    })

    if (!visibleCategoryIds.length) {
      return <div className="note-ok">No editable settings are available for this component.</div>
    }

    return (
      <div className="rp-accordion-stack" style={{ display: 'grid', gap: 12 }}>
        {visibleCategoryIds.map((category) => {
          const fields = schemaGroupedFields.get(category.id) || []
          const isExpanded = expandedCategoryState[category.id] ?? category.expanded

          return (
            <div
              key={category.id}
              className="rp-group"
              style={{
                border: '1px solid rgba(148, 163, 184, 0.18)',
                borderRadius: 16,
                overflow: 'hidden',
                background: 'rgba(15, 23, 42, 0.28)',
              }}>
              <button
                type="button"
                onClick={() => toggleCategory(category.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '14px 16px',
                  background: 'transparent',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}>
                <span className="rp-group-label" style={{ marginBottom: 0 }}>{category.label}</span>
                <span
                  aria-hidden="true"
                  style={{
                    fontSize: 12,
                    opacity: 0.72,
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}>
                  v
                </span>
              </button>

              {isExpanded ? (
                <div style={{ padding: '0 16px 16px' }}>
                  {fields.map(({ name, config }) => (
                    <PropertyField
                      key={name}
                      propName={name}
                      config={config}
                      value={localProps[name] ?? config.default}
                      onChange={(value) => handlePropChange(name, value)}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    )
  }, [expandedCategoryState, handlePropChange, localProps, schemaCategories, schemaGroupedFields, toggleCategory])

  if (!selectedComponent && !selectedSectionId) {
    return (
      <div className="right-inner">
        <div className="rp-empty">
          <div className="rp-empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 3 4.5 7v10L12 21l7.5-4V7L12 3Z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
              <path d="M12 12v9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
              <path d="m4.5 7 7.5 5 7.5-5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
            </svg>
          </div>
          <p>Select a component to edit its properties</p>
          <span>Click a section, container, or component on the canvas to load its settings here.</span>
        </div>
      </div>
    )
  }

  if (selectedSectionId && !selectedComponent && selectedSection && onSectionUpdate) {
    const sectionName = selectedSection.name || ''
    const sectionType = selectedSection.type || 'custom'

    return (
      <div className="right-inner">
        <div className="rp-top">
          <div className="rp-eye">Selected section</div>
          <div className="rp-name">Section settings</div>
          <div className="rp-sub">{`${sectionType} · ${selectedSection.id}`}</div>
        </div>

        <div className="rp-body rp-panel-scroll">
          <div className="rp-form">
            <div className="rp-card">
              <div className="rp-section-title">
                <div className="rp-section-title-main">Section identity</div>
                <div className="rp-section-title-sub">Name the section and choose the schema used for its properties.</div>
              </div>

              <div className="rp-field">
                <label>Section Name</label>
                <input
                  className="rp-input"
                  value={sectionName}
                  onChange={(event) => onSectionUpdate(selectedSection.id, { name: event.target.value })}
                  placeholder="Enter section name"
                />
              </div>

              <div className="rp-field">
                <label>Section Type</label>
                <select
                  className="rp-select"
                  value={sectionType}
                  onChange={(event) => {
                    const nextType = event.target.value
                    onSectionUpdate(selectedSection.id, {
                      type: nextType,
                      props: sanitizeSectionProps(nextType, nextType === selectedSection.type ? selectedSection.props : {}),
                    })
                  }}>
                  <option value="custom">Custom</option>
                  {sectionSchemaList.map((definition: any) => (
                    <option key={definition.type} value={definition.type}>
                      {definition.label}
                    </option>
                  ))}
                </select>
                <div className="note-ok">These settings save to the section itself, not just the component inside it.</div>
              </div>
            </div>

            <div className="rp-tabs">
              {[
                { id: 'content' as const, label: 'Content' },
                { id: 'style' as const, label: 'Style' },
                { id: 'ai' as const, label: 'AI +' },
              ].map((tab) => (
                <button key={tab.id} type="button" className={`rptab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          {activeTab === 'content' ? <SectionProperties key={selectedSection.id} section={selectedSection} onUpdate={handleSectionUpdate} /> : null}

          {activeTab === 'style' ? (
            <div className="rp-form">
              <div className="frow">
                <label className="flbl">Background Color</label>
                <div className="color-row">
                  <input
                    type="color"
                    className="colorinp"
                    value={sectionSettings.backgroundColor || '#13161e'}
                    onChange={(event) => handleSectionUpdate(selectedSection.id, { settings: { backgroundColor: event.target.value } })}
                  />
                  <input
                    type="text"
                    className="rp-input fi"
                    value={sectionSettings.backgroundColor || '#13161e'}
                    onChange={(event) => handleSectionUpdate(selectedSection.id, { settings: { backgroundColor: event.target.value } })}
                  />
                </div>
                <div className="chips" style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                  {activeThemeColors.map((swatch) => (
                    <button
                      key={swatch}
                      type="button"
                      onClick={() => handleSectionUpdate(selectedSection.id, { settings: { backgroundColor: swatch } })}
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        backgroundColor: swatch,
                        border: sectionSettings.backgroundColor === swatch ? '2px solid #7c6dfa' : '1px solid rgba(255,255,255,0.12)',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                      title={swatch}
                    />
                  ))}
                </div>
              </div>
              <div className="frow">
                <label className="flbl">Padding</label>
                <div className="pad-box">
                  <input className="pad-in top" value={sectionPaddingValue} onChange={(event) => handleSectionUpdate(selectedSection.id, { settings: { padding: event.target.value } })} />
                  <input className="pad-in left" value={sectionPaddingValue} onChange={(event) => handleSectionUpdate(selectedSection.id, { settings: { padding: event.target.value } })} />
                  <div className="pad-center">section</div>
                  <input className="pad-in right" value={sectionPaddingValue} onChange={(event) => handleSectionUpdate(selectedSection.id, { settings: { padding: event.target.value } })} />
                  <input className="pad-in bottom" value={sectionPaddingValue} onChange={(event) => handleSectionUpdate(selectedSection.id, { settings: { padding: event.target.value } })} />
                </div>
              </div>

              <div className="frow">
                <div className="flbl-row">
                  <label className="flbl">Opacity</label>
                  <span className="rangeval">{sectionOpacityValue}%</span>
                </div>
                <input
                  className="rangeinp"
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={sectionOpacityValue}
                  onChange={(event) => handleSectionUpdate(selectedSection.id, { settings: { opacity: Number(event.target.value) } })}
                />
              </div>

              <div className="frow">
                <div className="flbl-row">
                  <label className="flbl">Border Radius</label>
                  <span className="rangeval">{sectionRadiusValue}px</span>
                </div>
                <input
                  className="rangeinp"
                  type="range"
                  min="0"
                  max="32"
                  step="1"
                  value={sectionRadiusValue}
                  onChange={(event) => handleSectionUpdate(selectedSection.id, { settings: { borderRadius: Number(event.target.value) } })}
                />
              </div>

              <div className="frow">
                <label className="flbl">Border Type</label>
                <div className="chips">
                  {['none', 'solid', 'dashed'].map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`chip ${sectionBorderStyle === value ? 'on' : ''}`}
                      onClick={() =>
                        handleSectionUpdate(selectedSection.id, {
                          settings: {
                            borderStyle: value,
                            borderWidth: value === 'none' ? 0 : 1,
                          },
                        })
                      }>
                      {value[0].toUpperCase() + value.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="frow">
                <label className="flbl">Custom CSS</label>
                <textarea
                  className="ta css-mini"
                  rows={4}
                  value={sectionSettings.customCSS || ''}
                  placeholder="/* custom styles */"
                  onChange={(event) => handleSectionUpdate(selectedSection.id, { settings: { customCSS: event.target.value } })}
                />
              </div>
            </div>
          ) : null}

          {activeTab === 'ai' ? (
            <div className="rp-form">
              <div className="ai-box">
                <div className="ai-lbl">✦ AI Editor</div>
                <textarea className="ta ai-ta" rows={3} value={aiPrompt} placeholder="Describe change…" onChange={(event) => setAiPrompt(event.target.value)} />
                <button type="button" className="gbtn primary w-full justify-center" onClick={() => setAiPrompt(aiPrompt)}>
                  Generate ✦
                </button>
              </div>

              <div className="quick-label">Quick Prompts</div>
              <div className="quick-tags">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className="ai-tag"
                    onClick={() => setAiPrompt((value) => (value ? `${value} ${prompt}` : prompt))}>
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  if (!selectedComponent || !resolvedComponent || !componentDef) {
    return (
      <div className="right-inner">
        <div className="rp-empty">
          <div className="rp-empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 3 4.5 7v10L12 21l7.5-4V7L12 3Z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
              <path d="M12 12v9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
              <path d="m4.5 7 7.5 5 7.5-5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
            </svg>
          </div>
          <p>Select a component to edit its properties</p>
          <span>Click a section, container, or component on the canvas to load its settings here.</span>
        </div>
      </div>
    )
  }


  return (
    <div className="right-inner">
      <div className="rp-top">
        <div className="rp-eye">Selected component</div>
        <div className="rp-name">{componentDef.name}</div>
        <div className="rp-sub">{`${componentDef.name} · ${selectedSection?.name || 'Section'}`}</div>
      </div>

      <div className="rp-tabs">
        {(usesSchemaAccordion
          ? [
              { id: 'content' as const, label: 'Settings' },
              { id: 'ai' as const, label: 'AI +' },
            ]
          : [
              { id: 'content' as const, label: 'Content' },
              { id: 'style' as const, label: 'Style' },
              { id: 'ai' as const, label: 'AI +' },
            ]).map((tab) => (
          <button key={tab.id} type="button" className={`rptab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rp-body rp-panel-scroll">
        {activeTab === 'content' ? (
          <div className="rp-form">
            {usesSchemaAccordion ? (
              renderSchemaAccordion()
            ) : (
              <>
                {Array.from(groupedContentFields.entries()).length ? (
                  Array.from(groupedContentFields.entries()).map(([groupName, fields]) => (
                    <div key={groupName} className="rp-group">
                      <div className="rp-group-label">{groupName}</div>
                      {fields.map(({ name, config }) => (
                        <PropertyField key={name} propName={name} config={config} value={localProps[name] ?? config.default} onChange={(value) => handlePropChange(name, value)} />
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="note-ok">No editable content fields for this component.</div>
                )}
              </>
            )}
          </div>
        ) : null}

        {activeTab === 'style' ? (
          <div className="rp-form">
            <div className="rp-section-title">
              <div className="rp-section-title-main">Layout</div>
              <div className="rp-section-title-sub">Spacing and structure for the selected element.</div>
            </div>

            <div className="frow">
              <label className="flbl">Padding</label>
              <div className="pad-box">
                <input className="pad-in top" value={paddingValue} onChange={(event) => handlePropChange('padding', event.target.value)} />
                <input className="pad-in left" value={paddingValue} onChange={(event) => handlePropChange('padding', event.target.value)} />
                <div className="pad-center">content</div>
                <input className="pad-in right" value={paddingValue} onChange={(event) => handlePropChange('padding', event.target.value)} />
                <input className="pad-in bottom" value={paddingValue} onChange={(event) => handlePropChange('padding', event.target.value)} />
              </div>
            </div>

            <div className="rp-section-title rp-section-tight">
              <div className="rp-section-title-main">Surface</div>
              <div className="rp-section-title-sub">Opacity, rounding, and border behavior.</div>
            </div>

            <div className="frow">
              <div className="flbl-row">
                <label className="flbl">Opacity</label>
                <span className="rangeval">{opacityValue}%</span>
              </div>
              <input className="rangeinp" type="range" min="0" max="100" step="1" value={opacityValue} onChange={(event) => handlePropChange('opacity', Number(event.target.value))} />
            </div>

            <div className="frow">
              <div className="flbl-row">
                <label className="flbl">Border Radius</label>
                <span className="rangeval">{radiusValue}px</span>
              </div>
              <input className="rangeinp" type="range" min="0" max="32" step="1" value={radiusValue} onChange={(event) => handlePropChange('borderRadius', Number(event.target.value))} />
            </div>

            <div className="frow">
              <label className="flbl">Border Style</label>
              <div className="chips">
                {['none', 'solid', 'dashed'].map((value) => (
                  <button key={value} type="button" className={`chip ${borderStyle === value ? 'on' : ''}`} onClick={() => handlePropChange('borderStyle', value)}>
                    {value[0].toUpperCase() + value.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="rp-section-title rp-section-tight">
              <div className="rp-section-title-main">Theme Colors</div>
              <div className="rp-section-title-sub">Quick colors from theme ({layout?.theme?.preset ? (THEME_PRESETS[layout.theme.preset]?.name || layout.theme.preset) : 'Default Theme'})</div>
            </div>

            <div className="frow">
              <label className="flbl">Apply Color Token</label>
              <div className="chips" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {activeThemeColors.map((swatch) => (
                  <button
                    key={swatch}
                    type="button"
                    className="chip"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 8px',
                      background: 'rgba(255,255,255,0.05)',
                    }}
                    onClick={() => {
                      if (localProps.color !== undefined || !localProps.backgroundColor) {
                        handlePropChange('color', swatch)
                      } else {
                        handlePropChange('backgroundColor', swatch)
                      }
                    }}>
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 3,
                        backgroundColor: swatch,
                        display: 'inline-block',
                      }}
                    />
                    <span style={{ fontSize: 11 }}>{swatch}</span>
                  </button>
                ))}
              </div>
            </div>

            {isSwiper ? (
              <>
                <div className="rp-section-title rp-section-tight">
                  <div className="rp-section-title-main">Slide Background</div>
                  <div className="rp-section-title-sub">Per-slide color, image, gradient, and overlay controls.</div>
                </div>

                {swiperSlides.length ? (
                  <>
                    <div className="frow">
                      <label className="flbl">Slide</label>
                      <select
                        className="fi"
                        value={activeSlideIndex}
                        onChange={(event) => setActiveSlideIndex(Number(event.target.value))}>
                        {swiperSlides.map((slide: any, idx: number) => (
                          <option key={slide.id || `slide-${idx}`} value={idx}>
                            {`Slide ${idx + 1}${slide?.title ? ` · ${slide.title}` : ''}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="frow">
                      <label className="flbl">Background Type</label>
                      <select
                        className="fi"
                        value={activeSlide?.bgType || 'color'}
                        onChange={(event) => updateSlideProp('bgType', event.target.value)}>
                        <option value="color">Color</option>
                        <option value="image">Image</option>
                        <option value="gradient">Gradient</option>
                      </select>
                    </div>

                    <div className="frow">
                      <label className="flbl">Presets</label>
                      <div className="chips">
                        {slidePresets.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            className="chip"
                            onClick={() => {
                              applySlidePreset(preset.apply)
                            }}>
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {activeSlide?.bgType !== 'image' && activeSlide?.bgType !== 'gradient' ? (
                      <div className="frow">
                        <label className="flbl">Background Color</label>
                        <div className="color-row">
                          <input
                            type="color"
                            value={activeSlide?.bgColor || '#13161e'}
                            onChange={(event) => updateSlideProp('bgColor', event.target.value)}
                            className="colorinp"
                          />
                          <input
                            type="text"
                            value={activeSlide?.bgColor || '#13161e'}
                            onChange={(event) => updateSlideProp('bgColor', event.target.value)}
                            className="fi"
                          />
                        </div>
                      </div>
                    ) : null}

                    {activeSlide?.bgType === 'image' ? (
                      <div className="frow">
                        <label className="flbl">Background Image URL</label>
                        <input
                          className="fi"
                          value={activeSlide?.bgImage || ''}
                          onChange={(event) => updateSlideProp('bgImage', event.target.value)}
                          placeholder="https://example.com/hero.jpg"
                        />
                      </div>
                    ) : null}

                    {activeSlide?.bgType === 'gradient' ? (
                      <div className="frow">
                        <label className="flbl">Background Gradient</label>
                        <input
                          className="fi"
                          value={activeSlide?.bgGradient || ''}
                          onChange={(event) => updateSlideProp('bgGradient', event.target.value)}
                          placeholder="linear-gradient(135deg, #1a1628, #22263a)"
                        />
                      </div>
                    ) : null}

                    <div className="frow">
                      <label className="toggle-row">
                        <input
                          type="checkbox"
                          checked={Boolean(activeSlide?.bgOverlay)}
                          onChange={(event) => updateSlideProp('bgOverlay', event.target.checked)}
                          className="toggleinp"
                        />
                        <span className="flbl !mb-0">Overlay</span>
                      </label>
                    </div>

                    {activeSlide?.bgOverlay ? (
                      <>
                        <div className="frow">
                          <label className="flbl">Overlay Color</label>
                          <div className="color-row">
                            <input
                              type="color"
                              value={activeSlide?.bgOverlayColor || '#000000'}
                              onChange={(event) => updateSlideProp('bgOverlayColor', event.target.value)}
                              className="colorinp"
                            />
                            <input
                              type="text"
                              value={activeSlide?.bgOverlayColor || '#000000'}
                              onChange={(event) => updateSlideProp('bgOverlayColor', event.target.value)}
                              className="fi"
                            />
                          </div>
                        </div>

                        <div className="frow">
                          <div className="flbl-row">
                            <label className="flbl">Overlay Opacity</label>
                            <span className="rangeval">{Math.round((activeSlide?.bgOverlayOpacity ?? 0.4) * 100)}%</span>
                          </div>
                          <input
                            className="rangeinp"
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={activeSlide?.bgOverlayOpacity ?? 0.4}
                            onChange={(event) => updateSlideProp('bgOverlayOpacity', Number(event.target.value))}
                          />
                        </div>
                      </>
                    ) : null}
                  </>
                ) : (
                  <div className="note-ok">Add a slide first to edit per-slide backgrounds.</div>
                )}
              </>
            ) : null}

            <div className="rp-section-title rp-section-tight">
              <div className="rp-section-title-main">Advanced</div>
              <div className="rp-section-title-sub">Custom CSS and component-specific extras.</div>
            </div>

            <div className="frow">
              <label className="flbl">Custom CSS</label>
              <textarea className="ta css-mini" rows={4} value={localProps.customCSS || ''} placeholder="/* custom styles */" onChange={(event) => handlePropChange('customCSS', event.target.value)} />
            </div>

            {extraStyleFields.length ? extraStyleFields.map(({ name, config }) => (
              <PropertyField key={name} propName={name} config={config} value={localProps[name] ?? config.default} onChange={(value) => handlePropChange(name, value)} />
            )) : null}
          </div>
        ) : null}

        {activeTab === 'ai' ? (
          <div className="rp-form">
            <div className="ai-box">
              <div className="ai-lbl">✦ AI Editor</div>
              <textarea className="ta ai-ta" rows={3} value={aiPrompt} placeholder="Describe change…" onChange={(event) => setAiPrompt(event.target.value)} />
              <button type="button" className="gbtn primary w-full justify-center" onClick={() => setAiPrompt(aiPrompt)}>
                Generate ✦
              </button>
            </div>

            <div className="quick-label">Quick Prompts</div>
            <div className="quick-tags">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="ai-tag"
                  onClick={() => setAiPrompt((value) => (value ? `${value} ${prompt}` : prompt))}>
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
