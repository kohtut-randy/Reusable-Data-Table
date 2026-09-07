import type { SVGProps } from 'react'

/* Every icon in this app is hand-authored inline SVG following the team's `*SVG.tsx`
   convention. No icon library, which is a deliberate constraint of this exercise.

   `stroke='currentColor'` throughout means an icon inherits its colour from the text
   around it, so there is no icon-colour prop anywhere in the app. Size comes from the
   CSS class, not from a `size` prop, so `className='size-4'` works. */
export type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'>

export const ICON_BASE_PROPS = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
} as const
