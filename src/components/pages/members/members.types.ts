/* See timetable.types.ts: the DTOs live in the model layer and are re-exported here. */
export type { MemberDTO, MemberStatus, MemberTier } from 'schemas/members.types'

/** Edge-case triggers, surfaced through the demo-controls popover on this page too. */
export type MembersTestFlags = {
  readonly slow: boolean
  readonly delayMs: number
  readonly failList: boolean
  readonly emptyList: boolean
}
