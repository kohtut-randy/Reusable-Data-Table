import type { InferType } from 'yup'
import type { payoutSchema, payoutSessionSchema } from './payoutsValidation'
import type { attendeeSchema, classSchema } from './timetableValidation'
import type { memberSchema } from './membersValidation'
import type { MemberDTO } from './members.types'
import type { AttendeeDTO, ClassDTO } from './timetable.types'
import type { PayoutDTO, PayoutSessionDTO } from './payouts.types'

/* The drift guard for the hand-written DTOs, run by `npm run typecheck`.
 *
 * It compares field names in both directions, which is the drift that actually happens:
 * a field added to the schema and not the type, or the reverse. Comparing the full types
 * would drown in noise, since InferType widens `.oneOf([...]).required()` and turns
 * readonly arrays mutable. Every import is `import type`, so nothing reaches a bundle. */

/** `true` only when the two key sets are identical. Anything else fails to compile. */
type KeysMatch<A, B> = [keyof A] extends [keyof B] ? ([keyof B] extends [keyof A] ? true : never) : never

export const CLASS_CONTRACT_MATCHES: KeysMatch<InferType<typeof classSchema>, ClassDTO> = true
export const ATTENDEE_CONTRACT_MATCHES: KeysMatch<InferType<typeof attendeeSchema>, AttendeeDTO> = true
export const PAYOUT_CONTRACT_MATCHES: KeysMatch<InferType<typeof payoutSchema>, PayoutDTO> = true
export const PAYOUT_SESSION_CONTRACT_MATCHES: KeysMatch<InferType<typeof payoutSessionSchema>, PayoutSessionDTO> = true
export const MEMBER_CONTRACT_MATCHES: KeysMatch<InferType<typeof memberSchema>, MemberDTO> = true
