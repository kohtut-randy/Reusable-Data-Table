import * as yup from 'yup'
import { listEnvelopeSchema } from './apiValidation'

/* The response contract for the timetable endpoints.
 *
 * Domain types derive from these schemas via `yup.InferType`, so the contract and the
 * type cannot drift: changing the schema changes the type, and the compiler finds every
 * consumer. A hand-written type next to a schema is two sources of truth. */

export const attendeeSchema = yup.object({
  id: yup.string().required(),
  name: yup.string().required(),
  paymentType: yup
    .string()
    .oneOf(['membership', 'drop-in', 'class-pass', 'comp'] as const)
    .required(),
  bookingStatus: yup
    .string()
    .oneOf(['booked', 'checked-in', 'waitlist', 'no-show'] as const)
    .required(),
  bookedAt: yup.string().required(),
})

export const classSchema = yup.object({
  id: yup.string().required(),
  name: yup.string().required(),
  discipline: yup
    .string()
    .oneOf(['bouldering', 'lead', 'strength', 'youth'] as const)
    .required(),
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
  startsAt: yup.string().required(),
  endsAt: yup.string().required(),
  timeZone: yup.string().required(),
  room: yup.string().required(),
  booked: yup.number().integer().min(0).required(),
  capacity: yup.number().integer().min(0).required(),
  status: yup
    .string()
    .oneOf(['scheduled', 'full', 'cancelled'] as const)
    .required(),
  attendees: yup.array(attendeeSchema).optional(),
})

export const classListSchema = listEnvelopeSchema(classSchema)

export const attendeeListSchema = yup.object({
  code: yup.number().required(),
  message: yup.string().required(),
  data: yup.array(attendeeSchema).required(),
})
