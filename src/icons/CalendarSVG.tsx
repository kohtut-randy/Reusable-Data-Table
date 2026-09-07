import { ICON_BASE_PROPS } from './iconProps'
import type { IconProps } from './iconProps'

export const CalendarSVG = (props: IconProps) => (
  <svg {...ICON_BASE_PROPS} {...props}>
    <rect x='3' y='5' width='18' height='16' rx='2.5' />
    <path d='M8 3v4M16 3v4M3 11h18' />
  </svg>
)
