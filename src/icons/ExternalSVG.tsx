import { ICON_BASE_PROPS } from './iconProps'
import type { IconProps } from './iconProps'

export const ExternalSVG = (props: IconProps) => (
  <svg {...ICON_BASE_PROPS} {...props}>
    <path d='M14 4h6v6' />
    <path d='M20 4 11 13' />
    <path d='M18 14v4.5A1.5 1.5 0 0 1 16.5 20h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10' />
  </svg>
)
