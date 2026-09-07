import { ICON_BASE_PROPS } from './iconProps'
import type { IconProps } from './iconProps'

export const CloseSVG = (props: IconProps) => (
  <svg {...ICON_BASE_PROPS} {...props}>
    <path d='M6 6l12 12M18 6 6 18' />
  </svg>
)
