export type IconProps = {
  name?: string
  icon?: string
  size?: string | number
  color?: string
  className?: string
  [key: string]: any
}

export type IconViewModel = {
  iconName: string
  size: string | number
  numericSize: number
  color: string
  className: string
}
