/**
 * One error type for every API failure, so a caller never has to distinguish a network
 * failure from a 500 from a schema mismatch when all three mean "show the error state".
 *
 * `kind` is there for the cases that DO differ: a validation failure is a bug worth
 * surfacing differently from a server error, and `timeout` deserves different copy.
 */
export type ApiErrorKind = 'network' | 'timeout' | 'http' | 'contract' | 'aborted'

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status: number | undefined
  readonly requestId: string | undefined

  constructor(message: string, kind: ApiErrorKind, status?: number, requestId?: string) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.status = status
    this.requestId = requestId
  }
}
