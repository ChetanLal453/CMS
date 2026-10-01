export type TabsType = 'tabs'

export interface TabItem {
  id: string
  title: string
  content: string
  description?: string
  components: Array<Record<string, any>>
  visible: boolean
  disabled: boolean
}

export interface CanonicalTabsContent {
  tabs?: TabItem[]
  activeTab?: number
}

export interface CanonicalTabsStyle {
  width?: string
  tabGap?: string
  tabPadding?: string
  contentPadding?: string
  borderColor?: string
  activeBorderColor?: string
  activeTextColor?: string
  inactiveTextColor?: string
  activeFontWeight?: string
  inactiveFontWeight?: string
  [key: string]: any
}

export interface CanonicalTabsAria {
  label?: string
  ariaLabel?: string
  className?: string
  customId?: string
  [key: string]: any
}

export interface CanonicalTabsResponsive {
  desktop?: Record<string, any>
  tablet?: Record<string, any>
  mobile?: Record<string, any>
  [key: string]: any
}

export interface CanonicalTabsProps {
  version?: number
  content?: CanonicalTabsContent
  style?: CanonicalTabsStyle
  aria?: CanonicalTabsAria
  responsive?: CanonicalTabsResponsive
}

export interface TabsStyleGroup extends CanonicalTabsStyle {
  width: string
  tabGap: string
  tabPadding: string
  contentPadding: string
  borderColor: string
  activeBorderColor: string
  activeTextColor: string
  inactiveTextColor: string
  activeFontWeight: string
  inactiveFontWeight: string
}

export interface TabsAriaGroup extends CanonicalTabsAria {
  label: string
  ariaLabel: string
  className: string
  customId: string
}

export interface TabsBlock extends CanonicalTabsProps {
  type: TabsType
  schemaVersion: 1
  version?: number
  tabs: TabItem[]
  activeTab: number
  style: TabsStyleGroup
  aria: TabsAriaGroup
  responsive?: CanonicalTabsResponsive
  [key: string]: any
}

export interface LegacyTabItem {
  id?: string
  title?: string
  content?: string
  description?: string
  components?: Array<Record<string, any>>
  visible?: boolean
  disabled?: boolean
  [key: string]: unknown
}

export interface LegacyTabsProps {
  tabs?: LegacyTabItem[]
  activeTab?: number
  style?: Partial<TabsStyleGroup>
  aria?: Partial<TabsAriaGroup>
  label?: string
  ariaLabel?: string
  className?: string
  customId?: string
  width?: string
  tabGap?: string
  tabPadding?: string
  contentPadding?: string
  borderColor?: string
  activeBorderColor?: string
  activeTextColor?: string
  inactiveTextColor?: string
  activeFontWeight?: string
  inactiveFontWeight?: string
  [key: string]: unknown
}

export type TabsInput = Partial<TabsBlock> | LegacyTabsProps | (Partial<TabsBlock> & LegacyTabsProps)

export interface TabsViewModel {
  tabs: TabItem[]
  activeIndex: number
  activeTab: TabItem | null
  className: string
  customId: string
  label: string
  ariaLabel: string
  resolvedAriaLabel: string
  containerStyle: CSSProperties
  tabListStyle: CSSProperties
  tabButtonStyle: CSSProperties
  activeTabButtonStyle: CSSProperties
  contentStyle: CSSProperties
}

// TODO: Restore proper CSSProperties/React type once monorepo 
// @types/react resolution is fixed (see SwiperContainer.tsx TS2786 errors)
export type CSSProperties = Record<string, any>
