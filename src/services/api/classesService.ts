import type { AttendeeDTO, ClassDTO } from 'schemas/timetable.types'
import { attendeeListSchema, classListSchema } from 'schemas/timetableValidation'
import { apiGet } from './apiClient'

/* API LAYER. Raw REST calls only: no formatting, no transforms, no domain logic.
   Its output is a usable, validated value the Data layer hands to Business code. */

export type ClassesQueryParams = {
  /** 1-BASED on the wire. The Data layer converts from the table's 0-based index. */
  readonly page: number
  readonly pageSize: number
  readonly sortBy?: string | undefined
  readonly sortDir?: 'asc' | 'desc' | undefined
  readonly q?: string | undefined
  /** Studio-local calendar date (YYYY-MM-DD). Scopes the response to one day. */
  readonly date?: string | undefined
  readonly includeAttendees?: boolean
  /** Edge-case triggers, driven by the in-app demo controls. */
  readonly delay?: number | undefined
  readonly fail?: boolean
  readonly failChildren?: boolean
  readonly empty?: boolean
  readonly emptyChildren?: boolean
}

export type ClassesListResponse = {
  readonly data: readonly ClassDTO[]
  readonly page: number
  readonly pageSize: number
  readonly total: number
  readonly sort: { readonly columnId: string; readonly direction: 'asc' | 'desc' } | null
}

const flagValue = (flag: boolean | undefined): '1' | undefined => (flag ? '1' : undefined)

export const fetchClasses = async (
  params: ClassesQueryParams,
  signal?: AbortSignal,
  /** Only set when called from the server; see apiClient's `origin`. */
  origin?: string,
): Promise<ClassesListResponse> => {
  const envelope = await apiGet(
    {
      path: '/classes',
      query: {
        page: params.page,
        pageSize: params.pageSize,
        sortBy: params.sortBy,
        sortDir: params.sortDir,
        q: params.q || undefined,
        date: params.date,
        include: params.includeAttendees ? 'attendees' : undefined,
        delay: params.delay,
        fail: flagValue(params.fail),
        empty: flagValue(params.empty),
        emptyChildren: flagValue(params.emptyChildren),
      },
      signal,
      origin,
    },
    classListSchema,
  )

  return {
    data: envelope.data as readonly ClassDTO[],
    page: envelope.page,
    pageSize: envelope.pageSize,
    total: envelope.total,
    sort: envelope.sort,
  }
}

export type AttendeesQueryParams = {
  readonly classId: string
  readonly delay?: number | undefined
  readonly failChildren?: boolean
  readonly emptyChildren?: boolean
}

export const fetchClassAttendees = async (params: AttendeesQueryParams, signal?: AbortSignal): Promise<readonly AttendeeDTO[]> => {
  const envelope = await apiGet(
    {
      path: `/classes/${encodeURIComponent(params.classId)}/attendees`,
      query: {
        delay: params.delay,
        failChildren: flagValue(params.failChildren),
        emptyChildren: flagValue(params.emptyChildren),
      },
      signal,
    },
    attendeeListSchema,
  )

  return envelope.data as readonly AttendeeDTO[]
}
