export type ApiMeta = {
  timestamp?: string
  requestId?: string
}

export type ApiPagination = {
  total_records: number
  current_page: number
  total_pages: number
  next_page: number | null
  prev_page: number | null
}

export type ApiEnvelope<T> = {
  success: boolean
  message?: string
  data: T
  meta: ApiMeta
  pagination?: ApiPagination
}

export type ApiErrorBody = {
  success?: false
  message?: string
  error?: {
    code?: string
    details?: unknown
  }
  meta?: ApiMeta
}

export type ApiErrorStatus =
  | 400
  | 401
  | 403
  | 404
  | 409
  | 429
  | 500
  | 502
  | 503
  | number

export class ApiRequestError extends Error {
  readonly status: ApiErrorStatus
  readonly code?: string
  readonly details?: unknown
  readonly requestId?: string

  constructor({
    message,
    status,
    code,
    details,
    requestId,
  }: {
    message: string
    status: ApiErrorStatus
    code?: string
    details?: unknown
    requestId?: string
  }) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.code = code
    this.details = details
    this.requestId = requestId
  }
}
