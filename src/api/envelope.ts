import { ApiRequestError, type ApiEnvelope, type ApiErrorBody } from './types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function parseApiEnvelope<T>(payload: unknown): ApiEnvelope<T> {
  if (
    !isRecord(payload) ||
    typeof payload.success !== 'boolean' ||
    !('meta' in payload)
  ) {
    throw new ApiRequestError({
      message: 'Respons API tidak memiliki format envelope yang valid.',
      status: 500,
      code: 'INVALID_API_ENVELOPE',
    })
  }

  if (payload.success && !('data' in payload)) {
    throw new ApiRequestError({
      message: 'Respons API tidak memiliki data yang valid.',
      status: 500,
      code: 'INVALID_API_ENVELOPE',
    })
  }

  if (!payload.success) {
    throw new ApiRequestError({
      message:
        typeof payload.message === 'string'
          ? payload.message
          : 'Permintaan API gagal.',
      status: 500,
      code:
        isRecord(payload.error) && typeof payload.error.code === 'string'
          ? payload.error.code
          : undefined,
      details: isRecord(payload.error) ? payload.error.details : undefined,
      requestId:
        isRecord(payload.meta) && typeof payload.meta.requestId === 'string'
          ? payload.meta.requestId
          : undefined,
    })
  }

  return payload as unknown as ApiEnvelope<T>
}

export function parseApiErrorBody(payload: unknown): ApiErrorBody {
  return isRecord(payload) ? (payload as ApiErrorBody) : {}
}
