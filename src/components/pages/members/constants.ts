export const MEMBERS_CAPTION = 'Members of Dynamic Table Bristol'
export const MEMBERS_NOUN = 'members'

export const MEMBERS_COLUMN_ID = {
  name: 'name',
  reference: 'reference',
  tier: 'tier',
  homeZone: 'homeZone',
  visits: 'visits',
  lastVisitAt: 'lastVisitAt',
  joinedAt: 'joinedAt',
  status: 'status',
} as const

export const MEMBERS_COLUMN_WIDTH = { name: '240px', status: '130px' } as const

export const MEMBERS_DEFAULT_PAGE_SIZE = 25

/** Measured height of one real row (avatar plus a two-line identity cell). */
export const MEMBERS_ROW_HEIGHT_PX = 57
