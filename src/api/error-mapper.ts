import axios from 'axios'
import { parseApiErrorBody } from './envelope'
import { ApiRequestError, type ApiErrorStatus } from './types'

function statusOf(value: number | undefined): ApiErrorStatus {
  return value ?? 500
}

export function mapApiError(error: unknown): ApiRequestError {
  if (error instanceof ApiRequestError) return error

  if (axios.isAxiosError(error)) {
    const body = parseApiErrorBody(error.response?.data)
    return new ApiRequestError({
      message:
        body.message ||
        (error.response
          ? 'Server menolak permintaan API.'
          : 'Tidak dapat terhubung ke server API.'),
      status: statusOf(error.response?.status),
      code: body.error?.code,
      details: body.error?.details,
      requestId: body.meta?.requestId,
    })
  }

  return new ApiRequestError({
    message: error instanceof Error ? error.message : 'Terjadi kesalahan API.',
    status: 500,
  })
}
