import * as yup from 'yup'
import { API_BASE_PATH, REQUEST_TIMEOUT_MS } from 'constants/api'
import { ApiError } from './ApiError'

/* The only place raw `fetch` appears, enforced by a `no-restricted-globals` rule on every
   other layer. Its whole job is to turn an untyped response into either a validated,
   typed value or an ApiError: no formatting, no transforms, no domain logic. */

export type ApiRequest = {
  readonly path: string
  readonly query?: Record<string, string | number | boolean | undefined>
  readonly signal?: AbortSignal | undefined
  /** Absolute origin, required only from the server: Node's fetch has no notion of "the
   *  current page", so a relative URL throws there. */
  readonly origin?: string | undefined
}

const buildUrl = ({ path, query, origin }: ApiRequest): string => {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined) continue
    search.set(key, String(value))
  }
  const suffix = search.size > 0 ? `?${search.toString()}` : ''
  return `${origin ?? ''}${API_BASE_PATH}${path}${suffix}`
}

/** The caller's signal and the timeout are combined, not chosen between: a request has to
 *  be cancellable (a collapsed row) and bounded in time, and the two reasons stay
 *  distinguishable in the resulting ApiError. */
const withTimeoutSignal = (signal: AbortSignal | undefined): { signal: AbortSignal; done: () => void } => {
  const timeoutController = new AbortController()
  const timer = setTimeout(() => timeoutController.abort(new Error('timeout')), REQUEST_TIMEOUT_MS)

  const signals = signal ? [signal, timeoutController.signal] : [timeoutController.signal]
  return { signal: AbortSignal.any(signals), done: () => clearTimeout(timer) }
}

export const apiGet = async <TSchema extends yup.Schema>(request: ApiRequest, schema: TSchema): Promise<yup.InferType<TSchema>> => {
  const { signal, done } = withTimeoutSignal(request.signal)

  let response: Response
  try {
    response = await fetch(buildUrl(request), { signal, headers: { accept: 'application/json' } })
  } catch (error) {
    /* Only two things reach here and they stay distinguished: the caller aborted, which
       must not surface as an error, or the network failed. Anything else is rethrown. */
    if (request.signal?.aborted) throw new ApiError('Request cancelled.', 'aborted')
    if (error instanceof DOMException && error.name === 'AbortError') throw new ApiError('The request timed out.', 'timeout')
    throw new ApiError('Could not reach the server.', 'network')
  } finally {
    done()
  }

  const payload: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const message = typeof payload === 'object' && payload !== null && 'message' in payload ? String(payload.message) : response.statusText
    const requestId =
      typeof payload === 'object' &&
      payload !== null &&
      'error' in payload &&
      typeof payload.error === 'object' &&
      payload.error !== null &&
      'requestId' in payload.error
        ? String(payload.error.requestId)
        : undefined
    throw new ApiError(message || 'The server returned an error.', 'http', response.status, requestId)
  }

  /* Response validation. Without this a contract drift shows up as a crash deep inside
     a cell renderer during render, which is both hard to trace and unrecoverable for
     the table. Validated here it is just the error state. */
  try {
    return (await schema.validate(payload, { abortEarly: true, stripUnknown: false })) as yup.InferType<TSchema>
  } catch (error) {
    const detail = error instanceof yup.ValidationError ? error.message : 'unexpected shape'
    throw new ApiError(`The server sent data this app does not understand (${detail}).`, 'contract', response.status)
  }
}
