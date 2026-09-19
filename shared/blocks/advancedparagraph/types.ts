import type { CSSProperties } from 'react'

export type AdvancedParagraphType = 'advancedparagraph'
export type AdvancedParagraphAlignment = 'left' | 'center' | 'right' | 'justify'
export type AdvancedParagraphTextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize'
export type AdvancedParagraphTextDecoration = 'none' | 'underline' | 'line-through' | 'overline'
export type AdvancedParagraphFontStyle = 'normal' | 'italic' | 'oblique'
import type { DeepPartial } from '../../utils/merge'
export type { DeepPartial }

export interface AdvancedParagraphContentGroup {
  text: string
}

export interface AdvancedParagraphLayoutGroup {
  alignment: AdvancedParagraphAlignment
}

export interface AdvancedParagraphStyleGroup {
  color: string
  fontSize: string
  fontWeight: string
  fontFamily: string
  lineHeight: string
  lineHeightMobile: string
  letterSpacing: string
  maxWidth: string
  backgroundColor: string
  margin: string
  padding: string
  width: string
  minHeight: string
  display: 'block' | 'inline' | 'inline-block' | 'none'
  border: string
  borderRadius: string
  borderColor: string
  textShadow: string
  boxShadow: string
  opacity: number
  fontSizeMobile: string
  fontSizeTablet: string
  textAlignMobile: AdvancedParagraphAlignment
  textAlignTablet: AdvancedParagraphAlignment
  textTransform: AdvancedParagraphTextTransform
  textDecoration: AdvancedParagraphTextDecoration
  fontStyle: AdvancedParagraphFontStyle
  transition: string
}

export interface AdvancedParagraphInteractionGroup {
  hover: {
    effect: 'none' | 'underline' | 'color-change' | 'background-change'
    color: string
    backgroundColor: string
  }
}

export interface AdvancedParagraphAriaGroup {
  visible: boolean
  ariaLabel: string
  role: string
  tabIndex: number
  className: string
  customId: string
  selectable: boolean
  editable: boolean
  truncate: boolean
  maxLines?: number
  enableRichText: boolean
  allowedFormats: string[]
  componentId: string
}

export interface AdvancedParagraphMeta {
  migratedFrom?: 'legacy-flat' | 'legacy-structured' | 'structured'
}

export interface AdvancedParagraph {
  type: AdvancedParagraphType
  schemaVersion: 1
  content: AdvancedParagraphContentGroup
  layout: AdvancedParagraphLayoutGroup
  style: AdvancedParagraphStyleGroup
  interaction: AdvancedParagraphInteractionGroup
  aria: AdvancedParagraphAriaGroup
  meta: AdvancedParagraphMeta
}

export interface LegacyAdvancedParagraphProps {
  text?: string
  content?: string
  html?: string
  textAlign?: AdvancedParagraphAlignment
  align?: AdvancedParagraphAlignment
  fontSize?: string
  fontWeight?: string
  fontFamily?: string
  lineHeight?: string
  letterSpacing?: string
  textTransform?: AdvancedParagraphTextTransform
  textDecoration?: AdvancedParagraphTextDecoration
  fontStyle?: AdvancedParagraphFontStyle
  textColor?: string
  fontColor?: string
  color?: string
  backgroundColor?: string
  hoverColor?: string
  margin?: string
  marginTop?: string
  marginRight?: string
  marginBottom?: string
  marginLeft?: string
  padding?: string
  paddingTop?: string
  paddingRight?: string
  paddingBottom?: string
  paddingLeft?: string
  width?: string
  maxWidth?: string
  minHeight?: string
  display?: AdvancedParagraphStyleGroup['display']
  border?: string
  borderRadius?: string
  borderColor?: string
  textShadow?: string
  boxShadow?: string
  opacity?: number
  fontSizeMobile?: string
  textAlignMobile?: AdvancedParagraphAlignment
  lineHeightMobile?: string
  fontSizeTablet?: string
  textAlignTablet?: AdvancedParagraphAlignment
  hoverEffect?: AdvancedParagraphInteractionGroup['hover']['effect']
  hoverBackgroundColor?: string
  hoverTextColor?: string
  transition?: string
  enableRichText?: boolean
  allowedFormats?: string[]
  ariaLabel?: string
  role?: string
  tabIndex?: number
  className?: string
  customId?: string
  selectable?: boolean
  editable?: boolean
  truncate?: boolean
  maxLines?: number
  visible?: boolean
  componentId?: string
  [key: string]: unknown
}

export type AdvancedParagraphInput =
  | DeepPartial<AdvancedParagraph>
  | LegacyAdvancedParagraphProps
  | (DeepPartial<AdvancedParagraph> & LegacyAdvancedParagraphProps)

export interface AdvancedParagraphViewModel {
  visible: boolean
  html: string
  className: string
  customId: string
  ariaLabel: string
  role: string
  tabIndex: number
  selectable: boolean
  editable: boolean
  truncate: boolean
  maxLines?: number
  allowedFormats: string[]
  resolvedHoverColor: string
  resolvedHoverBackgroundColor: string
  style: CSSProperties
  hover: AdvancedParagraphInteractionGroup['hover']
  responsive: {
    fontSizeMobile: string
    textAlignMobile: AdvancedParagraphAlignment
    lineHeightMobile: string
    fontSizeTablet: string
    textAlignTablet: AdvancedParagraphAlignment
  }
}
