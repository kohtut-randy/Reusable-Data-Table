import * as yup from 'yup'
import { listEnvelopeSchema } from './apiValidation'

export const memberSchema = yup.object({
  id: yup.string().required(),
  name: yup.string().required(),
  reference: yup.string().required(),
  tier: yup
    .string()
    .oneOf(['casual', 'monthly', 'annual', 'student'] as const)
    .required(),
  status: yup
    .string()
    .oneOf(['active', 'paused', 'expired'] as const)
    .required(),
  joinedAt: yup.string().required(),
  /* Nullable AND defined, like the payouts' `paidAt`: "never visited" is a real value,
     and the sort key treats null as nulls-last. An absent field would be a contract
     violation rather than a member who has not been in yet. */
  lastVisitAt: yup.string().nullable().defined(),
  visits: yup.number().integer().min(0).required(),
  bestGrade: yup.string().nullable().defined(),
  homeZone: yup.string().required(),
})

export const memberListSchema = listEnvelopeSchema(memberSchema)
