import { ICON_BASE_PROPS } from './iconProps'
import type { IconProps } from './iconProps'

export const RefreshSVG = (props: IconProps) => (
  <svg {...ICON_BASE_PROPS} {...props}>
    <path d='M20 12a8 8 0 1 1-2.6-5.9' />
    <path d='M20 4.5V10h-5.4' />
  </svg>
)
