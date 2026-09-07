import { ICON_BASE_PROPS } from './iconProps'
import type { IconProps } from './iconProps'

export const CheckSVG = (props: IconProps) => (
  <svg {...ICON_BASE_PROPS} {...props}>
    <path d='m5 13 4.5 4.5L19 7' />
  </svg>
)
