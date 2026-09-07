import { ICON_BASE_PROPS } from './iconProps'
import type { IconProps } from './iconProps'

export const ArrowUpSVG = (props: IconProps) => (
  <svg {...ICON_BASE_PROPS} {...props}>
    <path d='M12 19V5' />
    <path d='m5 12 7-7 7 7' />
  </svg>
)
