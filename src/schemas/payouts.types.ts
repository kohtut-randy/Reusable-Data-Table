/* MODEL LAYER. See timetable.types.ts for why the DTOs live here and are hand-written. */

export type PayoutStatus = 'pending' | 'processing' | 'paid' | 'failed'
export type InstructorTier = 'coach' | 'senior' | 'lead'

export type PayoutSessionDTO = {
  readonly id: string
  readonly className: string
  /** UTC instant. */
  readonly heldAt: string
  readonly attendees: number
  /** Minor units (cents). Money is never a float. */
  readonly rateMinor: number
  readonly earnedMinor: number
}

export type PayoutDTO = {
  readonly id: string
  readonly reference: string
  readonly instructor: {
    readonly id: string
    readonly name: string
    readonly tier: InstructorTier
  }
  readonly periodStart: string
  readonly periodEnd: string
  readonly sessionCount: number
  /* All money in MINOR UNITS, divided only at the formatting boundary. A float dollar
     amount accumulates error as soon as it is summed, and this table sums. */
  readonly grossMinor: number
  readonly feesMinor: number
  readonly netMinor: number
  readonly currency: 'SGD'
  readonly status: PayoutStatus
  /** null while pending. This is the nulls-last sorting demonstration. */
  readonly paidAt: string | null
}
