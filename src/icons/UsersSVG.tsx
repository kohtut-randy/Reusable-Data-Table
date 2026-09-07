import { ICON_BASE_PROPS } from './iconProps'
import type { IconProps } from './iconProps'

export const UsersSVG = (props: IconProps) => (
  <svg {...ICON_BASE_PROPS} {...props}>
    <circle cx='9' cy='9' r='3.2' />
    <path d='M3.5 19a5.5 5.5 0 0 1 11 0' />
    <path d='M16 6.2a3.2 3.2 0 0 1 0 5.6' />
    <path d='M17.5 14.4A5.5 5.5 0 0 1 20.5 19' />
  </svg>
)
