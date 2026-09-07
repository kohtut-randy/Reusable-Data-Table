import type { PayoutDTO, PayoutSessionDTO } from 'schemas/payouts.types'
import { payoutListSchema, payoutSessionListSchema } from 'schemas/payoutsValidation'
import { apiGet } from './apiClient'

export type PayoutsQueryParams = {
  /** 1-BASED on the wire. */
  readonly page: number
  readonly pageSize: number
  readonly sortBy?: string | undefined
  readonly sortDir?: 'asc' | 'desc' | undefined
  readonly q?: string | undefined
  readonly delay?: number | undefined
  readonly fail?: boolean
  readonly empty?: boolean
}

export type PayoutsListResponse = {
  readonly data: readonly PayoutDTO[]
  readonly page: number
  readonly pageSize: number
  readonly total: number
  readonly sort: { readonly columnId: string; readonly direction: 'asc' | 'desc' } | null
}

const flagValue = (flag: boolean | undefined): '1' | undefined => (flag ? '1' : undefined)

export const fetchPayouts = async (
  params: PayoutsQueryParams,
  signal?: AbortSignal,
  /** Only set when called from the server; see apiClient's `origin`. */
  origin?: string,
): Promise<PayoutsListResponse> => {
  const envelope = await apiGet(
    {
      path: '/payouts',
      query: {
        page: params.page,
        pageSize: params.pageSize,
        sortBy: params.sortBy,
        sortDir: params.sortDir,
        q: params.q || undefined,
        delay: params.delay,
        fail: flagValue(params.fail),
        empty: flagValue(params.empty),
      },
      signal,
      origin,
    },
    payoutListSchema,
  )

  return {
    data: envelope.data as readonly PayoutDTO[],
    page: envelope.page,
    pageSize: envelope.pageSize,
    total: envelope.total,
    sort: envelope.sort,
  }
}

export type PayoutSessionsQueryParams = {
  readonly payoutId: string
  readonly delay?: number | undefined
  readonly failChildren?: boolean
  readonly emptyChildren?: boolean
}

export const fetchPayoutSessions = async (
  params: PayoutSessionsQueryParams,
  signal?: AbortSignal,
): Promise<readonly PayoutSessionDTO[]> => {
  const envelope = await apiGet(
    {
      path: `/payouts/${encodeURIComponent(params.payoutId)}/sessions`,
      query: {
        delay: params.delay,
        failChildren: flagValue(params.failChildren),
        emptyChildren: flagValue(params.emptyChildren),
      },
      signal,
    },
    payoutSessionListSchema,
  )

  return envelope.data as readonly PayoutSessionDTO[]
}
