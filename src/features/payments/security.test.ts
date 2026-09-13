import { describe, expect, it } from 'vitest'
import { PAYMENT_PERMISSIONS, hasPaymentPermission } from './permissions'
import {
  paymentMethodUpdateSchema,
  paymentWebhookConsumerCreateSchema,
  paymentWebhookConsumerUpdateSchema,
} from './schemas'

describe('payments permission and security rules', () => {
  it('uses explicit capability codes and does not grant missing permissions', () => {
    expect(PAYMENT_PERMISSIONS).toEqual({
      read: 'payments.read',
      manage: 'payments.manage',
      reconcile: 'payments.reconcile',
      retry: 'payments.webhook.retry',
    })
    expect(hasPaymentPermission(['payments.read'], 'payments.manage')).toBe(
      false
    )
    expect(hasPaymentPermission(['payments.manage'], 'payments.manage')).toBe(
      true
    )
  })

  it('rejects unsafe consumer input and accepts HTTPS with a strong secret', () => {
    expect(
      paymentWebhookConsumerCreateSchema.safeParse({
        name: 'finance',
        endpointUrl: 'http://finance.example.com/hook',
        secret: 'short',
        eventTypes: [],
      }).success
    ).toBe(false)
    expect(
      paymentWebhookConsumerCreateSchema.safeParse({
        name: 'finance',
        endpointUrl: 'https://finance.example.com/hook',
        secret: 'a-secret-with-at-least-16-chars',
        eventTypes: ['payment.paid'],
      }).success
    ).toBe(true)
  })

  it('prevents empty method updates and empty consumer subscriptions', () => {
    expect(paymentMethodUpdateSchema.safeParse({}).success).toBe(false)
    expect(
      paymentWebhookConsumerUpdateSchema.safeParse({ eventTypes: [] }).success
    ).toBe(false)
  })
})
