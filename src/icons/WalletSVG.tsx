import { ICON_BASE_PROPS } from './iconProps'
import type { IconProps } from './iconProps'

export const WalletSVG = (props: IconProps) => (
  <svg {...ICON_BASE_PROPS} {...props}>
    <rect x='3' y='6' width='18' height='13' rx='2.5' />
    <path d='M3 10h18' />
    <circle cx='17' cy='14.5' r='1.2' />
  </svg>
)
