import { ICON_BASE_PROPS } from './iconProps'
import type { IconProps } from './iconProps'

export const BellSVG = (props: IconProps) => (
  <svg {...ICON_BASE_PROPS} {...props}>
    <path d='M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6' />
    <path d='M10.5 20a2 2 0 0 0 3 0' />
  </svg>
)
