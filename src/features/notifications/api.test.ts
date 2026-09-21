import { afterEach, describe, expect, it, vi } from 'vitest'
import { adminApi } from '@/api/admin-client'
import { notificationApi } from './api'

describe('notification API', () => {
  afterEach(() => vi.restoreAllMocks())

  it('maps monitoring filters and never exposes provider tokens', async () => {
    const get = vi.spyOn(adminApi, 'get').mockResolvedValue({
      success: true,
      data: { items: [], total: 0, limit: 20, offset: 0 },
      meta: {},
    })
    await notificationApi.events({
      limit: 20,
      offset: 0,
      category: 'user',
      eventId: 'evt-1',
    })
    await notificationApi.installations({ limit: 20, offset: 0, stale: true })
    expect(get).toHaveBeenNthCalledWith(1, '/internal/admin/notifications', {
      params: { limit: 20, offset: 0, category: 'user', eventId: 'evt-1' },
    })
    expect(get).toHaveBeenNthCalledWith(
      2,
      '/internal/admin/notifications/installations',
      { params: { limit: 20, offset: 0, stale: true } }
    )
  })

  it('uses a caller-provided idempotency key for retry and supports cleanup dry-run', async () => {
    const post = vi
      .spyOn(adminApi, 'post')
      .mockResolvedValue({ success: true, data: {}, meta: {} })
    await notificationApi.retry('delivery-1', 'fixed-key')
    await notificationApi.cleanup({
      before: '2026-09-21T00:00:00Z',
      dryRun: true,
    })
    expect(post).toHaveBeenNthCalledWith(
      1,
      '/internal/admin/notifications/deliveries/delivery-1/retry',
      undefined,
      { headers: { 'Idempotency-Key': 'fixed-key' } }
    )
    expect(post).toHaveBeenNthCalledWith(
      2,
      '/internal/admin/notifications/cleanup',
      { before: '2026-09-21T00:00:00Z', dryRun: true }
    )
  })

  it('sends an admin notification payload without producer credentials', async () => {
    const post = vi
      .spyOn(adminApi, 'post')
      .mockResolvedValue({
        success: true,
        data: { eventId: 'evt-1' },
        meta: {},
      })
    await notificationApi.send({
      schemaVersion: 1,
      eventId: 'evt-1',
      category: 'user',
      idSantri: 'A2300262',
      eventType: 'payment.updated',
      content: { title: 'Test', body: 'Body' },
      metadata: { target: { screen: 'payment_detail' } },
    })
    expect(post).toHaveBeenCalledWith('/internal/admin/notifications/send', {
      schemaVersion: 1,
      eventId: 'evt-1',
      category: 'user',
      idSantri: 'A2300262',
      eventType: 'payment.updated',
      content: { title: 'Test', body: 'Body' },
      metadata: { target: { screen: 'payment_detail' } },
    })
  })
})
