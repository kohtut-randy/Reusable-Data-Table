import { ICON_BASE_PROPS } from './iconProps'
import type { IconProps } from './iconProps'

export const FilterSVG = (props: IconProps) => (
  <svg {...ICON_BASE_PROPS} {...props}>
    <path d='M4 6h16M7 12h10M10 18h4' />
  </svg>
)
