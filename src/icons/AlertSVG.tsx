import { ICON_BASE_PROPS } from './iconProps'
import type { IconProps } from './iconProps'

export const AlertSVG = (props: IconProps) => (
  <svg {...ICON_BASE_PROPS} {...props}>
    <path d='M12 4.5 2.8 20h18.4z' />
    <path d='M12 10v4.2M12 17.2v.1' />
  </svg>
)
