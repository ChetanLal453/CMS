import { normalizeAdvancedParagraph } from './normalize'
import type { AdvancedParagraphInput, AdvancedParagraphViewModel } from './types'

export function createAdvancedParagraphViewModel(input: AdvancedParagraphInput): AdvancedParagraphViewModel {
  const paragraph = normalizeAdvancedParagraph(input)

  return {
    visible: paragraph.aria.visible,
    html: paragraph.content.text,
    className: paragraph.aria.className,
    customId: paragraph.aria.customId,
    ariaLabel: paragraph.aria.ariaLabel,
    role: paragraph.aria.role,
    tabIndex: paragraph.aria.tabIndex,
    selectable: paragraph.aria.selectable,
    editable: paragraph.aria.editable,
    truncate: paragraph.aria.truncate,
    maxLines: paragraph.aria.maxLines,
    allowedFormats: paragraph.aria.allowedFormats,
    resolvedHoverColor: paragraph.interaction.hover.color || paragraph.style.color,
    resolvedHoverBackgroundColor: paragraph.interaction.hover.backgroundColor || paragraph.style.backgroundColor,
    style: {
      fontSize: paragraph.style.fontSize,
      fontWeight: paragraph.style.fontWeight,
      fontFamily: paragraph.style.fontFamily,
      lineHeight: paragraph.style.lineHeight,
      letterSpacing: paragraph.style.letterSpacing,
      textTransform: paragraph.style.textTransform,
      textDecoration: paragraph.style.textDecoration,
      fontStyle: paragraph.style.fontStyle,
      color: paragraph.style.color,
      backgroundColor: paragraph.style.backgroundColor,
      textAlign: paragraph.layout.alignment,
      width: paragraph.style.width,
      maxWidth: paragraph.style.maxWidth,
      minHeight: paragraph.style.minHeight,
      display: paragraph.style.display,
      margin: paragraph.style.margin,
      padding: paragraph.style.padding,
      border: paragraph.style.border,
      borderRadius: paragraph.style.borderRadius,
      borderColor: paragraph.style.borderColor,
      textShadow: paragraph.style.textShadow,
      boxShadow: paragraph.style.boxShadow,
      opacity: paragraph.style.opacity,
      transition: paragraph.style.transition,
    },
    hover: {
      effect: paragraph.interaction.hover.effect,
      color: paragraph.interaction.hover.color,
      backgroundColor: paragraph.interaction.hover.backgroundColor,
    },
    responsive: {
      fontSizeMobile: paragraph.style.fontSizeMobile,
      textAlignMobile: paragraph.style.textAlignMobile,
      lineHeightMobile: paragraph.style.lineHeightMobile,
      fontSizeTablet: paragraph.style.fontSizeTablet,
      textAlignTablet: paragraph.style.textAlignTablet,
    },
  }
}
