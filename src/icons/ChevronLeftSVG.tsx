import { ICON_BASE_PROPS } from './iconProps'
import type { IconProps } from './iconProps'

export const ChevronLeftSVG = (props: IconProps) => (
  <svg {...ICON_BASE_PROPS} {...props}>
    <path d='m15 6-6 6 6 6' />
  </svg>
)
