/* MODEL LAYER. See timetable.types.ts for why the DTOs live here and are hand-written. */

export type MemberTier = 'casual' | 'monthly' | 'annual' | 'student'
export type MemberStatus = 'active' | 'paused' | 'expired'

export type MemberDTO = {
  readonly id: string
  readonly name: string
  readonly reference: string
  readonly tier: MemberTier
  readonly status: MemberStatus
  /** UTC instant. */
  readonly joinedAt: string
  /** null when the member has never checked in: the nulls-last case again. */
  readonly lastVisitAt: string | null
  readonly visits: number
  /** Best send, on the Fontainebleau scale. Null until they log one. */
  readonly bestGrade: string | null
  readonly homeZone: string
}
