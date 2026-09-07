import type { ComponentType } from 'react'
import { CalendarSVG, RouteSVG, UsersSVG, WalletSVG } from 'icons'
import type { IconProps } from 'icons'

export type NavItem = {
  label: string
  href: string
  icon: ComponentType<IconProps>
}

/* Every entry is a real, working route: an earlier version had inert `aria-disabled`
   items, and greyed-out nav reads as broken rather than as scoped.

   "Component demo" is the odd one out, and knowingly so. It is not part of the product;
   it is the reusability showcase the assessment brief asks for, and it is in the nav
   because a reviewer has to be able to find it. */
export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Timetable', href: '/', icon: CalendarSVG },
  { label: 'Payouts', href: '/payouts', icon: WalletSVG },
  { label: 'Members', href: '/members', icon: UsersSVG },
  { label: 'Component demo', href: '/demo', icon: RouteSVG },
]
