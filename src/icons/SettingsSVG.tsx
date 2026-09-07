import { ICON_BASE_PROPS } from './iconProps'
import type { IconProps } from './iconProps'

export const SettingsSVG = (props: IconProps) => (
  <svg {...ICON_BASE_PROPS} {...props}>
    <circle cx='12' cy='12' r='3' />
    <path d='M12 2.5v2.2M12 19.3v2.2M4.2 7l1.9 1.1M17.9 15.9l1.9 1.1M4.2 17l1.9-1.1M17.9 8.1l1.9-1.1' />
  </svg>
)
