/* Every API-layer literal in one place. */

export const API_BASE_PATH = '/api'

/** Client-side ceiling on any single request. */
export const REQUEST_TIMEOUT_MS = 15000

/* Artificial latency bands, in ms. Children are slower than lists, as a second round
   trip usually is, which also makes the child skeleton visible rather than a flicker. */
export const LATENCY_LIST_MS = { min: 280, max: 700 } as const
export const LATENCY_CHILD_MS = { min: 400, max: 900 } as const

/** `?delay=` override, capped so a bad query cannot hang a page for a minute. */
export const MAX_FORCED_DELAY_MS = 10000

/** Successful envelope code. Mirrors the team's `code === 0 means success` contract. */
export const API_CODE_OK = 0

export const DEFAULT_API_PAGE_SIZE = 25
export const MAX_API_PAGE_SIZE = 200

/* 5,000 classes is deliberately larger than any page, so the no-virtualization argument
   is made against a real dataset rather than a toy one. */
export const SEED_CLASS_COUNT = 5000
export const SEED_PAYOUT_COUNT = 1200
export const SEED_MEMBER_COUNT = 2400
