import * as yup from 'yup'
import { listEnvelopeSchema } from './apiValidation'

export const payoutSessionSchema = yup.object({
  id: yup.string().required(),
  className: yup.string().required(),
  heldAt: yup.string().required(),
  attendees: yup.number().integer().min(0).required(),
  rateMinor: yup.number().integer().required(),
  earnedMinor: yup.number().integer().required(),
})

export const payoutSchema = yup.object({
  id: yup.string().required(),
  reference: yup.string().required(),
  instructor: yup
    .object({
      id: yup.string().required(),
      name: yup.string().required(),
      tier: yup
        .string()
        .oneOf(['coach', 'senior', 'lead'] as const)
        .required(),
    })
    .required(),
  periodStart: yup.string().required(),
  periodEnd: yup.string().required(),
  sessionCount: yup.number().integer().min(0).required(),
  grossMinor: yup.number().integer().required(),
  feesMinor: yup.number().integer().required(),
  netMinor: yup.number().integer().required(),
  currency: yup
    .string()
    .oneOf(['SGD'] as const)
    .required(),
  status: yup
    .string()
    .oneOf(['pending', 'processing', 'paid', 'failed'] as const)
    .required(),
  /* Nullable AND defined: `paidAt` is null while pending, and the difference between
     "explicitly null" and "absent" matters, because the sort key treats null as
     nulls-last while an absent field would be a contract violation. */
  paidAt: yup.string().nullable().defined(),
})

export const payoutListSchema = listEnvelopeSchema(payoutSchema)

export const payoutSessionListSchema = yup.object({
  code: yup.number().required(),
  message: yup.string().required(),
  data: yup.array(payoutSessionSchema).required(),
})
