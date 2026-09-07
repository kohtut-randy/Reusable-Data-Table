import { ICON_BASE_PROPS } from './iconProps'
import type { IconProps } from './iconProps'

export const SearchSVG = (props: IconProps) => (
  <svg {...ICON_BASE_PROPS} {...props}>
    <circle cx='11' cy='11' r='7' />
    <path d='m20 20-3.5-3.5' />
  </svg>
)
