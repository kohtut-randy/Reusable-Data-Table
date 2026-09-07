import { ICON_BASE_PROPS } from './iconProps'
import type { IconProps } from './iconProps'

export const ChevronsRightSVG = (props: IconProps) => (
  <svg {...ICON_BASE_PROPS} {...props}>
    <path d='m13 6 6 6-6 6' />
    <path d='m6 6 6 6-6 6' />
  </svg>
)
