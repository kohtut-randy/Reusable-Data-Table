import { ICON_BASE_PROPS } from './iconProps'
import type { IconProps } from './iconProps'

export const ChevronsLeftSVG = (props: IconProps) => (
  <svg {...ICON_BASE_PROPS} {...props}>
    <path d='m11 6-6 6 6 6' />
    <path d='m18 6-6 6 6 6' />
  </svg>
)
