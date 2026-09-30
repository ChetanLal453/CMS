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
import { normalizeContainer } from '../../../../../shared/blocks/container/normalize'
import { normalizeSpacer } from '../../../../../shared/blocks/spacer/normalize'
import { normalizeIcon } from '../../../../../shared/blocks/icon/normalize'
import { normalizeDivider } from '../../../../../shared/blocks/divider/normalize'
import { normalizeQuote } from '../../../../../shared/blocks/quote/normalize'
import { normalizeVideo } from '../../../../../shared/blocks/video/normalize'
import { normalizeFilter } from '../../../../../shared/blocks/filter/normalize'
import { normalizeSwiperContainer } from '../../../../../shared/blocks/swipercontainer/normalize'
import { normalizeFlexbox } from '../../../../../shared/blocks/flexbox/normalize'
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
    const allowedFormatsArray =
      paragraph.content?.allowedFormats ??
      paragraph.aria?.allowedFormats ??
      ['bold', 'italic', 'underline', 'color']
    return {
      text: paragraph.content?.text ?? paragraph.text ?? '',
      enableRichText: paragraph.content?.enableRichText ?? paragraph.aria?.enableRichText ?? true,
      allowedFormats: Array.isArray(allowedFormatsArray) ? allowedFormatsArray.join(', ') : String(allowedFormatsArray || ''),
      fontSize: paragraph.style?.fontSize ?? paragraph.fontSize ?? '',
      fontWeight: paragraph.style?.fontWeight ?? paragraph.fontWeight ?? '',
      fontFamily: paragraph.style?.fontFamily ?? paragraph.fontFamily ?? '',
      lineHeight: paragraph.style?.lineHeight ?? paragraph.lineHeight ?? '',
      letterSpacing: paragraph.style?.letterSpacing ?? paragraph.letterSpacing ?? '',
      textTransform: paragraph.style?.textTransform ?? paragraph.textTransform ?? 'none',
      textDecoration: paragraph.style?.textDecoration ?? paragraph.textDecoration ?? 'none',
      fontStyle: paragraph.style?.fontStyle ?? paragraph.fontStyle ?? 'normal',
      textColor: paragraph.style?.color ?? paragraph.textColor ?? paragraph.color ?? '',
      backgroundColor: paragraph.style?.backgroundColor ?? paragraph.backgroundColor ?? '',
      border: paragraph.style?.border ?? paragraph.border ?? '',
      borderRadius: paragraph.style?.borderRadius ?? paragraph.borderRadius ?? '',
      borderColor: paragraph.style?.borderColor ?? paragraph.borderColor ?? '',
      textShadow: paragraph.style?.textShadow ?? paragraph.textShadow ?? '',
      boxShadow: paragraph.style?.boxShadow ?? paragraph.boxShadow ?? '',
      opacity: paragraph.style?.opacity ?? paragraph.opacity ?? 1,
      textAlign: paragraph.style?.alignment ?? paragraph.layout?.alignment ?? paragraph.alignment ?? 'left',
      alignment: paragraph.style?.alignment ?? paragraph.layout?.alignment ?? paragraph.alignment ?? 'left',
      margin: paragraph.style?.margin ?? paragraph.margin ?? '',
      padding: paragraph.style?.padding ?? paragraph.padding ?? '',
      width: paragraph.style?.width ?? paragraph.width ?? '',
      maxWidth: paragraph.style?.maxWidth ?? paragraph.maxWidth ?? '',
      minHeight: paragraph.style?.minHeight ?? paragraph.minHeight ?? '',
      display: paragraph.style?.display ?? paragraph.display ?? 'block',
      fontSizeMobile: paragraph.responsive?.fontSizeMobile ?? paragraph.style?.fontSizeMobile ?? paragraph.fontSizeMobile ?? '',
      fontSizeTablet: paragraph.responsive?.fontSizeTablet ?? paragraph.style?.fontSizeTablet ?? paragraph.fontSizeTablet ?? '',
      textAlignMobile: paragraph.responsive?.textAlignMobile ?? paragraph.style?.textAlignMobile ?? paragraph.textAlignMobile ?? 'left',
      textAlignTablet: paragraph.responsive?.textAlignTablet ?? paragraph.style?.textAlignTablet ?? paragraph.textAlignTablet ?? 'left',
      lineHeightMobile: paragraph.responsive?.lineHeightMobile ?? paragraph.style?.lineHeightMobile ?? paragraph.lineHeightMobile ?? '',
      hoverEffect: paragraph.style?.hoverEffect ?? paragraph.interaction?.hover?.effect ?? paragraph.hoverEffect ?? 'none',
      hoverTextColor: paragraph.style?.hoverColor ?? paragraph.interaction?.hover?.color ?? paragraph.hoverTextColor ?? '',
      hoverBackgroundColor: paragraph.style?.hoverBackgroundColor ?? paragraph.interaction?.hover?.backgroundColor ?? paragraph.hoverBackgroundColor ?? '',
      transition: paragraph.style?.transition ?? paragraph.transition ?? '',
      ariaLabel: paragraph.style?.ariaLabel ?? paragraph.aria?.ariaLabel ?? paragraph.ariaLabel ?? '',
      role: paragraph.style?.role ?? paragraph.aria?.role ?? paragraph.role ?? '',
      tabIndex: paragraph.style?.tabIndex ?? paragraph.aria?.tabIndex ?? paragraph.tabIndex ?? 0,
      className: paragraph.style?.className ?? paragraph.aria?.className ?? paragraph.className ?? '',
      customId: paragraph.style?.customId ?? paragraph.aria?.customId ?? paragraph.customId ?? '',
      selectable: paragraph.style?.selectable ?? paragraph.aria?.selectable ?? paragraph.selectable ?? true,
      editable: paragraph.style?.editable ?? paragraph.aria?.editable ?? paragraph.editable ?? true,
      truncate: paragraph.style?.truncate ?? paragraph.aria?.truncate ?? paragraph.truncate ?? false,
      maxLines: paragraph.style?.maxLines ?? paragraph.aria?.maxLines ?? paragraph.maxLines ?? 0,
      visible: paragraph.style?.visible ?? paragraph.aria?.visible ?? paragraph.visible ?? true,
      componentId: paragraph.aria?.componentId ?? paragraph.componentId ?? '',
    }
  }

  if (normalizedType === 'advancedheading') {
    const heading = normalizeAdvancedHeading(props)
    return {
      text: heading.content?.text ?? heading.text ?? '',
      level: heading.content?.level ?? heading.level ?? 'h2',
      usePresetStyles: heading.style?.usePresetStyles ?? heading.usePresetStyles ?? true,
      fontFamily: heading.style?.fontFamily ?? heading.fontFamily ?? '',
      fontSize: heading.style?.fontSize ?? heading.fontSize ?? '',
      fontSizeMobile: heading.responsive?.fontSizeMobile ?? heading.style?.fontSizeMobile ?? heading.fontSizeMobile ?? '',
      fontSizeTablet: heading.responsive?.fontSizeTablet ?? heading.style?.fontSizeTablet ?? heading.fontSizeTablet ?? '',
      fontWeight: heading.style?.fontWeight ?? heading.fontWeight ?? '',
      lineHeight: heading.style?.lineHeight ?? heading.lineHeight ?? '',
      letterSpacing: heading.style?.letterSpacing ?? heading.letterSpacing ?? '',
      textTransform: heading.style?.textTransform ?? heading.textTransform ?? 'none',
      textDecoration: heading.style?.textDecoration ?? heading.textDecoration ?? 'none',
      fontStyle: heading.style?.fontStyle ?? heading.fontStyle ?? 'normal',
      color: heading.style?.color ?? heading.color ?? '',
      hoverColor: heading.style?.hoverColor ?? heading.hoverColor ?? '',
      alignment: heading.style?.alignment ?? heading.alignment ?? heading.textAlign ?? 'left',
      textAlign: heading.style?.alignment ?? heading.alignment ?? heading.textAlign ?? 'left',
      textAlignMobile: heading.responsive?.textAlignMobile ?? heading.style?.textAlignMobile ?? heading.textAlignMobile ?? 'center',
      textAlignTablet: heading.responsive?.textAlignTablet ?? heading.style?.textAlignTablet ?? heading.textAlignTablet ?? 'left',
      maxWidth: heading.style?.maxWidth ?? heading.maxWidth ?? '',
      margin: heading.style?.margin ?? heading.margin ?? '',
      padding: heading.style?.padding ?? heading.padding ?? '',
      highlightText: heading.content?.highlightText ?? heading.highlight?.text ?? heading.highlightText ?? '',
      highlightColor: heading.content?.highlightColor ?? heading.highlight?.color ?? heading.highlightColor ?? '',
      enableSeoChecks: heading.content?.seoEnabled ?? heading.seo?.enabled ?? heading.enableSeoChecks ?? true,
      seoMaxLength: heading.content?.seoMaxLength ?? heading.seo?.maxLength ?? heading.seoMaxLength ?? 60,
      semanticLevel: heading.style?.htmlTag ?? heading.aria?.semanticLevel ?? heading.semanticLevel ?? heading.level ?? 'h2',
      htmlTag: heading.style?.htmlTag ?? heading.aria?.htmlTag ?? heading.htmlTag ?? 'auto',
      ariaLevel: heading.style?.ariaLevel ?? heading.aria?.ariaLevel ?? heading.ariaLevel ?? 2,
      ariaLabel: heading.style?.ariaLabel ?? heading.aria?.ariaLabel ?? heading.ariaLabel ?? '',
      role: heading.style?.role ?? heading.aria?.role ?? heading.role ?? '',
      autoId: heading.aria?.autoId ?? heading.autoId ?? true,
      customId: heading.style?.customId ?? heading.aria?.customId ?? heading.customId ?? '',
      className: heading.style?.className ?? heading.aria?.className ?? heading.className ?? '',
      dataTracking: heading.style?.dataTracking ?? heading.aria?.dataTracking ?? heading.dataTracking ?? '',
      visible: heading.style?.visible ?? heading.aria?.visible ?? heading.visible ?? true,
      componentId: heading.aria?.componentId ?? heading.componentId ?? '',
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
      items: list.content?.items ?? list.items,
      listType: list.content?.listType ?? list.listType,
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
      items: accordion.content?.items ?? accordion.items,
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
      cells: grid.content?.cells ?? grid.cells,
      components: grid.content?.components ?? grid.components,
    }
  }

  if (normalizedType === 'tabs') {
    const tabs = normalizeTabs(props)
    return {
      tabs: tabs.content?.tabs ?? tabs.tabs,
      activeTab: tabs.content?.activeTab ?? tabs.activeTab,
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

  if (normalizedType === 'container') {
    const cont = normalizeContainer(props)
    return {
      children: (Array.isArray(cont.children) && cont.children.length > 0 ? cont.children : cont.content?.children) ?? cont.children ?? [],
      maxWidth: cont.style?.maxWidth ?? cont.maxWidth ?? '',
      width: cont.style?.width ?? cont.width ?? '',
      minHeight: cont.style?.minHeight ?? cont.minHeight ?? '',
      padding: cont.style?.padding ?? cont.padding ?? '',
      margin: cont.style?.margin ?? cont.margin ?? '',
      backgroundColor: cont.style?.backgroundColor ?? cont.backgroundColor ?? '',
      borderRadius: cont.style?.borderRadius ?? cont.borderRadius ?? '',
      border: cont.style?.border ?? cont.border ?? '',
      borderColor: cont.style?.borderColor ?? cont.borderColor ?? '',
      shadow: cont.style?.shadow ?? cont.shadow ?? '',
      alignment: cont.style?.alignment ?? cont.alignment ?? 'center',
      textAlign: cont.style?.textAlign ?? cont.textAlign ?? 'center',
      className: cont.style?.className ?? cont.className ?? '',
      content: (typeof cont.content === 'object' ? cont.content?.content : cont.content) ?? '',
    }
  }

  if (normalizedType === 'spacer') {
    const sp = normalizeSpacer(props)
    return {
      height: sp.style?.height ?? sp.height ?? '32px',
      mobileHeight: sp.responsive?.mobile?.height ?? sp.mobileHeight ?? '',
      tabletHeight: sp.responsive?.tablet?.height ?? sp.tabletHeight ?? '',
      desktopHeight: sp.responsive?.desktop?.height ?? sp.desktopHeight ?? '',
      visibility: sp.visibility ?? true,
      backgroundColor: sp.style?.backgroundColor ?? sp.backgroundColor ?? '',
      showInEditor: sp.style?.showInEditor ?? sp.showInEditor ?? true,
      className: sp.style?.className ?? sp.className ?? '',
    }
  }

  if (normalizedType === 'icon') {
    const ic = normalizeIcon(props)
    return {
      name: ic.content?.name ?? ic.name ?? 'star',
      icon: ic.content?.name ?? ic.name ?? 'star',
      size: ic.style?.size ?? ic.size ?? '24px',
      color: ic.style?.color ?? ic.color ?? '#000000',
      className: ic.style?.className ?? ic.className ?? '',
    }
  }

  if (normalizedType === 'divider') {
    const div = normalizeDivider(props)
    return {
      thickness: div.style?.thickness ?? div.thickness ?? '1px',
      color: div.style?.color ?? div.color ?? '#cccccc',
      width: div.style?.width ?? div.width ?? '100%',
      margin: div.style?.margin ?? div.margin ?? '20px 0',
      className: div.style?.className ?? div.className ?? '',
    }
  }

  if (normalizedType === 'quote') {
    const q = normalizeQuote(props)
    return {
      text: (typeof q.content === 'object' ? q.content?.text : q.content) ?? q.text ?? '"This is a quote or testimonial text."',
      author: (typeof q.content === 'object' ? q.content?.author : undefined) ?? q.author ?? 'Author Name',
      align: q.style?.align ?? q.align ?? 'center',
      alignment: q.style?.alignment ?? q.alignment ?? 'center',
      textAlign: q.style?.textAlign ?? q.textAlign ?? 'center',
      margin: q.style?.margin ?? q.margin ?? '20px 0',
      color: q.style?.color ?? q.color ?? '#374151',
      fontSize: q.style?.fontSize ?? q.fontSize ?? '18px',
      lineHeight: q.style?.lineHeight ?? q.lineHeight ?? '1.7',
      className: q.style?.className ?? q.className ?? '',
    }
  }

  if (normalizedType === 'video') {
    const v = normalizeVideo(props)
    return {
      src: v.content?.src ?? v.src ?? '',
      sourceType: v.content?.sourceType ?? v.sourceType ?? 'auto',
      title: v.content?.title ?? v.title ?? 'Video',
      autoplay: v.content?.autoplay ?? v.autoplay ?? false,
      muted: v.content?.muted ?? v.muted ?? false,
      controls: v.content?.controls ?? v.controls ?? true,
      loop: v.content?.loop ?? v.loop ?? false,
      width: v.style?.width ?? v.width ?? '100%',
      maxWidth: v.style?.maxWidth ?? v.maxWidth ?? '100%',
      aspectRatio: v.style?.aspectRatio ?? v.aspectRatio ?? '16 / 9',
      margin: v.style?.margin ?? v.margin ?? '0 auto',
      borderRadius: v.style?.borderRadius ?? v.borderRadius ?? 10,
      borderColor: v.style?.borderColor ?? v.borderColor ?? '#ffffff',
      borderOpacity: v.style?.borderOpacity ?? v.borderOpacity ?? 13,
      accentColor: v.style?.accentColor ?? v.accentColor ?? '#7c6dfa',
      showOverlay: v.style?.showOverlay ?? v.showOverlay ?? true,
      overlayStrength: v.style?.overlayStrength ?? v.overlayStrength ?? 10,
      showPreviewChrome: v.style?.showPreviewChrome ?? v.showPreviewChrome ?? true,
      previewProgress: v.style?.previewProgress ?? v.previewProgress ?? 35,
      previewTime: v.style?.previewTime ?? v.previewTime ?? '1:24 / 4:05',
      objectFit: v.style?.objectFit ?? v.objectFit ?? 'cover',
      className: v.style?.className ?? v.className ?? '',
    }
  }

  if (normalizedType === 'filter') {
    const f = normalizeFilter(props)
    return {
      filterType: f.content?.filterType ?? f.filterType,
      filterKey: f.content?.filterKey ?? f.filterKey,
      bindTo: f.content?.bindTo ?? f.bindTo,
      label: f.content?.label ?? f.label,
      helpText: f.content?.helpText ?? f.helpText,
      placeholder: f.content?.placeholder ?? f.placeholder,
      defaultValue: f.content?.defaultValue ?? f.defaultValue,
      defaultChecked: f.content?.defaultChecked ?? f.defaultChecked,
      value: f.content?.value ?? f.value,
      sourceType: f.content?.sourceType ?? f.sourceType,
      presetKey: f.content?.presetKey ?? f.presetKey,
      options: f.content?.options ?? f.options,
      apiEndpoint: f.content?.apiEndpoint ?? f.apiEndpoint,
      apiMethod: f.content?.apiMethod ?? f.apiMethod,
      apiLabelField: f.content?.apiLabelField ?? f.apiLabelField,
      apiValueField: f.content?.apiValueField ?? f.apiValueField,
      min: f.content?.min ?? f.min,
      max: f.content?.max ?? f.max,
      step: f.content?.step ?? f.step,
      rangeMode: f.content?.rangeMode ?? f.rangeMode,
      prefix: f.content?.prefix ?? f.prefix,
      suffix: f.content?.suffix ?? f.suffix,
      defaultSort: f.content?.defaultSort ?? f.defaultSort,
      sortField: f.content?.sortField ?? f.sortField,
      sortDirection: f.content?.sortDirection ?? f.sortDirection,
      onLabel: f.content?.onLabel ?? f.onLabel,
      offLabel: f.content?.offLabel ?? f.offLabel,
      selectAllLabel: f.content?.selectAllLabel ?? f.selectAllLabel,
      applyButtonLabel: f.content?.applyButtonLabel ?? f.applyButtonLabel,
      sectionTitle: f.content?.sectionTitle ?? f.sectionTitle,
      dependsOn: f.content?.dependsOn ?? f.dependsOn,
      visibleWhen: f.content?.visibleWhen ?? f.visibleWhen,
      disabledWhen: f.content?.disabledWhen ?? f.disabledWhen,
      storageKey: f.content?.storageKey ?? f.storageKey,
      queryParam: f.content?.queryParam ?? f.queryParam,
      emitEventName: f.content?.emitEventName ?? f.emitEventName,
      variant: f.style?.variant ?? f.variant,
      size: f.style?.size ?? f.size,
      density: f.style?.density ?? f.density,
      fullWidth: f.style?.fullWidth ?? f.fullWidth,
      labelPosition: f.style?.labelPosition ?? f.labelPosition,
      orientation: f.style?.orientation ?? f.orientation,
      mobileVariant: f.style?.mobileVariant ?? f.mobileVariant,
      desktopVariant: f.style?.desktopVariant ?? f.desktopVariant,
      columns: f.style?.columns ?? f.columns,
      inline: f.style?.inline ?? f.inline,
      radioStyle: f.style?.radioStyle ?? f.radioStyle,
      toggleColor: f.style?.toggleColor ?? f.toggleColor,
      chipStyle: f.style?.chipStyle ?? f.chipStyle,
      chipVariant: f.style?.chipVariant ?? f.chipVariant,
      showLabel: f.style?.showLabel ?? f.showLabel,
      showClearButton: f.style?.showClearButton ?? f.showClearButton,
      showStateLabel: f.style?.showStateLabel ?? f.showStateLabel,
      showSelectedCount: f.style?.showSelectedCount ?? f.showSelectedCount,
      showTooltip: f.style?.showTooltip ?? f.showTooltip,
      showTicks: f.style?.showTicks ?? f.showTicks,
      showMinMaxLabels: f.style?.showMinMaxLabels ?? f.showMinMaxLabels,
      showDivider: f.style?.showDivider ?? f.showDivider,
      sticky: f.style?.sticky ?? f.sticky,
      collapsedByDefault: f.style?.collapsedByDefault ?? f.collapsedByDefault,
      disabled: f.style?.disabled ?? f.disabled,
      required: f.style?.required ?? f.required,
      clearable: f.style?.clearable ?? f.clearable,
      searchable: f.style?.searchable ?? f.searchable,
      closeMenuOnSelect: f.style?.closeMenuOnSelect ?? f.closeMenuOnSelect,
      maxSelections: f.style?.maxSelections ?? f.maxSelections,
      selectAllEnabled: f.style?.selectAllEnabled ?? f.selectAllEnabled,
      allowMultiple: f.style?.allowMultiple ?? f.allowMultiple,
      removable: f.style?.removable ?? f.removable,
      debounceMs: f.style?.debounceMs ?? f.debounceMs,
      autoFocus: f.style?.autoFocus ?? f.autoFocus,
      persistState: f.style?.persistState ?? f.persistState,
      syncWithUrl: f.style?.syncWithUrl ?? f.syncWithUrl,
      autoApply: f.style?.autoApply ?? f.autoApply,
      resetOnChange: f.style?.resetOnChange ?? f.resetOnChange,
      reloadOptionsOnDependencyChange: f.style?.reloadOptionsOnDependencyChange ?? f.reloadOptionsOnDependencyChange,
      className: f.style?.className ?? f.className,
      wrapperClassName: f.style?.wrapperClassName ?? f.wrapperClassName,
      ariaLabel: f.style?.ariaLabel ?? f.ariaLabel,
      ariaDescription: f.style?.ariaDescription ?? f.ariaDescription,
      tabIndex: f.style?.tabIndex ?? f.tabIndex,
    }
  }

  if (normalizedType === 'swipercontainer') {
    const swiper = normalizeSwiperContainer(props)
    return {
      slides: swiper.content?.slides ?? swiper.slides ?? [],
      autoplay: swiper.content?.autoplay ?? swiper.autoplay ?? true,
      autoplayDelay: swiper.content?.autoplayDelay ?? swiper.autoplayDelay ?? 3000,
      loop: swiper.content?.loop ?? swiper.loop ?? false,
      speed: swiper.content?.speed ?? swiper.speed ?? 300,
      direction: swiper.content?.direction ?? swiper.direction ?? 'horizontal',
      draggable: swiper.content?.draggable ?? swiper.draggable ?? true,
      grabCursor: swiper.content?.grabCursor ?? swiper.grabCursor ?? true,
      freeMode: swiper.content?.freeMode ?? swiper.freeMode ?? false,
      mousewheel: swiper.content?.mousewheel ?? swiper.mousewheel ?? false,
      keyboard: swiper.content?.keyboard ?? swiper.keyboard ?? false,
      navigation: swiper.content?.navigation ?? swiper.navigation ?? true,
      pagination: swiper.content?.pagination ?? swiper.pagination ?? true,
      scrollbar: swiper.content?.scrollbar ?? swiper.scrollbar ?? false,
      scrollbarDraggable: swiper.content?.scrollbarDraggable ?? swiper.scrollbarDraggable ?? true,
      parallax: swiper.content?.parallax ?? swiper.parallax ?? false,
      parallaxBackground: swiper.content?.parallaxBackground ?? swiper.parallaxBackground ?? '',

      slidesPerView: swiper.style?.slidesPerView ?? swiper.slidesPerView ?? 1,
      slidesPerGroup: swiper.style?.slidesPerGroup ?? swiper.slidesPerGroup ?? 1,
      spaceBetween: swiper.style?.spaceBetween ?? swiper.spaceBetween ?? 30,
      centeredSlides: swiper.style?.centeredSlides ?? swiper.centeredSlides ?? false,
      height: swiper.style?.height ?? swiper.height ?? 'auto',
      width: swiper.style?.width ?? swiper.width ?? '100%',
      slideWidth: swiper.style?.slideWidth ?? swiper.slideWidth ?? '',
      slideMinHeight: swiper.style?.slideMinHeight ?? swiper.slideMinHeight ?? '',
      backgroundColor: swiper.style?.backgroundColor ?? swiper.backgroundColor ?? '',
      padding: swiper.style?.padding ?? swiper.padding ?? '',
      borderRadius: swiper.style?.borderRadius ?? swiper.borderRadius ?? '',
      arrowStyle: swiper.style?.arrowStyle ?? swiper.arrowStyle ?? 'rounded',
      arrowPosition: swiper.style?.arrowPosition ?? swiper.arrowPosition ?? 'sides',
      paginationType: swiper.style?.paginationType ?? swiper.paginationType ?? 'bullets',
      paginationDynamic: swiper.style?.paginationDynamic ?? swiper.paginationDynamic ?? false,
      paginationClickable: swiper.style?.paginationClickable ?? swiper.paginationClickable ?? true,
      effect: swiper.style?.effect ?? swiper.effect ?? 'slide',
      effectFadeCrossFade: swiper.style?.effectFadeCrossFade ?? swiper.effectFadeCrossFade ?? false,
      effectCubeShadow: swiper.style?.effectCubeShadow ?? swiper.effectCubeShadow ?? true,
      effectCubeSlideShadows: swiper.style?.effectCubeSlideShadows ?? swiper.effectCubeSlideShadows ?? true,
      effectCoverflowRotate: swiper.style?.effectCoverflowRotate ?? swiper.effectCoverflowRotate ?? 50,
      effectCoverflowDepth: swiper.style?.effectCoverflowDepth ?? swiper.effectCoverflowDepth ?? 100,
      effectCoverflowStretch: swiper.style?.effectCoverflowStretch ?? swiper.effectCoverflowStretch ?? 0,
      effectCoverflowModifier: swiper.style?.effectCoverflowModifier ?? swiper.effectCoverflowModifier ?? 1,
      effectFlipSlideShadows: swiper.style?.effectFlipSlideShadows ?? swiper.effectFlipSlideShadows ?? true,
      effectCardsPerSlideOffset: swiper.style?.effectCardsPerSlideOffset ?? swiper.effectCardsPerSlideOffset ?? 8,
      effectCardsRotate: swiper.style?.effectCardsRotate ?? swiper.effectCardsRotate ?? true,
      hoverEffects: swiper.style?.hoverEffects ?? swiper.hoverEffects ?? false,
      hoverEffectType: swiper.style?.hoverEffectType ?? swiper.hoverEffectType ?? 'lift',
      hoverIntensity: swiper.style?.hoverIntensity ?? swiper.hoverIntensity ?? 5,
      className: swiper.style?.className ?? swiper.className ?? '',
    }
  }

  if (normalizedType === 'flexbox') {
    const flex = normalizeFlexbox(props)
    return {
      children: (Array.isArray(flex.children) && flex.children.length > 0 ? flex.children : flex.content?.children) ?? flex.children ?? [],
      preset: flex.content?.preset ?? flex.preset ?? 'custom',
      direction: flex.style?.direction ?? flex.direction ?? 'row',
      justifyContent: flex.style?.justifyContent ?? flex.justifyContent ?? 'flex-start',
      alignItems: flex.style?.alignItems ?? flex.alignItems ?? 'stretch',
      alignContent: flex.style?.alignContent ?? flex.alignContent ?? 'stretch',
      wrap: flex.style?.wrap ?? flex.wrap ?? 'nowrap',
      gap: flex.style?.gap ?? flex.gap ?? '16px',
      rowGap: flex.style?.rowGap ?? flex.rowGap ?? '16px',
      columnGap: flex.style?.columnGap ?? flex.columnGap ?? '16px',
      padding: flex.style?.padding ?? flex.padding ?? '16px',
      minHeight: flex.style?.minHeight ?? flex.minHeight ?? 'auto',
      backgroundColor: flex.style?.backgroundColor ?? flex.backgroundColor ?? '#ffffff',
      borderRadius: flex.style?.borderRadius ?? flex.borderRadius ?? '0px',
      border: flex.style?.border ?? flex.border ?? 'none',
      shadow: flex.style?.shadow ?? flex.shadow ?? 'none',
      width: flex.style?.width ?? flex.width ?? '100%',
      maxWidth: flex.style?.maxWidth ?? flex.maxWidth ?? 'none',
      className: flex.style?.className ?? flex.className ?? '',
      stackOnMobile: flex.responsive?.stackOnMobile ?? flex.stackOnMobile ?? true,
      directionMobile: flex.responsive?.directionMobile ?? flex.directionMobile ?? 'column',
      mobileGap: flex.responsive?.mobileGap ?? flex.mobileGap ?? '12px',
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

    const contentInput = props.content && typeof props.content === 'object' ? props.content : {}
    const styleInput = props.style && typeof props.style === 'object' ? props.style : {}
    const layoutInput = props.layout && typeof props.layout === 'object' ? props.layout : {}
    const responsiveInput = props.responsive && typeof props.responsive === 'object' ? props.responsive : {}
    const interactionInput = props.interaction && typeof props.interaction === 'object' ? props.interaction : {}
    const hoverInput = interactionInput.hover && typeof interactionInput.hover === 'object' ? interactionInput.hover : {}
    const ariaInput = props.aria && typeof props.aria === 'object' ? props.aria : {}

    const text = toOptionalString(contentInput.text ?? props.text ?? props.content ?? props.html)
    const enableRichText = contentInput.enableRichText ?? ariaInput.enableRichText ?? props.enableRichText
    const rawAllowedFormats = contentInput.allowedFormats ?? ariaInput.allowedFormats ?? props.allowedFormats
    const allowedFormats = Array.isArray(rawAllowedFormats)
      ? rawAllowedFormats
      : typeof rawAllowedFormats === 'string' && rawAllowedFormats.trim().length > 0
        ? rawAllowedFormats.split(',').map((s: string) => s.trim()).filter(Boolean)
        : undefined

    const normalized = normalizeAdvancedParagraph({
      version: 1,
      content: {
        text,
        enableRichText: enableRichText !== undefined ? Boolean(enableRichText) : undefined,
        allowedFormats,
      },
      style: {
        color: toOptionalString(styleInput.color ?? props.color ?? props.textColor ?? props.fontColor),
        fontSize: toOptionalString(styleInput.fontSize ?? props.fontSize),
        fontWeight: toOptionalString(styleInput.fontWeight ?? props.fontWeight),
        fontFamily: toOptionalString(styleInput.fontFamily ?? props.fontFamily),
        lineHeight: toOptionalString(styleInput.lineHeight ?? props.lineHeight),
        letterSpacing: toOptionalString(styleInput.letterSpacing ?? props.letterSpacing),
        maxWidth: toOptionalString(styleInput.maxWidth ?? props.maxWidth),
        backgroundColor: toOptionalString(styleInput.backgroundColor ?? props.backgroundColor),
        margin: toOptionalString(styleInput.margin ?? props.margin),
        padding: toOptionalString(styleInput.padding ?? props.padding),
        width: toOptionalString(styleInput.width ?? props.width),
        minHeight: toOptionalString(styleInput.minHeight ?? props.minHeight),
        display: styleInput.display ?? props.display,
        border: toOptionalString(styleInput.border ?? props.border),
        borderRadius: toOptionalString(styleInput.borderRadius ?? props.borderRadius),
        borderColor: toOptionalString(styleInput.borderColor ?? props.borderColor),
        textShadow: toOptionalString(styleInput.textShadow ?? props.textShadow),
        boxShadow: toOptionalString(styleInput.boxShadow ?? props.boxShadow),
        opacity: toOptionalNumber(styleInput.opacity ?? props.opacity),
        textTransform: styleInput.textTransform ?? props.textTransform,
        textDecoration: styleInput.textDecoration ?? props.textDecoration,
        fontStyle: styleInput.fontStyle ?? props.fontStyle,
        transition: toOptionalString(styleInput.transition ?? props.transition),
        alignment: styleInput.alignment ?? layoutInput.alignment ?? props.alignment ?? props.textAlign ?? props.align,
        hoverEffect: styleInput.hoverEffect ?? hoverInput.effect ?? props.hoverEffect,
        hoverColor: toOptionalString(styleInput.hoverColor ?? hoverInput.color ?? props.hoverColor ?? props.hoverTextColor),
        hoverBackgroundColor: toOptionalString(styleInput.hoverBackgroundColor ?? hoverInput.backgroundColor ?? props.hoverBackgroundColor),
        className: toOptionalString(styleInput.className ?? ariaInput.className ?? props.className),
        customId: toOptionalString(styleInput.customId ?? ariaInput.customId ?? props.customId),
        selectable: styleInput.selectable ?? ariaInput.selectable ?? props.selectable,
        editable: styleInput.editable ?? ariaInput.editable ?? props.editable,
        truncate: styleInput.truncate ?? ariaInput.truncate ?? props.truncate,
        maxLines: toOptionalNumber(styleInput.maxLines ?? ariaInput.maxLines ?? props.maxLines),
        visible: styleInput.visible ?? ariaInput.visible ?? props.visible,
        ariaLabel: toOptionalString(styleInput.ariaLabel ?? ariaInput.ariaLabel ?? props.ariaLabel),
        role: toOptionalString(styleInput.role ?? ariaInput.role ?? props.role),
        tabIndex: toOptionalNumber(styleInput.tabIndex ?? ariaInput.tabIndex ?? props.tabIndex),
      },
      responsive: {
        fontSizeMobile: toOptionalString(responsiveInput.fontSizeMobile ?? styleInput.fontSizeMobile ?? props.fontSizeMobile),
        fontSizeTablet: toOptionalString(responsiveInput.fontSizeTablet ?? styleInput.fontSizeTablet ?? props.fontSizeTablet),
        textAlignMobile: responsiveInput.textAlignMobile ?? styleInput.textAlignMobile ?? props.textAlignMobile,
        textAlignTablet: responsiveInput.textAlignTablet ?? styleInput.textAlignTablet ?? props.textAlignTablet,
        lineHeightMobile: toOptionalString(responsiveInput.lineHeightMobile ?? styleInput.lineHeightMobile ?? props.lineHeightMobile),
        desktop: responsiveInput.desktop || {},
        tablet: responsiveInput.tablet || {},
        mobile: responsiveInput.mobile || {},
      },
    })
    return stripEditorMeta({
      ...normalized,
      version: 1,
    })
  }

  if (normalizedType === 'advancedheading') {
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

    const contentInput = props.content && typeof props.content === 'object' ? props.content : {}
    const styleInput = props.style && typeof props.style === 'object' ? props.style : {}
    const responsiveInput = props.responsive && typeof props.responsive === 'object' ? props.responsive : {}
    const highlightInput = props.highlight && typeof props.highlight === 'object' ? props.highlight : {}
    const seoInput = props.seo && typeof props.seo === 'object' ? props.seo : {}
    const ariaInput = props.aria && typeof props.aria === 'object' ? props.aria : {}

    const text = toOptionalString(contentInput.text ?? props.text)
    const level = contentInput.level ?? props.level
    const highlightText = toOptionalString(contentInput.highlightText ?? highlightInput.text ?? props.highlightText)
    const highlightColor = toOptionalString(contentInput.highlightColor ?? highlightInput.color ?? props.highlightColor)
    const seoEnabled = contentInput.seoEnabled ?? seoInput.enabled ?? props.enableSeoChecks
    const seoMaxLength = toOptionalNumber(contentInput.seoMaxLength ?? seoInput.maxLength ?? props.seoMaxLength)

    const normalized = normalizeAdvancedHeading({
      version: 1,
      content: {
        text,
        level,
        highlightText,
        highlightColor,
        seoEnabled: seoEnabled !== undefined ? Boolean(seoEnabled) : undefined,
        seoMaxLength,
      },
      style: {
        usePresetStyles: styleInput.usePresetStyles ?? props.usePresetStyles,
        fontFamily: toOptionalString(styleInput.fontFamily ?? props.fontFamily),
        fontSize: toOptionalString(styleInput.fontSize ?? props.fontSize),
        fontWeight: toOptionalString(styleInput.fontWeight ?? props.fontWeight),
        lineHeight: toOptionalString(styleInput.lineHeight ?? props.lineHeight),
        letterSpacing: toOptionalString(styleInput.letterSpacing ?? props.letterSpacing),
        textTransform: styleInput.textTransform ?? props.textTransform,
        textDecoration: styleInput.textDecoration ?? props.textDecoration,
        fontStyle: styleInput.fontStyle ?? props.fontStyle,
        color: toOptionalString(styleInput.color ?? props.color),
        hoverColor: toOptionalString(styleInput.hoverColor ?? props.hoverColor),
        alignment: styleInput.alignment ?? props.alignment ?? props.textAlign,
        maxWidth: toOptionalString(styleInput.maxWidth ?? props.maxWidth),
        margin: toOptionalString(styleInput.margin ?? props.margin),
        padding: toOptionalString(styleInput.padding ?? props.padding),
        className: toOptionalString(styleInput.className ?? ariaInput.className ?? props.className),
        customId: toOptionalString(styleInput.customId ?? ariaInput.customId ?? props.customId),
        htmlTag: styleInput.htmlTag ?? ariaInput.htmlTag ?? props.htmlTag,
        ariaLevel: toOptionalNumber(styleInput.ariaLevel ?? ariaInput.ariaLevel ?? props.ariaLevel),
        ariaLabel: toOptionalString(styleInput.ariaLabel ?? ariaInput.ariaLabel ?? props.ariaLabel),
        role: toOptionalString(styleInput.role ?? ariaInput.role ?? props.role),
        visible: styleInput.visible ?? ariaInput.visible ?? props.visible,
      },
      responsive: {
        fontSizeMobile: toOptionalString(responsiveInput.fontSizeMobile ?? styleInput.fontSizeMobile ?? props.fontSizeMobile),
        fontSizeTablet: toOptionalString(responsiveInput.fontSizeTablet ?? styleInput.fontSizeTablet ?? props.fontSizeTablet),
        textAlignMobile: responsiveInput.textAlignMobile ?? styleInput.textAlignMobile ?? props.textAlignMobile,
        textAlignTablet: responsiveInput.textAlignTablet ?? styleInput.textAlignTablet ?? props.textAlignTablet,
        desktop: responsiveInput.desktop || {},
        tablet: responsiveInput.tablet || {},
        mobile: responsiveInput.mobile || {},
      },
    })
    return stripEditorMeta({
      ...normalized,
      version: 1,
    })
  }

  if (normalizedType === 'advancedcard' || normalizedType === 'advancedcardcomponent' || normalizedType === 'card') {
    const normalized = normalizeAdvancedCard(props)
    return {
      ...props,
      ...stripEditorMeta(normalized as Record<string, any>),
      version: 1,
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
    const toOptionalString = (v: any) => {
      if (v === undefined || v === null) return undefined
      const str = String(v).trim()
      return str.length > 0 ? str : undefined
    }
    const toOptionalBoolean = (v: any) => {
      if (v === undefined || v === null || v === '') return undefined
      return Boolean(v)
    }

    const contentInput = props.content && typeof props.content === 'object' ? props.content : {}
    const styleInput = props.style && typeof props.style === 'object' ? props.style : {}
    const responsiveInput = props.responsive && typeof props.responsive === 'object' ? props.responsive : {}

    const items = contentInput.items ?? props.items
    const listType = contentInput.listType ?? props.listType

    const style: Record<string, any> = {}
    if (styleInput.columns !== undefined || props.columns !== undefined) {
      const col = Number(styleInput.columns ?? props.columns)
      if (col === 1 || col === 2 || col === 3 || col === 4) style.columns = col
    }
    if (toOptionalString(styleInput.itemSpacing ?? props.itemSpacing) !== undefined) style.itemSpacing = toOptionalString(styleInput.itemSpacing ?? props.itemSpacing)
    if (toOptionalString(styleInput.gap ?? props.gap) !== undefined) style.gap = toOptionalString(styleInput.gap ?? props.gap)
    if (toOptionalString(styleInput.padding ?? props.padding) !== undefined) style.padding = toOptionalString(styleInput.padding ?? props.padding)
    if (toOptionalString(styleInput.margin ?? props.margin) !== undefined) style.margin = toOptionalString(styleInput.margin ?? props.margin)
    if (styleInput.alignment ?? props.alignment !== undefined) style.alignment = styleInput.alignment ?? props.alignment
    if (styleInput.displayStyle ?? props.displayStyle !== undefined) style.displayStyle = styleInput.displayStyle ?? props.displayStyle
    if (toOptionalString(styleInput.defaultIcon ?? props.defaultIcon) !== undefined) style.defaultIcon = toOptionalString(styleInput.defaultIcon ?? props.defaultIcon)
    if (toOptionalString(styleInput.iconSize ?? props.iconSize) !== undefined) style.iconSize = toOptionalString(styleInput.iconSize ?? props.iconSize)
    if (styleInput.iconPosition ?? props.iconPosition !== undefined) style.iconPosition = styleInput.iconPosition ?? props.iconPosition
    if (toOptionalBoolean(styleInput.autoNumbering ?? props.autoNumbering) !== undefined) style.autoNumbering = toOptionalBoolean(styleInput.autoNumbering ?? props.autoNumbering)
    if (toOptionalString(styleInput.titleFontSize ?? props.titleFontSize) !== undefined) style.titleFontSize = toOptionalString(styleInput.titleFontSize ?? props.titleFontSize)
    if (toOptionalString(styleInput.titleFontWeight ?? props.titleFontWeight) !== undefined) style.titleFontWeight = toOptionalString(styleInput.titleFontWeight ?? props.titleFontWeight)
    if (toOptionalString(styleInput.descriptionFontSize ?? props.descriptionFontSize) !== undefined) style.descriptionFontSize = toOptionalString(styleInput.descriptionFontSize ?? props.descriptionFontSize)
    if (toOptionalString(styleInput.fontFamily ?? props.fontFamily) !== undefined) style.fontFamily = toOptionalString(styleInput.fontFamily ?? props.fontFamily)
    if (toOptionalString(styleInput.lineHeight ?? props.lineHeight) !== undefined) style.lineHeight = toOptionalString(styleInput.lineHeight ?? props.lineHeight)
    if (toOptionalString(styleInput.titleColor ?? props.titleColor) !== undefined) style.titleColor = toOptionalString(styleInput.titleColor ?? props.titleColor)
    if (toOptionalString(styleInput.descriptionColor ?? props.descriptionColor) !== undefined) style.descriptionColor = toOptionalString(styleInput.descriptionColor ?? props.descriptionColor)
    if (toOptionalString(styleInput.iconColor ?? props.iconColor) !== undefined) style.iconColor = toOptionalString(styleInput.iconColor ?? props.iconColor)
    if (toOptionalString(styleInput.backgroundColor ?? props.backgroundColor) !== undefined) style.backgroundColor = toOptionalString(styleInput.backgroundColor ?? props.backgroundColor)
    if (toOptionalString(styleInput.border ?? props.border) !== undefined) style.border = toOptionalString(styleInput.border ?? props.border)
    if (toOptionalString(styleInput.borderRadius ?? props.borderRadius) !== undefined) style.borderRadius = toOptionalString(styleInput.borderRadius ?? props.borderRadius)
    if (toOptionalString(styleInput.itemBackground ?? props.itemBackground) !== undefined) style.itemBackground = toOptionalString(styleInput.itemBackground ?? props.itemBackground)
    if (toOptionalString(styleInput.itemPadding ?? props.itemPadding) !== undefined) style.itemPadding = toOptionalString(styleInput.itemPadding ?? props.itemPadding)
    if (toOptionalString(styleInput.boxShadow ?? props.boxShadow) !== undefined) style.boxShadow = toOptionalString(styleInput.boxShadow ?? props.boxShadow)
    if (toOptionalString(styleInput.boxHoverShadow ?? props.boxHoverShadow) !== undefined) style.boxHoverShadow = toOptionalString(styleInput.boxHoverShadow ?? props.boxHoverShadow)
    if (toOptionalString(styleInput.boxBorderWidth ?? props.boxBorderWidth) !== undefined) style.boxBorderWidth = toOptionalString(styleInput.boxBorderWidth ?? props.boxBorderWidth)
    if (toOptionalString(styleInput.boxBorderColor ?? props.boxBorderColor) !== undefined) style.boxBorderColor = toOptionalString(styleInput.boxBorderColor ?? props.boxBorderColor)
    if (toOptionalString(styleInput.fullBoxShadow ?? props.fullBoxShadow) !== undefined) style.fullBoxShadow = toOptionalString(styleInput.fullBoxShadow ?? props.fullBoxShadow)
    if (toOptionalString(styleInput.fullBoxPadding ?? props.fullBoxPadding) !== undefined) style.fullBoxPadding = toOptionalString(styleInput.fullBoxPadding ?? props.fullBoxPadding)
    if (toOptionalString(styleInput.fullBoxBackground ?? props.fullBoxBackground) !== undefined) style.fullBoxBackground = toOptionalString(styleInput.fullBoxBackground ?? props.fullBoxBackground)
    if (toOptionalString(styleInput.fullBoxBorder ?? props.fullBoxBorder) !== undefined) style.fullBoxBorder = toOptionalString(styleInput.fullBoxBorder ?? props.fullBoxBorder)
    if (toOptionalString(styleInput.fullBoxBorderRadius ?? props.fullBoxBorderRadius) !== undefined) style.fullBoxBorderRadius = toOptionalString(styleInput.fullBoxBorderRadius ?? props.fullBoxBorderRadius)

    return stripEditorMeta({
      type: 'advancedlist',
      version: 1,
      content: {
        ...(items !== undefined ? { items } : {}),
        ...(listType !== undefined ? { listType } : {}),
      },
      style,
      responsive: {
        desktop: responsiveInput.desktop || {},
        tablet: responsiveInput.tablet || {},
        mobile: responsiveInput.mobile || {},
      },
      items,
      listType,
    })
  }

  if (normalizedType === 'advancedaccordion' || normalizedType === 'accordion') {
    const toOptionalString = (v: any) => {
      if (v === undefined || v === null) return undefined
      const str = String(v).trim()
      return str.length > 0 ? str : undefined
    }
    const toOptionalBoolean = (v: any) => {
      if (v === undefined || v === null || v === '') return undefined
      return Boolean(v)
    }
    const toOptionalNumber = (v: any) => {
      if (v === undefined || v === null || v === '') return undefined
      const num = Number(v)
      return Number.isNaN(num) ? undefined : num
    }

    const contentInput = props.content && typeof props.content === 'object' ? props.content : {}
    const styleInput = props.style && typeof props.style === 'object' ? props.style : {}
    const interactionInput = props.interaction && typeof props.interaction === 'object' ? props.interaction : {}
    const responsiveInput = props.responsive && typeof props.responsive === 'object' ? props.responsive : {}

    const items = contentInput.items ?? props.items

    const style: Record<string, any> = {}
    if (toOptionalString(styleInput.itemSpacing ?? props.itemSpacing) !== undefined) style.itemSpacing = toOptionalString(styleInput.itemSpacing ?? props.itemSpacing)
    if (toOptionalString(styleInput.padding ?? props.padding) !== undefined) style.padding = toOptionalString(styleInput.padding ?? props.padding)
    if (toOptionalString(styleInput.margin ?? props.margin) !== undefined) style.margin = toOptionalString(styleInput.margin ?? props.margin)
    if (toOptionalString(styleInput.titleFontSize ?? props.titleFontSize) !== undefined) style.titleFontSize = toOptionalString(styleInput.titleFontSize ?? props.titleFontSize)
    if (toOptionalString(styleInput.titleFontWeight ?? props.titleFontWeight) !== undefined) style.titleFontWeight = toOptionalString(styleInput.titleFontWeight ?? props.titleFontWeight)
    if (toOptionalString(styleInput.contentFontSize ?? props.contentFontSize) !== undefined) style.contentFontSize = toOptionalString(styleInput.contentFontSize ?? props.contentFontSize)
    if (toOptionalString(styleInput.fontFamily ?? props.fontFamily) !== undefined) style.fontFamily = toOptionalString(styleInput.fontFamily ?? props.fontFamily)
    if (toOptionalString(styleInput.lineHeight ?? props.lineHeight) !== undefined) style.lineHeight = toOptionalString(styleInput.lineHeight ?? props.lineHeight)
    if (toOptionalString(styleInput.titleColor ?? props.titleColor) !== undefined) style.titleColor = toOptionalString(styleInput.titleColor ?? props.titleColor)
    if (toOptionalString(styleInput.titleBackground ?? props.titleBackground) !== undefined) style.titleBackground = toOptionalString(styleInput.titleBackground ?? props.titleBackground)
    if (toOptionalString(styleInput.contentColor ?? props.contentColor) !== undefined) style.contentColor = toOptionalString(styleInput.contentColor ?? props.contentColor)
    if (toOptionalString(styleInput.contentBackground ?? props.contentBackground) !== undefined) style.contentBackground = toOptionalString(styleInput.contentBackground ?? props.contentBackground)
    if (toOptionalString(styleInput.border ?? props.border) !== undefined) style.border = toOptionalString(styleInput.border ?? props.border)
    if (toOptionalString(styleInput.borderRadius ?? props.borderRadius) !== undefined) style.borderRadius = toOptionalString(styleInput.borderRadius ?? props.borderRadius)
    if (toOptionalString(styleInput.activeTitleColor ?? props.activeTitleColor) !== undefined) style.activeTitleColor = toOptionalString(styleInput.activeTitleColor ?? props.activeTitleColor)
    if (toOptionalString(styleInput.activeTitleBackground ?? props.activeTitleBackground) !== undefined) style.activeTitleBackground = toOptionalString(styleInput.activeTitleBackground ?? props.activeTitleBackground)

    const interaction: Record<string, any> = {}
    if (interactionInput.behavior ?? props.behavior !== undefined) interaction.behavior = interactionInput.behavior ?? props.behavior
    if (toOptionalBoolean(interactionInput.allowAllClosed ?? props.allowAllClosed) !== undefined) interaction.allowAllClosed = toOptionalBoolean(interactionInput.allowAllClosed ?? props.allowAllClosed)
    if (interactionInput.iconPosition ?? props.iconPosition !== undefined) interaction.iconPosition = interactionInput.iconPosition ?? props.iconPosition
    if (toOptionalString(interactionInput.icon ?? props.icon) !== undefined) interaction.icon = toOptionalString(interactionInput.icon ?? props.icon)
    if (toOptionalString(interactionInput.activeIcon ?? props.activeIcon) !== undefined) interaction.activeIcon = toOptionalString(interactionInput.activeIcon ?? props.activeIcon)
    if (interactionInput.animation ?? props.animation !== undefined) interaction.animation = interactionInput.animation ?? props.animation
    if (toOptionalNumber(interactionInput.animationDuration ?? props.animationDuration) !== undefined) interaction.animationDuration = toOptionalNumber(interactionInput.animationDuration ?? props.animationDuration)

    return stripEditorMeta({
      type: 'advancedaccordion',
      version: 1,
      content: {
        ...(items !== undefined ? { items } : {}),
      },
      style,
      interaction,
      responsive: {
        desktop: responsiveInput.desktop || {},
        tablet: responsiveInput.tablet || {},
        mobile: responsiveInput.mobile || {},
      },
      items,
    })
  }

  if (normalizedType === 'newgrid' || normalizedType === 'grid') {
    const toOptionalString = (v: any) => {
      if (v === undefined || v === null) return undefined
      const str = String(v).trim()
      return str.length > 0 ? str : undefined
    }
    const toOptionalBoolean = (v: any) => {
      if (v === undefined || v === null || v === '') return undefined
      return Boolean(v)
    }
    const toOptionalNumber = (v: any) => {
      if (v === undefined || v === null || v === '') return undefined
      const num = Number(v)
      return Number.isNaN(num) ? undefined : num
    }

    const contentInput = props.content && typeof props.content === 'object' ? props.content : {}
    const layoutInput = props.layout && typeof props.layout === 'object' ? props.layout : {}
    const responsiveInput = props.responsive && typeof props.responsive === 'object' ? props.responsive : {}
    const styleInput = props.style && typeof props.style === 'object' ? props.style : {}
    const behaviorInput = props.behavior && typeof props.behavior === 'object' ? props.behavior : {}

    const components = contentInput.components ?? props.components
    const cells = contentInput.cells ?? props.cells

    const layout: Record<string, any> = {}
    if (toOptionalNumber(layoutInput.columns ?? props.columns) !== undefined) layout.columns = toOptionalNumber(layoutInput.columns ?? props.columns)
    if (toOptionalNumber(layoutInput.rows ?? props.rows) !== undefined) layout.rows = toOptionalNumber(layoutInput.rows ?? props.rows)
    if (toOptionalNumber(layoutInput.gap ?? props.gap) !== undefined) layout.gap = toOptionalNumber(layoutInput.gap ?? props.gap)
    if (toOptionalNumber(layoutInput.padding ?? props.padding) !== undefined) layout.padding = toOptionalNumber(layoutInput.padding ?? props.padding)
    if (toOptionalNumber(layoutInput.margin ?? props.margin) !== undefined) layout.margin = toOptionalNumber(layoutInput.margin ?? props.margin)
    if (layoutInput.justifyContent ?? props.justifyContent !== undefined) layout.justifyContent = layoutInput.justifyContent ?? props.justifyContent
    if (layoutInput.alignItems ?? props.alignItems !== undefined) layout.alignItems = layoutInput.alignItems ?? props.alignItems
    if (toOptionalString(layoutInput.gridTemplateColumns ?? props.gridTemplateColumns) !== undefined) layout.gridTemplateColumns = toOptionalString(layoutInput.gridTemplateColumns ?? props.gridTemplateColumns)
    if (toOptionalString(layoutInput.gridAutoRows ?? props.gridAutoRows) !== undefined) layout.gridAutoRows = toOptionalString(layoutInput.gridAutoRows ?? props.gridAutoRows)
    if (toOptionalString(layoutInput.minHeight ?? props.minHeight) !== undefined) layout.minHeight = toOptionalString(layoutInput.minHeight ?? props.minHeight)

    const responsive: Record<string, any> = {
      ...(toOptionalNumber(responsiveInput.mobileColumns ?? props.mobileColumns) !== undefined ? { mobileColumns: toOptionalNumber(responsiveInput.mobileColumns ?? props.mobileColumns) } : {}),
      ...(toOptionalNumber(responsiveInput.tabletColumns ?? props.tabletColumns) !== undefined ? { tabletColumns: toOptionalNumber(responsiveInput.tabletColumns ?? props.tabletColumns) } : {}),
      ...(toOptionalNumber(responsiveInput.desktopColumns ?? props.desktopColumns) !== undefined ? { desktopColumns: toOptionalNumber(responsiveInput.desktopColumns ?? props.desktopColumns) } : {}),
      ...(toOptionalBoolean(responsiveInput.hideOnMobile ?? props.hideOnMobile) !== undefined ? { hideOnMobile: toOptionalBoolean(responsiveInput.hideOnMobile ?? props.hideOnMobile) } : {}),
      ...(toOptionalBoolean(responsiveInput.hideOnTablet ?? props.hideOnTablet) !== undefined ? { hideOnTablet: toOptionalBoolean(responsiveInput.hideOnTablet ?? props.hideOnTablet) } : {}),
      desktop: responsiveInput.desktop || {},
      tablet: responsiveInput.tablet || {},
      mobile: responsiveInput.mobile || {},
    }

    const style: Record<string, any> = {}
    if (toOptionalString(styleInput.backgroundColor ?? props.backgroundColor) !== undefined) style.backgroundColor = toOptionalString(styleInput.backgroundColor ?? props.backgroundColor)
    if (toOptionalString(styleInput.border ?? props.border) !== undefined) style.border = toOptionalString(styleInput.border ?? props.border)
    if (toOptionalNumber(styleInput.borderRadius ?? props.borderRadius) !== undefined) style.borderRadius = toOptionalNumber(styleInput.borderRadius ?? props.borderRadius)
    if (toOptionalString(styleInput.gridLineColor ?? props.gridLineColor) !== undefined) style.gridLineColor = toOptionalString(styleInput.gridLineColor ?? props.gridLineColor)
    if (toOptionalString(styleInput.customCSS ?? props.customCSS) !== undefined) style.customCSS = toOptionalString(styleInput.customCSS ?? props.customCSS)
    if (toOptionalString(styleInput.className ?? props.className) !== undefined) style.className = toOptionalString(styleInput.className ?? props.className)
    if (toOptionalString(styleInput.id ?? props.id) !== undefined) style.id = toOptionalString(styleInput.id ?? props.id)
    if (toOptionalString(styleInput.dataAttributes ?? props.dataAttributes) !== undefined) style.dataAttributes = toOptionalString(styleInput.dataAttributes ?? props.dataAttributes)

    const behavior: Record<string, any> = {}
    if (toOptionalBoolean(behaviorInput.draggable ?? props.draggable) !== undefined) behavior.draggable = toOptionalBoolean(behaviorInput.draggable ?? props.draggable)
    if (toOptionalBoolean(behaviorInput.resizable ?? props.resizable) !== undefined) behavior.resizable = toOptionalBoolean(behaviorInput.resizable ?? props.resizable)
    if (toOptionalBoolean(behaviorInput.showGridLines ?? props.showGridLines) !== undefined) behavior.showGridLines = toOptionalBoolean(behaviorInput.showGridLines ?? props.showGridLines)
    if (toOptionalBoolean(behaviorInput.snapToGrid ?? props.snapToGrid) !== undefined) behavior.snapToGrid = toOptionalBoolean(behaviorInput.snapToGrid ?? props.snapToGrid)
    if (toOptionalBoolean(behaviorInput.visible ?? props.visible) !== undefined) behavior.visible = toOptionalBoolean(behaviorInput.visible ?? props.visible)

    return stripEditorMeta({
      type: 'newgrid',
      version: 1,
      content: {
        ...(components !== undefined ? { components } : {}),
        ...(cells !== undefined ? { cells } : {}),
      },
      layout,
      responsive,
      style,
      behavior,
      components,
      cells,
      columns: layout.columns,
      rows: layout.rows,
      gap: layout.gap,
      padding: layout.padding,
      margin: layout.margin,
    })
  }

  if (normalizedType === 'tabs') {
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

    const contentInput = props.content && typeof props.content === 'object' ? props.content : {}
    const styleInput = props.style && typeof props.style === 'object' ? props.style : {}
    const ariaInput = props.aria && typeof props.aria === 'object' ? props.aria : {}
    const responsiveInput = props.responsive && typeof props.responsive === 'object' ? props.responsive : {}

    const tabs = contentInput.tabs ?? props.tabs
    const activeTab = contentInput.activeTab ?? props.activeTab

    const style: Record<string, any> = {}
    if (toOptionalString(styleInput.width ?? props.width) !== undefined) style.width = toOptionalString(styleInput.width ?? props.width)
    if (toOptionalString(styleInput.tabGap ?? props.tabGap) !== undefined) style.tabGap = toOptionalString(styleInput.tabGap ?? props.tabGap)
    if (toOptionalString(styleInput.tabPadding ?? props.tabPadding) !== undefined) style.tabPadding = toOptionalString(styleInput.tabPadding ?? props.tabPadding)
    if (toOptionalString(styleInput.contentPadding ?? props.contentPadding) !== undefined) style.contentPadding = toOptionalString(styleInput.contentPadding ?? props.contentPadding)
    if (toOptionalString(styleInput.borderColor ?? props.borderColor) !== undefined) style.borderColor = toOptionalString(styleInput.borderColor ?? props.borderColor)
    if (toOptionalString(styleInput.activeBorderColor ?? props.activeBorderColor) !== undefined) style.activeBorderColor = toOptionalString(styleInput.activeBorderColor ?? props.activeBorderColor)
    if (toOptionalString(styleInput.activeTextColor ?? props.activeTextColor) !== undefined) style.activeTextColor = toOptionalString(styleInput.activeTextColor ?? props.activeTextColor)
    if (toOptionalString(styleInput.inactiveTextColor ?? props.inactiveTextColor) !== undefined) style.inactiveTextColor = toOptionalString(styleInput.inactiveTextColor ?? props.inactiveTextColor)
    if (toOptionalString(styleInput.activeFontWeight ?? props.activeFontWeight) !== undefined) style.activeFontWeight = toOptionalString(styleInput.activeFontWeight ?? props.activeFontWeight)
    if (toOptionalString(styleInput.inactiveFontWeight ?? props.inactiveFontWeight) !== undefined) style.inactiveFontWeight = toOptionalString(styleInput.inactiveFontWeight ?? props.inactiveFontWeight)

    const aria: Record<string, any> = {}
    if (toOptionalString(ariaInput.label ?? props.label) !== undefined) aria.label = toOptionalString(ariaInput.label ?? props.label)
    if (toOptionalString(ariaInput.ariaLabel ?? props.ariaLabel ?? props.label) !== undefined) aria.ariaLabel = toOptionalString(ariaInput.ariaLabel ?? props.ariaLabel ?? props.label)
    if (toOptionalString(ariaInput.className ?? props.className) !== undefined) aria.className = toOptionalString(ariaInput.className ?? props.className)
    if (toOptionalString(ariaInput.customId ?? props.customId) !== undefined) aria.customId = toOptionalString(ariaInput.customId ?? props.customId)

    return stripEditorMeta({
      type: 'tabs',
      version: 1,
      content: {
        ...(tabs !== undefined ? { tabs } : {}),
        ...(activeTab !== undefined ? { activeTab: toOptionalNumber(activeTab) } : {}),
      },
      style,
      aria,
      responsive: {
        desktop: responsiveInput.desktop || {},
        tablet: responsiveInput.tablet || {},
        mobile: responsiveInput.mobile || {},
      },
      tabs,
      activeTab: toOptionalNumber(activeTab) ?? 0,
    })
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

  if (normalizedType === 'container') {
    const toOptionalString = (v: any) => {
      if (v === undefined || v === null) return undefined
      if (typeof v === 'object') return undefined
      const str = String(v).trim()
      return str.length > 0 ? str : undefined
    }

    const rawContent =
      typeof props.content === 'string'
        ? props.content
        : typeof props.content?.content === 'string'
        ? props.content.content
        : undefined

    const resolvedChildren =
      Array.isArray(props.children) && props.children.length > 0
        ? props.children
        : Array.isArray(props.content?.children) && props.content.children.length > 0
          ? props.content.children
          : Array.isArray(props.children)
            ? props.children
            : Array.isArray(props.content?.children)
              ? props.content.children
              : []

    const normalized = normalizeContainer({
      ...props,
      content: {
        content: toOptionalString(rawContent),
        children: resolvedChildren,
      },
      style: {
        maxWidth: toOptionalString(props.maxWidth),
        width: toOptionalString(props.width),
        minHeight: toOptionalString(props.minHeight),
        padding: toOptionalString(props.padding),
        margin: toOptionalString(props.margin),
        backgroundColor: toOptionalString(props.backgroundColor),
        borderRadius: toOptionalString(props.borderRadius),
        border: toOptionalString(props.border),
        borderColor: toOptionalString(props.borderColor),
        shadow: toOptionalString(props.shadow ?? props.boxShadow),
        alignment: toOptionalString(props.alignment ?? props.textAlign),
        textAlign: toOptionalString(props.textAlign ?? props.alignment),
        className: toOptionalString(props.className),
        position: toOptionalString(props.position),
        top: toOptionalString(props.top),
        right: toOptionalString(props.right),
        bottom: toOptionalString(props.bottom),
        left: toOptionalString(props.left),
        zIndex: props.zIndex,
        overflow: toOptionalString(props.overflow),
      },
      position: toOptionalString(props.position),
      top: toOptionalString(props.top),
      right: toOptionalString(props.right),
      bottom: toOptionalString(props.bottom),
      left: toOptionalString(props.left),
      zIndex: props.zIndex,
      overflow: toOptionalString(props.overflow),
      mobilePosition: toOptionalString(props.mobilePosition),
      children: resolvedChildren,
      responsive: props.responsive || {},
    })

    return stripEditorMeta({
      ...normalized,
      children: resolvedChildren,
      content: {
        ...(normalized.content || {}),
        children: resolvedChildren,
      },
      version: 1,
    })
  }

  if (normalizedType === 'spacer') {
    const toOptionalString = (v: any) => {
      if (v === undefined || v === null) return undefined
      const str = String(v).trim()
      return str.length > 0 ? str : undefined
    }

    const normalized = normalizeSpacer({
      style: {
        height: toOptionalString(props.height),
        backgroundColor: toOptionalString(props.backgroundColor),
        showInEditor: props.showInEditor !== undefined ? Boolean(props.showInEditor) : undefined,
        className: toOptionalString(props.className),
      },
      responsive: {
        desktop: { height: toOptionalString(props.desktopHeight) },
        tablet: { height: toOptionalString(props.tabletHeight) },
        mobile: { height: toOptionalString(props.mobileHeight) },
      },
      visibility: props.visibility !== undefined ? Boolean(props.visibility) : undefined,
    })

    return stripEditorMeta({
      ...normalized,
      version: 1,
    })
  }

  if (normalizedType === 'icon') {
    const toOptionalString = (v: any) => {
      if (v === undefined || v === null) return undefined
      const str = String(v).trim()
      return str.length > 0 ? str : undefined
    }

    const normalized = normalizeIcon({
      content: {
        name: toOptionalString(props.name ?? props.icon),
      },
      style: {
        size: toOptionalString(props.size),
        color: toOptionalString(props.color),
        className: toOptionalString(props.className),
      },
      responsive: props.responsive || {},
    })

    return stripEditorMeta({
      ...normalized,
      version: 1,
    })
  }

  if (normalizedType === 'divider') {
    const toOptionalString = (v: any) => {
      if (v === undefined || v === null) return undefined
      const str = String(v).trim()
      return str.length > 0 ? str : undefined
    }

    const normalized = normalizeDivider({
      style: {
        thickness: toOptionalString(props.thickness),
        color: toOptionalString(props.color),
        width: toOptionalString(props.width),
        margin: toOptionalString(props.margin),
        className: toOptionalString(props.className),
      },
      responsive: props.responsive || {},
    })

    return stripEditorMeta({
      ...normalized,
      version: 1,
    })
  }

  if (normalizedType === 'quote') {
    const toOptionalString = (v: any) => {
      if (v === undefined || v === null) return undefined
      const str = String(v).trim()
      return str.length > 0 ? str : undefined
    }

    const normalized = normalizeQuote({
      content: {
        text: toOptionalString(props.text ?? props.content),
        author: toOptionalString(props.author ?? props.caption),
      },
      style: {
        align: toOptionalString(props.align ?? props.alignment ?? props.textAlign),
        margin: toOptionalString(props.margin),
        color: toOptionalString(props.color),
        fontSize: toOptionalString(props.fontSize),
        lineHeight: toOptionalString(props.lineHeight),
        className: toOptionalString(props.className),
      },
      responsive: props.responsive || {},
    })

    return stripEditorMeta({
      ...normalized,
      version: 1,
    })
  }

  if (normalizedType === 'video') {
    const toOptionalString = (v: any) => {
      if (v === undefined || v === null) return undefined
      const str = String(v).trim()
      return str.length > 0 ? str : undefined
    }
    const toOptionalBoolean = (v: any) => {
      if (v === undefined || v === null || v === '') return undefined
      return Boolean(v)
    }
    const toOptionalNumber = (v: any) => {
      if (v === undefined || v === null || v === '') return undefined
      const num = Number(v)
      return Number.isNaN(num) ? undefined : num
    }

    const normalized = normalizeVideo({
      content: {
        src: toOptionalString(props.src),
        sourceType: toOptionalString(props.sourceType),
        title: toOptionalString(props.title),
        autoplay: toOptionalBoolean(props.autoplay),
        muted: toOptionalBoolean(props.muted),
        controls: toOptionalBoolean(props.controls),
        loop: toOptionalBoolean(props.loop),
      },
      style: {
        width: toOptionalString(props.width),
        maxWidth: toOptionalString(props.maxWidth),
        aspectRatio: toOptionalString(props.aspectRatio),
        margin: toOptionalString(props.margin),
        borderRadius: toOptionalNumber(props.borderRadius),
        borderColor: toOptionalString(props.borderColor),
        borderOpacity: toOptionalNumber(props.borderOpacity),
        accentColor: toOptionalString(props.accentColor),
        showOverlay: toOptionalBoolean(props.showOverlay),
        overlayStrength: toOptionalNumber(props.overlayStrength),
        showPreviewChrome: toOptionalBoolean(props.showPreviewChrome),
        previewProgress: toOptionalNumber(props.previewProgress),
        previewTime: toOptionalString(props.previewTime),
        objectFit: toOptionalString(props.objectFit),
        className: toOptionalString(props.className),
      },
      responsive: props.responsive || {},
    })

    return stripEditorMeta({
      ...normalized,
      version: 1,
    })
  }

  if (normalizedType === 'filter') {
    const toOptionalString = (v: any) => {
      if (v === undefined || v === null) return undefined
      const str = String(v).trim()
      return str.length > 0 ? str : undefined
    }
    const toOptionalBoolean = (v: any) => {
      if (v === undefined || v === null || v === '') return undefined
      return Boolean(v)
    }
    const toOptionalNumber = (v: any) => {
      if (v === undefined || v === null || v === '') return undefined
      const num = Number(v)
      return Number.isNaN(num) ? undefined : num
    }

    const normalized = normalizeFilter({
      content: {
        filterType: toOptionalString(props.filterType),
        filterKey: toOptionalString(props.filterKey),
        bindTo: toOptionalString(props.bindTo),
        label: toOptionalString(props.label),
        helpText: toOptionalString(props.helpText),
        placeholder: toOptionalString(props.placeholder),
        defaultValue: props.defaultValue,
        defaultChecked: toOptionalBoolean(props.defaultChecked),
        value: props.value,
        sourceType: toOptionalString(props.sourceType),
        presetKey: toOptionalString(props.presetKey),
        options: props.options,
        apiEndpoint: toOptionalString(props.apiEndpoint),
        apiMethod: toOptionalString(props.apiMethod),
        apiLabelField: toOptionalString(props.apiLabelField),
        apiValueField: toOptionalString(props.apiValueField),
        min: toOptionalNumber(props.min),
        max: toOptionalNumber(props.max),
        step: toOptionalNumber(props.step),
        rangeMode: toOptionalString(props.rangeMode),
        prefix: toOptionalString(props.prefix),
        suffix: toOptionalString(props.suffix),
        defaultSort: toOptionalString(props.defaultSort),
        sortField: toOptionalString(props.sortField),
        sortDirection: toOptionalString(props.sortDirection),
        onLabel: toOptionalString(props.onLabel),
        offLabel: toOptionalString(props.offLabel),
        selectAllLabel: toOptionalString(props.selectAllLabel),
        applyButtonLabel: toOptionalString(props.applyButtonLabel),
        sectionTitle: toOptionalString(props.sectionTitle),
        dependsOn: props.dependsOn,
        visibleWhen: props.visibleWhen,
        disabledWhen: props.disabledWhen,
        storageKey: toOptionalString(props.storageKey),
        queryParam: toOptionalString(props.queryParam),
        emitEventName: toOptionalString(props.emitEventName),
      },
      style: {
        variant: toOptionalString(props.variant),
        size: toOptionalString(props.size),
        density: toOptionalString(props.density),
        fullWidth: toOptionalBoolean(props.fullWidth),
        labelPosition: toOptionalString(props.labelPosition),
        orientation: toOptionalString(props.orientation),
        mobileVariant: toOptionalString(props.mobileVariant),
        desktopVariant: toOptionalString(props.desktopVariant),
        columns: toOptionalNumber(props.columns),
        inline: toOptionalBoolean(props.inline),
        radioStyle: toOptionalString(props.radioStyle),
        toggleColor: toOptionalString(props.toggleColor),
        chipStyle: toOptionalString(props.chipStyle),
        chipVariant: toOptionalString(props.chipVariant),
        showLabel: toOptionalBoolean(props.showLabel),
        showClearButton: toOptionalBoolean(props.showClearButton),
        showStateLabel: toOptionalBoolean(props.showStateLabel),
        showSelectedCount: toOptionalBoolean(props.showSelectedCount),
        showTooltip: toOptionalBoolean(props.showTooltip),
        showTicks: toOptionalBoolean(props.showTicks),
        showMinMaxLabels: toOptionalBoolean(props.showMinMaxLabels),
        showDivider: toOptionalBoolean(props.showDivider),
        sticky: toOptionalBoolean(props.sticky),
        collapsedByDefault: toOptionalBoolean(props.collapsedByDefault),
        disabled: toOptionalBoolean(props.disabled),
        required: toOptionalBoolean(props.required),
        clearable: toOptionalBoolean(props.clearable),
        searchable: toOptionalBoolean(props.searchable),
        closeMenuOnSelect: toOptionalBoolean(props.closeMenuOnSelect),
        maxSelections: toOptionalNumber(props.maxSelections),
        selectAllEnabled: toOptionalBoolean(props.selectAllEnabled),
        allowMultiple: toOptionalBoolean(props.allowMultiple),
        removable: toOptionalBoolean(props.removable),
        debounceMs: toOptionalNumber(props.debounceMs),
        autoFocus: toOptionalBoolean(props.autoFocus),
        persistState: toOptionalBoolean(props.persistState),
        syncWithUrl: toOptionalBoolean(props.syncWithUrl),
        autoApply: toOptionalBoolean(props.autoApply),
        resetOnChange: toOptionalBoolean(props.resetOnChange),
        reloadOptionsOnDependencyChange: toOptionalBoolean(props.reloadOptionsOnDependencyChange),
        className: toOptionalString(props.className),
        wrapperClassName: toOptionalString(props.wrapperClassName),
        ariaLabel: toOptionalString(props.ariaLabel),
        ariaDescription: toOptionalString(props.ariaDescription),
        tabIndex: toOptionalNumber(props.tabIndex),
      },
      responsive: props.responsive || {},
    })

    return stripEditorMeta({
      ...normalized,
      version: 1,
    })
  }

  if (normalizedType === 'swipercontainer') {
    const toOptionalString = (v: any) => {
      if (v === undefined || v === null) return undefined
      const str = String(v).trim()
      return str.length > 0 ? str : undefined
    }
    const toOptionalBoolean = (v: any) => {
      if (v === undefined || v === null || v === '') return undefined
      return Boolean(v)
    }
    const toOptionalNumber = (v: any) => {
      if (v === undefined || v === null || v === '') return undefined
      const num = Number(v)
      return Number.isNaN(num) ? undefined : num
    }

    const normalized = normalizeSwiperContainer({
      content: {
        slides: Array.isArray(props.slides)
          ? props.slides
          : Array.isArray(props.content?.slides)
            ? props.content.slides
            : undefined,
        autoplay: toOptionalBoolean(props.autoplay),
        autoplayDelay: toOptionalNumber(props.autoplayDelay),
        loop: toOptionalBoolean(props.loop),
        speed: toOptionalNumber(props.speed),
        direction: toOptionalString(props.direction) as any,
        draggable: toOptionalBoolean(props.draggable),
        grabCursor: toOptionalBoolean(props.grabCursor),
        freeMode: toOptionalBoolean(props.freeMode),
        mousewheel: toOptionalBoolean(props.mousewheel),
        keyboard: toOptionalBoolean(props.keyboard),
        navigation: toOptionalBoolean(props.navigation),
        pagination: toOptionalBoolean(props.pagination),
        scrollbar: toOptionalBoolean(props.scrollbar),
        scrollbarDraggable: toOptionalBoolean(props.scrollbarDraggable),
        parallax: toOptionalBoolean(props.parallax),
        parallaxBackground: toOptionalString(props.parallaxBackground),
      },
      style: {
        slidesPerView: props.slidesPerView === 'auto' ? 'auto' : toOptionalNumber(props.slidesPerView),
        slidesPerGroup: toOptionalNumber(props.slidesPerGroup),
        spaceBetween: toOptionalNumber(props.spaceBetween),
        centeredSlides: toOptionalBoolean(props.centeredSlides),
        height: toOptionalString(props.height),
        width: toOptionalString(props.width),
        slideWidth: toOptionalString(props.slideWidth),
        slideMinHeight: toOptionalString(props.slideMinHeight),
        backgroundColor: toOptionalString(props.backgroundColor),
        padding: toOptionalString(props.padding),
        borderRadius: toOptionalString(props.borderRadius),
        arrowStyle: toOptionalString(props.arrowStyle) as any,
        arrowPosition: toOptionalString(props.arrowPosition) as any,
        paginationType: toOptionalString(props.paginationType) as any,
        paginationDynamic: toOptionalBoolean(props.paginationDynamic),
        paginationClickable: toOptionalBoolean(props.paginationClickable),
        effect: toOptionalString(props.effect) as any,
        effectFadeCrossFade: toOptionalBoolean(props.effectFadeCrossFade),
        effectCubeShadow: toOptionalBoolean(props.effectCubeShadow),
        effectCubeSlideShadows: toOptionalBoolean(props.effectCubeSlideShadows),
        effectCoverflowRotate: toOptionalNumber(props.effectCoverflowRotate),
        effectCoverflowDepth: toOptionalNumber(props.effectCoverflowDepth),
        effectCoverflowStretch: toOptionalNumber(props.effectCoverflowStretch),
        effectCoverflowModifier: toOptionalNumber(props.effectCoverflowModifier),
        effectFlipSlideShadows: toOptionalBoolean(props.effectFlipSlideShadows),
        effectCardsPerSlideOffset: toOptionalNumber(props.effectCardsPerSlideOffset),
        effectCardsRotate: toOptionalBoolean(props.effectCardsRotate),
        hoverEffects: toOptionalBoolean(props.hoverEffects),
        hoverEffectType: toOptionalString(props.hoverEffectType) as any,
        hoverIntensity: toOptionalNumber(props.hoverIntensity),
        className: toOptionalString(props.className),
      },
      responsive: props.responsive || {},
    })

    return stripEditorMeta({
      ...normalized,
      version: 1,
    })
  }

  if (normalizedType === 'flexbox') {
    const toOptionalString = (v: any) => {
      if (v === undefined || v === null) return undefined
      const str = String(v).trim()
      return str.length > 0 ? str : undefined
    }
    const toOptionalBoolean = (v: any) => {
      if (v === undefined || v === null || v === '') return undefined
      return Boolean(v)
    }

    const resolvedChildren =
      Array.isArray(props.children) && props.children.length > 0
        ? props.children
        : Array.isArray(props.content?.children) && props.content.children.length > 0
          ? props.content.children
          : Array.isArray(props.children)
            ? props.children
            : Array.isArray(props.content?.children)
              ? props.content.children
              : []

    const normalized = normalizeFlexbox({
      children: resolvedChildren,
      content: {
        children: resolvedChildren,
        preset: toOptionalString(props.preset),
      },
      style: {
        direction: toOptionalString(props.direction),
        justifyContent: toOptionalString(props.justifyContent),
        alignItems: toOptionalString(props.alignItems),
        alignContent: toOptionalString(props.alignContent),
        wrap: toOptionalString(props.wrap),
        gap: toOptionalString(props.gap),
        rowGap: toOptionalString(props.rowGap),
        columnGap: toOptionalString(props.columnGap),
        padding: toOptionalString(props.padding),
        minHeight: toOptionalString(props.minHeight),
        backgroundColor: toOptionalString(props.backgroundColor),
        borderRadius: toOptionalString(props.borderRadius),
        border: toOptionalString(props.border),
        shadow: toOptionalString(props.shadow),
        width: toOptionalString(props.width),
        maxWidth: toOptionalString(props.maxWidth),
        className: toOptionalString(props.className),
      },
      responsive: {
        stackOnMobile: toOptionalBoolean(props.stackOnMobile),
        directionMobile: toOptionalString(props.directionMobile),
        mobileGap: toOptionalString(props.mobileGap),
        ...(props.responsive || {}),
      },
    })

    return stripEditorMeta({
      ...normalized,
      children: resolvedChildren,
      content: {
        ...(normalized.content || {}),
        children: resolvedChildren,
      },
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

    if (Array.isArray(component.props?.children)) {
      for (const child of component.props.children) {
        const result = search(child)
        if (result) return result
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
      if (compType === 'flexbox') {
        if (propName === 'preset') {
          if (value === 'navbar') {
            nextEditorProps.direction = 'row'
            nextEditorProps.justifyContent = 'space-between'
            nextEditorProps.alignItems = 'center'
            nextEditorProps.wrap = 'wrap'
          } else if (value === 'center-hero') {
            nextEditorProps.direction = 'column'
            nextEditorProps.justifyContent = 'center'
            nextEditorProps.alignItems = 'center'
          } else if (value === 'button-group') {
            nextEditorProps.direction = 'row'
            nextEditorProps.justifyContent = 'flex-start'
            nextEditorProps.alignItems = 'center'
            nextEditorProps.gap = '12px'
            nextEditorProps.wrap = 'wrap'
          } else if (value === 'feature-row') {
            nextEditorProps.direction = 'row'
            nextEditorProps.justifyContent = 'flex-start'
            nextEditorProps.alignItems = 'center'
            nextEditorProps.gap = '16px'
          }
        } else if (['direction', 'justifyContent', 'alignItems', 'alignContent', 'wrap'].includes(propName)) {
          nextEditorProps.preset = 'custom'
        }
      }
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
