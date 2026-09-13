import { afterEach, describe, expect, it, vi } from 'vitest'
import { adminApi } from '@/api/admin-client'
import {
  getPaymentInvoice,
  getPaymentSummary,
  listPaymentInvoices,
  paymentActionsApi,
  paymentConsumersApi,
  updatePaymentMethod,
} from './api'
import { paymentQueryKeys } from './query-keys'

describe('payments API mapping', () => {
  afterEach(() => vi.restoreAllMocks())

  it('keeps payment queries under one invalidation hierarchy', () => {
    expect(paymentQueryKeys.summary()).toEqual(['payments', 'summary'])
    expect(paymentQueryKeys.invoices({ status: 'all' })).toEqual([
      'payments',
      'invoices',
      { status: 'all' },
    ])
    expect(paymentQueryKeys.all).toEqual(['payments'])
  })

  it('maps summary, invoice monitoring, and invoice detail endpoints', async () => {
    const get = vi
      .spyOn(adminApi, 'get')
      .mockResolvedValue({ success: true, data: {}, meta: {} })

    await getPaymentSummary()
    await listPaymentInvoices({ status: 'pending', limit: 20, offset: 40 })
    await getPaymentInvoice(42)

    expect(get).toHaveBeenNthCalledWith(1, '/internal/admin/payments/summary')
    expect(get).toHaveBeenNthCalledWith(
      2,
      '/internal/admin/payments/invoices',
      {
        params: { status: 'pending', limit: 20, offset: 40 },
      }
    )
    expect(get).toHaveBeenNthCalledWith(
      3,
      '/internal/admin/payments/invoices/42'
    )
  })

  it('maps administrative methods, consumer, and recovery actions', async () => {
    const patch = vi
      .spyOn(adminApi, 'patch')
      .mockResolvedValue({ success: true, data: {}, meta: {} })
    const post = vi
      .spyOn(adminApi, 'post')
      .mockResolvedValue({ success: true, data: {}, meta: {} })

    await updatePaymentMethod('ewallet_ovo', {
      active: false,
      displayOrder: 250,
    })
    await paymentConsumersApi.update(12, { active: false })
    await paymentConsumersApi.rotateSecret(12)
    await paymentActionsApi.reconcile(42)
    await paymentActionsApi.replayOutbox(17)
    await paymentActionsApi.retryDelivery(55)

    expect(patch).toHaveBeenNthCalledWith(
      1,
      '/internal/admin/payments/methods/ewallet_ovo',
      {
        active: false,
        displayOrder: 250,
      }
    )
    expect(patch).toHaveBeenNthCalledWith(
      2,
      '/internal/admin/payments/consumers/12',
      { active: false }
    )
    expect(post).toHaveBeenNthCalledWith(
      1,
      '/internal/admin/payments/consumers/12/rotate-secret'
    )
    expect(post).toHaveBeenNthCalledWith(
      2,
      '/internal/admin/payments/invoices/42/reconcile'
    )
    expect(post).toHaveBeenNthCalledWith(
      3,
      '/internal/admin/payments/outbox/17/replay'
    )
    expect(post).toHaveBeenNthCalledWith(
      4,
      '/internal/admin/payments/deliveries/55/retry'
    )
  })

  it('maps consumer creation without exposing response secrets in its domain type', async () => {
    const post = vi
      .spyOn(adminApi, 'post')
      .mockResolvedValue({ success: true, data: {}, meta: {} })

    await paymentConsumersApi.create({
      name: 'finance-service',
      endpointUrl: 'https://finance.example.com/hooks/payment',
      secret: 'a-secret-with-at-least-16-chars',
      eventTypes: ['payment.paid'],
    })

    expect(post).toHaveBeenCalledWith('/internal/admin/payments/consumers', {
      name: 'finance-service',
      endpointUrl: 'https://finance.example.com/hooks/payment',
      secret: 'a-secret-with-at-least-16-chars',
      eventTypes: ['payment.paid'],
    })
  })
})
