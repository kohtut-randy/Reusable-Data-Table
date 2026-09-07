import { ICON_BASE_PROPS } from './iconProps'
import type { IconProps } from './iconProps'

export const RouteSVG = (props: IconProps) => (
  <svg {...ICON_BASE_PROPS} {...props}>
    <circle cx='6' cy='18' r='2.5' />
    <circle cx='18' cy='6' r='2.5' />
    <path d='M8.5 17.5c6 0 3-11 9-11' />
  </svg>
)
