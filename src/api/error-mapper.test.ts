import axios, { type InternalAxiosRequestConfig } from 'axios'
import { describe, expect, it } from 'vitest'
import { mapApiError } from './error-mapper'

describe('mapApiError', () => {
  it.each([
    [400, 'Permintaan tidak valid.'],
    [401, 'Sesi admin tidak valid.'],
    [403, 'Akses admin ditolak.'],
    [404, 'Data tidak ditemukan.'],
    [409, 'Permintaan bertabrakan dengan proses lain.'],
    [429, 'Terlalu banyak permintaan.'],
    [500, 'Terjadi kesalahan pada server.'],
  ])('maps HTTP %s with request ID and status', (status, fallback) => {
    const error = new axios.AxiosError(
      'Request failed',
      undefined,
      undefined,
      undefined,
      {
        status,
        statusText: 'Error',
        headers: {},
        config: { headers: {} } as InternalAxiosRequestConfig,
        data: {
          success: false,
          message: fallback,
          error: { code: `HTTP_${status}` },
          meta: { requestId: 'req-http' },
        },
      }
    )

    const mapped = mapApiError(error)
    expect(mapped.status).toBe(status)
    expect(mapped.message).toBe(fallback)
    expect(mapped.requestId).toBe('req-http')
  })

  it('uses a network-safe message when there is no response', () => {
    const mapped = mapApiError(new Error('offline'))
    expect(mapped.status).toBe(500)
    expect(mapped.message).toBe('offline')
  })
})
