import { ICON_BASE_PROPS } from './iconProps'
import type { IconProps } from './iconProps'

export const MenuSVG = (props: IconProps) => (
  <svg {...ICON_BASE_PROPS} {...props}>
    <path d='M4 7h16M4 12h16M4 17h16' />
  </svg>
)
