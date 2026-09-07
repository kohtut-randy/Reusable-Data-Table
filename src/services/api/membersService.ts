import type { MemberDTO } from 'schemas/members.types'
import { memberListSchema } from 'schemas/membersValidation'
import { apiGet } from './apiClient'

export type MembersQueryParams = {
  readonly page: number
  readonly pageSize: number
  readonly q?: string | undefined
  readonly delay?: number | undefined
  readonly fail?: boolean
  readonly empty?: boolean
}

export type MembersListResponse = {
  readonly data: readonly MemberDTO[]
  readonly page: number
  readonly pageSize: number
  readonly total: number
}

const flagValue = (flag: boolean | undefined): '1' | undefined => (flag ? '1' : undefined)

export const fetchMembers = async (params: MembersQueryParams, signal?: AbortSignal): Promise<MembersListResponse> => {
  const envelope = await apiGet(
    {
      path: '/members',
      query: {
        page: params.page,
        pageSize: params.pageSize,
        q: params.q || undefined,
        delay: params.delay,
        fail: flagValue(params.fail),
        empty: flagValue(params.empty),
      },
      signal,
    },
    memberListSchema,
  )

  return { data: envelope.data as readonly MemberDTO[], page: envelope.page, pageSize: envelope.pageSize, total: envelope.total }
}
