export type SpacerProps = {
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
}
