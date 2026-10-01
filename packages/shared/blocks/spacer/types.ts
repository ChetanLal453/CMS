export interface CanonicalSpacerContent {
  // Spacers don't have text content, but canonical consistency
}

export interface CanonicalSpacerStyle {
  height?: string
  backgroundColor?: string
  showInEditor?: boolean
  className?: string
}

export interface CanonicalSpacerResponsive {
  desktop?: {
    height?: string
  }
  tablet?: {
    height?: string
  }
  mobile?: {
    height?: string
  }
}

export interface CanonicalSpacerProps {
  version?: number
  content?: CanonicalSpacerContent
  style?: CanonicalSpacerStyle
  responsive?: CanonicalSpacerResponsive
}

export type SpacerProps = CanonicalSpacerProps & {
  height?: string
  mobileHeight?: string
  tabletHeight?: string
  desktopHeight?: string
  visibility?: boolean
  backgroundColor?: string
  showInEditor?: boolean
  className?: string
  [key: string]: any
}

export type SpacerViewModel = SpacerProps & {
  visible: boolean
  editorBackgroundColor: string
  resolvedHeight: string
  resolvedMobileHeight: string
  resolvedTabletHeight: string
  resolvedDesktopHeight: string
}
