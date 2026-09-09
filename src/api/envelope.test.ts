import { describe, expect, it } from 'vitest'
import { parseApiEnvelope } from './envelope'
import { ApiRequestError } from './types'

describe('parseApiEnvelope', () => {
  it('preserves data, metadata, and pagination', () => {
    const result = parseApiEnvelope<{ id: number }>({
      success: true,
      message: 'OK',
      data: { id: 1 },
      pagination: {
        total_records: 1,
        current_page: 1,
        total_pages: 1,
        next_page: null,
        prev_page: null,
      },
      meta: { timestamp: '2026-09-09T00:00:00.000Z', requestId: 'req-1' },
    })

    expect(result.data).toEqual({ id: 1 })
    expect(result.pagination?.next_page).toBeNull()
    expect(result.meta.requestId).toBe('req-1')
  })

  it('rejects malformed envelopes', () => {
    expect(() => parseApiEnvelope(null)).toThrow(ApiRequestError)
    expect(() => parseApiEnvelope({ success: true })).toThrow(
      'Respons API tidak memiliki format envelope yang valid.'
    )
  })

  it('maps an API error envelope to a typed error', () => {
    expect(() =>
      parseApiEnvelope({
        success: false,
        message: 'Validasi gagal',
        error: { code: 'VALIDATION_ERROR', details: { username: 'required' } },
        meta: { timestamp: '2026-09-09T00:00:00.000Z', requestId: 'req-2' },
      })
    ).toThrowError(
      expect.objectContaining({
        code: 'VALIDATION_ERROR',
        requestId: 'req-2',
        details: { username: 'required' },
      })
    )
  })
})
