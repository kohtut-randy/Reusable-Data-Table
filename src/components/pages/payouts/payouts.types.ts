/* See timetable.types.ts: the DTOs live in the model layer and are re-exported here. */
export type { InstructorTier, PayoutDTO, PayoutSessionDTO, PayoutStatus } from 'schemas/payouts.types'

/** Edge-case triggers, surfaced through the demo-controls popover on this page too. */
export type PayoutsTestFlags = {
  readonly slow: boolean
  readonly delayMs: number
  readonly failList: boolean
  readonly failChildren: boolean
  readonly emptyList: boolean
  readonly emptyChildren: boolean
}
