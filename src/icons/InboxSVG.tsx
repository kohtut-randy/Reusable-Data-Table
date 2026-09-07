import { ICON_BASE_PROPS } from './iconProps'
import type { IconProps } from './iconProps'

export const InboxSVG = (props: IconProps) => (
  <svg {...ICON_BASE_PROPS} {...props}>
    <path d='M3 13.5 5.4 5.2A2 2 0 0 1 7.3 3.8h9.4a2 2 0 0 1 1.9 1.4L21 13.5' />
    <path d='M3 13.5h5l1.2 2.3h5.6l1.2-2.3h5V18a2.2 2.2 0 0 1-2.2 2.2H5.2A2.2 2.2 0 0 1 3 18z' />
  </svg>
)
