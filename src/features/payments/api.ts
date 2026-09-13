import { adminApi } from '@/api/admin-client'
import type { ApiEnvelope } from '@/api/types'
import type {
  AdminPaymentMethod,
  PaymentActionResponse,
  PaymentInvoice,
  PaymentInvoiceList,
  PaymentInvoiceMonitor,
  PaymentInvoiceSearch,
  PaymentMethodUpdate,
  PaymentOperationalSummary,
  PaymentSecretRotation,
  PaymentWebhookConsumer,
  PaymentWebhookConsumerCreate,
  PaymentWebhookConsumerUpdate,
  PaymentWebhookDelivery,
  PaymentWebhookDeliveryAttempt,
  ProviderEventRecord,
} from './types'

export function getPaymentSummary() {
  return adminApi.get<PaymentOperationalSummary>(
    '/internal/admin/payments/summary'
  )
}

export function listPaymentMethods() {
  return adminApi.get<AdminPaymentMethod[]>('/internal/admin/payments/methods')
}

export function updatePaymentMethod(code: string, input: PaymentMethodUpdate) {
  return adminApi.patch<AdminPaymentMethod>(
    `/internal/admin/payments/methods/${encodeURIComponent(code)}`,
    input
  )
}

export function listPaymentInvoices(search: PaymentInvoiceSearch) {
  return adminApi.get<PaymentInvoiceList>('/internal/admin/payments/invoices', {
    params: {
      ...(search.status !== 'all' ? { status: search.status } : {}),
      limit: search.limit,
      offset: search.offset,
    },
  })
}

export function getPaymentInvoice(id: number) {
  return adminApi.get<PaymentInvoiceMonitor>(
    `/internal/admin/payments/invoices/${id}`
  )
}

export function listPaymentInvoiceEvents(id: number) {
  return adminApi.get<ProviderEventRecord[]>(
    `/internal/admin/payments/invoices/${id}/events`
  )
}

export function listPaymentInvoiceDeliveries(id: number) {
  return adminApi.get<PaymentWebhookDelivery[]>(
    `/internal/admin/payments/invoices/${id}/deliveries`
  )
}

export function listDeliveryAttempts(id: number) {
  return adminApi.get<PaymentWebhookDeliveryAttempt[]>(
    `/internal/admin/payments/deliveries/${id}/attempts`
  )
}

export const paymentActionsApi = {
  reconcile: (id: number) =>
    adminApi.post<PaymentInvoiceMonitor>(
      `/internal/admin/payments/invoices/${id}/reconcile`
    ),
  replayOutbox: (id: number): Promise<PaymentActionResponse> =>
    adminApi.post<unknown>(`/internal/admin/payments/outbox/${id}/replay`),
  retryDelivery: (id: number): Promise<PaymentActionResponse> =>
    adminApi.post<unknown>(`/internal/admin/payments/deliveries/${id}/retry`),
}

export const paymentConsumersApi = {
  list: () =>
    adminApi.get<PaymentWebhookConsumer[]>(
      '/internal/admin/payments/consumers'
    ),
  create: (input: PaymentWebhookConsumerCreate) =>
    adminApi.post<PaymentWebhookConsumer>(
      '/internal/admin/payments/consumers',
      input
    ),
  update: (id: number, input: PaymentWebhookConsumerUpdate) =>
    adminApi.patch<PaymentWebhookConsumer>(
      `/internal/admin/payments/consumers/${id}`,
      input
    ),
  rotateSecret: (id: number) =>
    adminApi.post<PaymentSecretRotation>(
      `/internal/admin/payments/consumers/${id}/rotate-secret`
    ),
}

export type PaymentInvoiceResponse = ApiEnvelope<PaymentInvoice>
