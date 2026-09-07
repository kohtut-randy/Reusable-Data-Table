import { ICON_BASE_PROPS } from './iconProps'
import type { IconProps } from './iconProps'

export const MoreSVG = (props: IconProps) => (
  <svg {...ICON_BASE_PROPS} {...props}>
    <circle cx='12' cy='5.5' r='1.4' />
    <circle cx='12' cy='12' r='1.4' />
    <circle cx='12' cy='18.5' r='1.4' />
  </svg>
)
