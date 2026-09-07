import { faker } from '@faker-js/faker'

/* `faker.seed()` alone is not enough: `faker.date.*` is relative to "now", so without a
   fixed reference date the dataset drifts on every cold start and can produce a hydration
   mismatch when a date crosses a boundary mid-render. Both are pinned here. */

export const SEED = 20260903
export const REF_DATE = new Date('2026-09-03T00:00:00.000Z')

export const resetFaker = (): void => {
  faker.seed(SEED)
  faker.setDefaultRefDate(REF_DATE)
}

export { faker }
