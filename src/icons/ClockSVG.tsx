import { ICON_BASE_PROPS } from './iconProps'
import type { IconProps } from './iconProps'

export const ClockSVG = (props: IconProps) => (
  <svg {...ICON_BASE_PROPS} {...props}>
    <circle cx='12' cy='12' r='8.5' />
    <path d='M12 7.5V12l3 2' />
  </svg>
)
