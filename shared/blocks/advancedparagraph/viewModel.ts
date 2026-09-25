import { defaultAdvancedParagraphProps } from './defaults'
import { normalizeAdvancedParagraph } from './normalize'
import type { AdvancedParagraphInput, AdvancedParagraphViewModel } from './types'

export function createAdvancedParagraphViewModel(input: AdvancedParagraphInput): AdvancedParagraphViewModel {
  const paragraph = normalizeAdvancedParagraph(input)

  return {
    visible: paragraph.style?.visible ?? paragraph.aria?.visible ?? defaultAdvancedParagraphProps.aria.visible,
    html: paragraph.content?.text ?? paragraph.text ?? paragraph.content?.content ?? defaultAdvancedParagraphProps.content.text,
    className: paragraph.style?.className ?? paragraph.aria?.className ?? defaultAdvancedParagraphProps.aria.className,
    customId: paragraph.style?.customId ?? paragraph.aria?.customId ?? defaultAdvancedParagraphProps.aria.customId,
    ariaLabel: paragraph.style?.ariaLabel ?? paragraph.aria?.ariaLabel ?? defaultAdvancedParagraphProps.aria.ariaLabel,
    role: paragraph.style?.role ?? paragraph.aria?.role ?? defaultAdvancedParagraphProps.aria.role,
    tabIndex: paragraph.style?.tabIndex ?? paragraph.aria?.tabIndex ?? defaultAdvancedParagraphProps.aria.tabIndex,
    selectable: paragraph.style?.selectable ?? paragraph.aria?.selectable ?? defaultAdvancedParagraphProps.aria.selectable,
    editable: paragraph.style?.editable ?? paragraph.aria?.editable ?? defaultAdvancedParagraphProps.aria.editable,
    truncate: paragraph.style?.truncate ?? paragraph.aria?.truncate ?? defaultAdvancedParagraphProps.aria.truncate,
    maxLines: paragraph.style?.maxLines ?? paragraph.aria?.maxLines ?? defaultAdvancedParagraphProps.aria.maxLines,
    allowedFormats: paragraph.content?.allowedFormats ?? paragraph.aria?.allowedFormats ?? defaultAdvancedParagraphProps.aria.allowedFormats,
    resolvedHoverColor:
      paragraph.style?.hoverColor ||
      paragraph.interaction?.hover?.color ||
      paragraph.style?.color ||
      defaultAdvancedParagraphProps.style.color,
    resolvedHoverBackgroundColor:
      paragraph.style?.hoverBackgroundColor ||
      paragraph.interaction?.hover?.backgroundColor ||
      paragraph.style?.backgroundColor ||
      'transparent',
    style: {
      fontSize: paragraph.style?.fontSize || defaultAdvancedParagraphProps.style.fontSize,
      fontWeight: paragraph.style?.fontWeight || defaultAdvancedParagraphProps.style.fontWeight,
      fontFamily: paragraph.style?.fontFamily || defaultAdvancedParagraphProps.style.fontFamily,
      lineHeight: paragraph.style?.lineHeight || defaultAdvancedParagraphProps.style.lineHeight,
      letterSpacing: paragraph.style?.letterSpacing || defaultAdvancedParagraphProps.style.letterSpacing,
      textTransform: paragraph.style?.textTransform || defaultAdvancedParagraphProps.style.textTransform,
      textDecoration: paragraph.style?.textDecoration || defaultAdvancedParagraphProps.style.textDecoration,
      fontStyle: paragraph.style?.fontStyle || defaultAdvancedParagraphProps.style.fontStyle,
      color: paragraph.style?.color || defaultAdvancedParagraphProps.style.color,
      backgroundColor: paragraph.style?.backgroundColor || defaultAdvancedParagraphProps.style.backgroundColor,
      textAlign: paragraph.style?.alignment || paragraph.layout?.alignment || defaultAdvancedParagraphProps.layout.alignment,
      width: paragraph.style?.width || defaultAdvancedParagraphProps.style.width,
      maxWidth: paragraph.style?.maxWidth || defaultAdvancedParagraphProps.style.maxWidth,
      minHeight: paragraph.style?.minHeight || defaultAdvancedParagraphProps.style.minHeight,
      display: paragraph.style?.display || defaultAdvancedParagraphProps.style.display,
      margin: paragraph.style?.margin || defaultAdvancedParagraphProps.style.margin,
      padding: paragraph.style?.padding || defaultAdvancedParagraphProps.style.padding,
      border: paragraph.style?.border || defaultAdvancedParagraphProps.style.border,
      borderRadius: paragraph.style?.borderRadius || defaultAdvancedParagraphProps.style.borderRadius,
      borderColor: paragraph.style?.borderColor || defaultAdvancedParagraphProps.style.borderColor,
      textShadow: paragraph.style?.textShadow || defaultAdvancedParagraphProps.style.textShadow,
      boxShadow: paragraph.style?.boxShadow || defaultAdvancedParagraphProps.style.boxShadow,
      opacity: paragraph.style?.opacity ?? defaultAdvancedParagraphProps.style.opacity,
      transition: paragraph.style?.transition || defaultAdvancedParagraphProps.style.transition,
    },
    hover: {
      effect: (paragraph.style?.hoverEffect || paragraph.interaction?.hover?.effect || defaultAdvancedParagraphProps.interaction.hover.effect) as any,
      color: paragraph.style?.hoverColor || paragraph.interaction?.hover?.color || defaultAdvancedParagraphProps.interaction.hover.color,
      backgroundColor: paragraph.style?.hoverBackgroundColor || paragraph.interaction?.hover?.backgroundColor || defaultAdvancedParagraphProps.interaction.hover.backgroundColor,
    },
    responsive: {
      fontSizeMobile: paragraph.responsive?.fontSizeMobile || paragraph.style?.fontSizeMobile || defaultAdvancedParagraphProps.style.fontSizeMobile,
      textAlignMobile: paragraph.responsive?.textAlignMobile || paragraph.style?.textAlignMobile || defaultAdvancedParagraphProps.style.textAlignMobile,
      lineHeightMobile: paragraph.responsive?.lineHeightMobile || paragraph.style?.lineHeightMobile || defaultAdvancedParagraphProps.style.lineHeightMobile,
      fontSizeTablet: paragraph.responsive?.fontSizeTablet || paragraph.style?.fontSizeTablet || defaultAdvancedParagraphProps.style.fontSizeTablet,
      textAlignTablet: paragraph.responsive?.textAlignTablet || paragraph.style?.textAlignTablet || defaultAdvancedParagraphProps.style.textAlignTablet,
    },
  }
}
