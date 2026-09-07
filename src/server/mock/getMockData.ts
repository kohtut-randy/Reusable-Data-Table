import { SEED_CLASS_COUNT, SEED_MEMBER_COUNT, SEED_PAYOUT_COUNT } from 'constants/api'
import { STUDIO_TIME_ZONE, STUDIO_UTC_OFFSET_HOURS } from 'constants/datetime'
import type { AttendeeDTO, ClassDTO, ClassDiscipline, ClassStatus, InstructorSummary } from 'schemas/timetable.types'
import type { MemberDTO, MemberStatus, MemberTier } from 'schemas/members.types'
import type { PayoutDTO, PayoutSessionDTO, PayoutStatus } from 'schemas/payouts.types'
import { faker, REF_DATE, resetFaker } from './seed'

/* Server-only, enforced by an ESLint rule: importing this from a component would ship the
   5,000-row dataset and faker itself to the browser.

   Distributions are realistic rather than uniform, because uniform data hides the cases
   that matter: classes cluster at peak hours so the time column has ties, ~15% are full
   and 5% cancelled, ~8% have no attendees so the empty-child case occurs on its own, and
   pending payouts carry `paidAt: null` for the nulls-last behaviour. */

export type MockData = {
  readonly classes: readonly ClassDTO[]
  readonly attendeesByClass: ReadonlyMap<string, readonly AttendeeDTO[]>
  readonly payouts: readonly PayoutDTO[]
  readonly sessionsByPayout: ReadonlyMap<string, readonly PayoutSessionDTO[]>
  readonly members: readonly MemberDTO[]
}

const DISCIPLINES: readonly ClassDiscipline[] = ['bouldering', 'lead', 'strength', 'youth']
const ROOMS = ['Cave', 'Roof', 'Slab', 'Prow', 'Wave', 'Arete'] as const
const TIERS: readonly InstructorSummary['tier'][] = ['coach', 'senior', 'lead']

const CLASS_NAMES = [
  'Intro to Bouldering',
  'Slab Technique',
  'Power Endurance',
  'Youth Squad',
  'Lead Basics',
  'Crimp Strength',
  'Movement Lab',
  'Open Session Coaching',
  'Dyno Clinic',
  'Heel Hook Workshop',
  'Competition Prep',
  'Silver Climbers',
] as const

/* Peak hours in the studio's local clock. Weighted so the schedule looks like a real
   gym: a light morning, a dead afternoon and a packed evening. */
const START_HOURS = [7, 9, 10, 12, 17, 18, 18, 19, 19, 20, 20, 21] as const

const MINUTES_PER_HOUR = 60
const MS_PER_MINUTE = 60_000
const CLASS_LENGTH_MINUTES = 60
const DAYS_SPANNED = 28
const ATTENDEE_EMPTY_RATE = 0.08
const FULL_RATE = 0.15
const CANCELLED_RATE = 0.05

let cache: MockData | null = null

const pick = <T>(list: readonly T[]): T => list[faker.number.int({ min: 0, max: list.length - 1 })]!

/** Builds a UTC instant for a given day offset and local hour in the studio's zone. */
const instantFor = (dayOffset: number, hour: number, minute: number): Date => {
  const base = new Date(REF_DATE.getTime() + dayOffset * 24 * MINUTES_PER_HOUR * MS_PER_MINUTE)
  /* A studio-local hour maps to `hour - offset` in UTC. Written as an explicit offset
     rather than `new Date(y, m, d, h)`, which would use the SERVER's timezone and
     produce a different dataset on a machine in a different region. */
  const utcHour = hour - STUDIO_UTC_OFFSET_HOURS
  return new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate(), utcHour, minute, 0, 0))
}

const buildAttendees = (count: number): readonly AttendeeDTO[] =>
  Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    paymentType: pick(['membership', 'drop-in', 'class-pass', 'comp'] as const),
    bookingStatus: pick(['booked', 'booked', 'checked-in', 'waitlist', 'no-show'] as const),
    bookedAt: faker.date.recent({ days: 10 }).toISOString(),
  }))

const buildClasses = (count: number): { classes: ClassDTO[]; attendeesByClass: Map<string, readonly AttendeeDTO[]> } => {
  const classes: ClassDTO[] = []
  const attendeesByClass = new Map<string, readonly AttendeeDTO[]>()

  for (let index = 0; index < count; index += 1) {
    const id = `cls_${String(index + 1).padStart(5, '0')}`
    const dayOffset = index % DAYS_SPANNED
    const hour = pick(START_HOURS)
    const minute = pick([0, 0, 0, 30] as const)
    const startsAt = instantFor(dayOffset, hour, minute)
    const endsAt = new Date(startsAt.getTime() + CLASS_LENGTH_MINUTES * MS_PER_MINUTE)

    const capacity = pick([8, 10, 12, 12, 15, 16, 20] as const)
    const roll = faker.number.float({ min: 0, max: 1 })

    const isEmpty = roll < ATTENDEE_EMPTY_RATE
    const isCancelled = !isEmpty && roll < ATTENDEE_EMPTY_RATE + CANCELLED_RATE
    const isFull = !isEmpty && !isCancelled && roll < ATTENDEE_EMPTY_RATE + CANCELLED_RATE + FULL_RATE

    const booked = isEmpty ? 0 : isFull ? capacity : faker.number.int({ min: 1, max: Math.max(1, capacity - 1) })
    const status: ClassStatus = isCancelled ? 'cancelled' : booked >= capacity ? 'full' : 'scheduled'

    const attendees = buildAttendees(booked)
    attendeesByClass.set(id, attendees)

    classes.push({
      id,
      name: pick(CLASS_NAMES),
      discipline: pick(DISCIPLINES),
      instructor: {
        id: `ins_${faker.number.int({ min: 1, max: 24 })}`,
        name: faker.person.fullName(),
        tier: pick(TIERS),
      },
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      timeZone: STUDIO_TIME_ZONE,
      room: pick(ROOMS),
      booked,
      capacity,
      status,
    })
  }

  return { classes, attendeesByClass }
}

const PAYOUT_PERIOD_DAYS = 14
const SESSION_RATE_MINOR = [4500, 5500, 6500, 8000] as const
const FEE_RATE = 0.06

const buildPayouts = (count: number): { payouts: PayoutDTO[]; sessionsByPayout: Map<string, readonly PayoutSessionDTO[]> } => {
  const payouts: PayoutDTO[] = []
  const sessionsByPayout = new Map<string, readonly PayoutSessionDTO[]>()

  for (let index = 0; index < count; index += 1) {
    const id = `pay_${String(index + 1).padStart(5, '0')}`
    const periodIndex = Math.floor(index / 40)
    const periodStart = new Date(REF_DATE.getTime() - (periodIndex + 1) * PAYOUT_PERIOD_DAYS * 24 * 3600 * 1000)
    const periodEnd = new Date(periodStart.getTime() + (PAYOUT_PERIOD_DAYS - 1) * 24 * 3600 * 1000)

    const sessionCount = faker.number.int({ min: 1, max: 14 })

    const sessions: PayoutSessionDTO[] = Array.from({ length: sessionCount }, (_, sessionIndex) => {
      const rateMinor = pick(SESSION_RATE_MINOR)
      const attendees = faker.number.int({ min: 2, max: 18 })
      return {
        id: `${id}_s${sessionIndex + 1}`,
        className: pick(CLASS_NAMES),
        heldAt: new Date(periodStart.getTime() + sessionIndex * 24 * 3600 * 1000).toISOString(),
        attendees,
        rateMinor,
        earnedMinor: rateMinor,
      }
    })

    sessionsByPayout.set(id, sessions)

    const grossMinor = sessions.reduce((sum, session) => sum + session.earnedMinor, 0)
    const feesMinor = Math.round(grossMinor * FEE_RATE)

    const status: PayoutStatus = pick(['paid', 'paid', 'paid', 'processing', 'pending', 'failed'] as const)

    payouts.push({
      id,
      reference: `CRX-${String(2600 + index).padStart(5, '0')}`,
      instructor: {
        id: `ins_${faker.number.int({ min: 1, max: 24 })}`,
        name: faker.person.fullName(),
        tier: pick(TIERS),
      },
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      sessionCount,
      grossMinor,
      feesMinor,
      netMinor: grossMinor - feesMinor,
      currency: 'SGD',
      status,
      // null while not yet paid. The nulls-last demonstration on the Paid column.
      paidAt: status === 'paid' ? new Date(periodEnd.getTime() + 3 * 24 * 3600 * 1000).toISOString() : null,
    })
  }

  return { payouts, sessionsByPayout }
}

const MEMBER_TIERS: readonly MemberTier[] = ['casual', 'monthly', 'annual', 'student']
const GRADES = ['5+', '6A', '6A+', '6B', '6B+', '6C', '6C+', '7A', '7A+', '7B'] as const
const NEVER_VISITED_RATE = 0.06
const MEMBER_STATUS_ROLL: readonly MemberStatus[] = ['active', 'active', 'active', 'active', 'paused', 'expired']

const buildMembers = (count: number): MemberDTO[] =>
  Array.from({ length: count }, (_, index) => {
    const joinedDaysAgo = faker.number.int({ min: 5, max: 1400 })
    const joinedAt = new Date(REF_DATE.getTime() - joinedDaysAgo * 24 * 3600 * 1000)

    /* About 6% have never checked in, so `lastVisitAt: null` and `bestGrade: null`
       occur organically rather than only when a chaos flag is set. */
    const neverVisited = faker.number.float({ min: 0, max: 1 }) < NEVER_VISITED_RATE
    const visits = neverVisited ? 0 : faker.number.int({ min: 1, max: Math.min(400, joinedDaysAgo) })

    return {
      id: `mem_${String(index + 1).padStart(5, '0')}`,
      name: faker.person.fullName(),
      reference: `CRX-M${String(4100 + index).padStart(5, '0')}`,
      tier: pick(MEMBER_TIERS),
      status: pick(MEMBER_STATUS_ROLL),
      joinedAt: joinedAt.toISOString(),
      lastVisitAt: neverVisited
        ? null
        : new Date(REF_DATE.getTime() - faker.number.int({ min: 0, max: 90 }) * 24 * 3600 * 1000).toISOString(),
      visits,
      bestGrade: neverVisited ? null : pick(GRADES),
      homeZone: pick(ROOMS),
    }
  })

/** Built once at module scope, so a request never pays the generation cost. */
export const getMockData = (): MockData => {
  if (cache) return cache

  resetFaker()
  const { classes, attendeesByClass } = buildClasses(SEED_CLASS_COUNT)
  const { payouts, sessionsByPayout } = buildPayouts(SEED_PAYOUT_COUNT)

  const members = buildMembers(SEED_MEMBER_COUNT)

  cache = { classes, attendeesByClass, payouts, sessionsByPayout, members }
  return cache
}
