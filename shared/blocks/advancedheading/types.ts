export type AdvancedHeadingType = 'advancedheading'
export type AdvancedHeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
export type AdvancedHeadingAlignment = 'left' | 'center' | 'right' | 'justify'
export type AdvancedHeadingTextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize'
export type AdvancedHeadingTextDecoration = 'none' | 'underline' | 'line-through' | 'overline'
export type AdvancedHeadingFontStyle = 'normal' | 'italic' | 'oblique'
export type AdvancedHeadingHtmlTag = 'auto' | AdvancedHeadingLevel | 'div' | 'span' | 'p'
import type { DeepPartial } from '../../utils/merge'
export type { DeepPartial }

export interface CanonicalAdvancedHeadingContent {
  text?: string
  level?: AdvancedHeadingLevel
  highlightText?: string
  highlightColor?: string
  seoEnabled?: boolean
  seoMaxLength?: number
}

export interface CanonicalAdvancedHeadingStyle {
  usePresetStyles?: boolean
  fontFamily?: string
  fontSize?: string
  fontWeight?: string
  lineHeight?: string
  letterSpacing?: string
  textTransform?: AdvancedHeadingTextTransform
  textDecoration?: AdvancedHeadingTextDecoration
  fontStyle?: AdvancedHeadingFontStyle
  color?: string
  hoverColor?: string
  alignment?: AdvancedHeadingAlignment
  maxWidth?: string
  margin?: string
  padding?: string
  className?: string
  customId?: string
  htmlTag?: AdvancedHeadingHtmlTag
  ariaLevel?: number
  ariaLabel?: string
  role?: string
  visible?: boolean
  dataTracking?: string
}

export interface CanonicalAdvancedHeadingResponsive {
  fontSizeMobile?: string
  fontSizeTablet?: string
  textAlignMobile?: AdvancedHeadingAlignment
  textAlignTablet?: AdvancedHeadingAlignment
  desktop?: Record<string, any>
  tablet?: Record<string, any>
  mobile?: Record<string, any>
}

export interface CanonicalAdvancedHeadingProps {
  version?: number
  content?: CanonicalAdvancedHeadingContent
  style?: CanonicalAdvancedHeadingStyle
  responsive?: CanonicalAdvancedHeadingResponsive
}

export interface AdvancedHeadingStyleGroup extends CanonicalAdvancedHeadingStyle {
  usePresetStyles: boolean
  fontFamily: string
  fontSize: string
  fontSizeMobile: string
  fontSizeTablet: string
  fontWeight: string
  lineHeight: string
  letterSpacing: string
  textTransform: AdvancedHeadingTextTransform
  textDecoration: AdvancedHeadingTextDecoration
  fontStyle: AdvancedHeadingFontStyle
  color: string
  hoverColor: string
  alignment: AdvancedHeadingAlignment
  textAlignMobile: AdvancedHeadingAlignment
  textAlignTablet: AdvancedHeadingAlignment
  maxWidth: string
  margin: string
  padding: string
}

export interface AdvancedHeadingHighlightGroup {
  text: string
  color: string
}

export interface AdvancedHeadingSeoGroup {
  enabled: boolean
  maxLength: number
}

export interface AdvancedHeadingAriaGroup {
  visible: boolean
  semanticLevel: AdvancedHeadingLevel
  htmlTag: AdvancedHeadingHtmlTag
  ariaLevel?: number
  ariaLabel: string
  role: string
  autoId: boolean
  customId: string
  className: string
  dataTracking: string
  componentId: string
}

export interface AdvancedHeadingMeta {
  migratedFrom?: 'legacy-flat' | 'legacy-structured' | 'structured'
}

export interface AdvancedHeading extends CanonicalAdvancedHeadingProps {
  type: AdvancedHeadingType
  schemaVersion: 1
  text: string
  level: AdvancedHeadingLevel
  style: AdvancedHeadingStyleGroup
  highlight: AdvancedHeadingHighlightGroup
  seo: AdvancedHeadingSeoGroup
  aria: AdvancedHeadingAriaGroup
  meta: AdvancedHeadingMeta
  [key: string]: any
}

export interface LegacyAdvancedHeadingProps {
  text?: string
  level?: AdvancedHeadingLevel
  semanticLevel?: AdvancedHeadingLevel
  ariaLevel?: number
  ariaLabel?: string
  role?: string
  autoId?: boolean
  customId?: string
  fontFamily?: string
  fontSize?: string
  fontSizeMobile?: string
  fontSizeTablet?: string
  fontWeight?: string
  lineHeight?: string
  letterSpacing?: string
  textTransform?: AdvancedHeadingTextTransform
  textDecoration?: AdvancedHeadingTextDecoration
  fontStyle?: AdvancedHeadingFontStyle
  color?: string
  hoverColor?: string
  textAlign?: AdvancedHeadingAlignment
  textAlignMobile?: AdvancedHeadingAlignment
  textAlignTablet?: AdvancedHeadingAlignment
  maxWidth?: string
  marginTop?: string
  marginRight?: string
  marginBottom?: string
  marginLeft?: string
  paddingTop?: string
  paddingRight?: string
  paddingBottom?: string
  paddingLeft?: string
  className?: string
  dataTracking?: string
  highlightText?: string
  highlightColor?: string
  usePresetStyles?: boolean
  htmlTag?: AdvancedHeadingHtmlTag
  enableSeoChecks?: boolean
  seoMaxLength?: number
  visible?: boolean
  componentId?: string
  [key: string]: unknown
}

export type AdvancedHeadingInput =
  | DeepPartial<AdvancedHeading>
  | LegacyAdvancedHeadingProps
  | (DeepPartial<AdvancedHeading> & LegacyAdvancedHeadingProps)

export interface AdvancedHeadingViewModel {
  visible: boolean
  text: string
  plainText: string
  html: string
  tag: AdvancedHeadingHtmlTag
  className: string
  customId: string
  dataTracking: string
  ariaLevel?: number
  ariaLabel: string
  role: string
  style: CSSProperties & {
    hoverColor: string
  }
  responsive: {
    mobileFontSize: string
    tabletFontSize: string
    mobileAlign: AdvancedHeadingAlignment
    tabletAlign: AdvancedHeadingAlignment
  }
  seoWarnings: string[]
}
export type CSSProperties = Record<string, any>
