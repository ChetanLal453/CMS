import type { DeepPartial } from '../../utils/merge'
export type { DeepPartial }

export type AdvancedAccordionType = 'advancedaccordion'
export type AdvancedAccordionBehavior = 'single' | 'multiple'
export type AdvancedAccordionIconPosition = 'left' | 'right'
export type AdvancedAccordionAnimation = 'slide' | 'fade' | 'none'

export interface AdvancedAccordionItem {
  id: string
  title: string
  content: string
  visible: boolean
}

export interface AdvancedAccordionStyleGroup {
  itemSpacing: string
  padding: string
  margin: string
  titleFontSize: string
  titleFontWeight: string
  contentFontSize: string
  fontFamily: string
  lineHeight: string
  titleColor: string
  titleBackground: string
  contentColor: string
  contentBackground: string
  border: string
  borderRadius: string
  activeTitleColor: string
  activeTitleBackground: string
}

export interface AdvancedAccordionInteractionGroup {
  behavior: AdvancedAccordionBehavior
  allowAllClosed: boolean
  iconPosition: AdvancedAccordionIconPosition
  icon: string
  activeIcon: string
  animation: AdvancedAccordionAnimation
  animationDuration: number
}

export interface AdvancedAccordion {
  type: AdvancedAccordionType
  schemaVersion: 1
  items: AdvancedAccordionItem[]
  style: AdvancedAccordionStyleGroup
  interaction: AdvancedAccordionInteractionGroup
}

export interface LegacyAdvancedAccordionProps {
  items?: Array<Partial<AdvancedAccordionItem>>
  behavior?: AdvancedAccordionBehavior
  allowAllClosed?: boolean
  itemSpacing?: string
  padding?: string
  margin?: string
  titleFontSize?: string
  titleFontWeight?: string
  contentFontSize?: string
  fontFamily?: string
  lineHeight?: string
  titleColor?: string
  titleBackground?: string
  contentColor?: string
  contentBackground?: string
  border?: string
  borderRadius?: string
  activeTitleColor?: string
  activeTitleBackground?: string
  iconPosition?: AdvancedAccordionIconPosition
  icon?: string
  activeIcon?: string
  animation?: AdvancedAccordionAnimation
  animationDuration?: number
  [key: string]: unknown
}

export type AdvancedAccordionInput =
  | DeepPartial<AdvancedAccordion>
  | LegacyAdvancedAccordionProps
  | (DeepPartial<AdvancedAccordion> & LegacyAdvancedAccordionProps)

export interface AdvancedAccordionViewModel {
  items: AdvancedAccordionItem[]
  behavior: AdvancedAccordionBehavior
  allowAllClosed: boolean
  iconPosition: AdvancedAccordionIconPosition
  icon: string
  activeIcon: string
  animation: AdvancedAccordionAnimation
  animationDuration: number
  containerStyle: CSSProperties
  itemStyle: CSSProperties
  headerStyle: CSSProperties
  activeHeaderStyle: CSSProperties
  contentStyle: CSSProperties
  titleStyle: CSSProperties
}

export type CSSProperties = Record<string, any>
