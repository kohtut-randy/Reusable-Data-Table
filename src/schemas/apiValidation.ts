import * as yup from 'yup'
import { API_CODE_OK, DEFAULT_API_PAGE_SIZE, MAX_API_PAGE_SIZE } from 'constants/api'

/* yup sits in exactly two places, and this file serves both: request-query validation in
   the route handlers, and response validation in apiClient, so a malformed payload
   becomes the table's error state rather than a throw inside a cell renderer. It is not
   used for component props, which is TypeScript's job. */

export const sortDirectionSchema = yup.string().oneOf(['asc', 'desc'] as const)

/** 1-BASED on the wire, 0-based internally. The conversion happens in the service layer. */
export const listQuerySchema = yup.object({
  page: yup.number().integer().min(1).default(1),
  pageSize: yup.number().integer().min(1).max(MAX_API_PAGE_SIZE).default(DEFAULT_API_PAGE_SIZE),
  sortBy: yup.string().optional(),
  sortDir: sortDirectionSchema.default('asc'),
  q: yup.string().optional(),
})

export type ListQuery = yup.InferType<typeof listQuerySchema>

export const sortEnvelopeSchema = yup
  .object({
    columnId: yup.string().required(),
    direction: sortDirectionSchema.required(),
  })
  .nullable()
  .defined()

/** The response envelope, shared by every list endpoint. It echoes `page` and `sort` and
 *  the client adopts the echoed values, which is how an out-of-range page or an invalid
 *  sort key degrades into real rows instead of a 400. */
export const listEnvelopeSchema = <TItem extends yup.AnyObject>(item: yup.ObjectSchema<TItem>) =>
  yup.object({
    code: yup.number().oneOf([API_CODE_OK]).required(),
    message: yup.string().required(),
    data: yup.array(item).required(),
    page: yup.number().integer().min(1).required(),
    pageSize: yup.number().integer().min(1).required(),
    total: yup.number().integer().min(0).required(),
    sort: sortEnvelopeSchema,
    meta: yup
      .object({
        latencyMs: yup.number().required(),
        sortedOnServer: yup.boolean().required(),
      })
      .required(),
  })
