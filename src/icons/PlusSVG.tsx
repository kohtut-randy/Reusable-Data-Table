import { ICON_BASE_PROPS } from './iconProps'
import type { IconProps } from './iconProps'

export const PlusSVG = (props: IconProps) => (
  <svg {...ICON_BASE_PROPS} {...props}>
    <path d='M12 5v14M5 12h14' />
  </svg>
)
