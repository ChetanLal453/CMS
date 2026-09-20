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

export interface TabsStyleGroup {
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

export interface TabsAriaGroup {
  label: string
  ariaLabel: string
  className: string
  customId: string
}

export interface TabsBlock {
  type: TabsType
  schemaVersion: 1
  tabs: TabItem[]
  activeTab: number
  style: TabsStyleGroup
  aria: TabsAriaGroup
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
