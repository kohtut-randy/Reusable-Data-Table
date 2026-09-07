import { ICON_BASE_PROPS } from './iconProps'
import type { IconProps } from './iconProps'

export const SortSVG = (props: IconProps) => (
  <svg {...ICON_BASE_PROPS} {...props}>
    <path d='m7 15 5 5 5-5' />
    <path d='m7 9 5-5 5 5' />
  </svg>
)
