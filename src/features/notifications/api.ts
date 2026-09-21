import { adminApi } from '@/api/admin-client'
import type { ApiEnvelope } from '@/api/types'
import type {
  NotificationAudit,
  NotificationDelivery,
  NotificationEvent,
  NotificationInstallation,
  NotificationList,
  NotificationSendInput,
  NotificationSendResult,
  NotificationSummary,
} from './types'

export type NotificationEventSearch = {
  limit: number
  offset: number
  status?: string
  category?: 'general' | 'user'
  appId?: string
  eventId?: string
  principalId?: string
  occurredAfter?: string
  occurredBefore?: string
}

export const notificationApi = {
  summary: () =>
    adminApi.get<NotificationSummary>('/internal/admin/notifications/summary'),
  send: (input: NotificationSendInput) =>
    adminApi.post<NotificationSendResult>(
      '/internal/admin/notifications/send',
      input
    ),
  events: (search: NotificationEventSearch) =>
    adminApi.get<NotificationList<NotificationEvent>>(
      '/internal/admin/notifications',
      { params: search }
    ),
  event: (id: string) =>
    adminApi.get<NotificationEvent>(
      `/internal/admin/notifications/${encodeURIComponent(id)}`
    ),
  deliveries: (id: string) =>
    adminApi.get<NotificationList<NotificationDelivery>>(
      `/internal/admin/notifications/${encodeURIComponent(id)}/deliveries`,
      { params: { limit: 100, offset: 0 } }
    ),
  delivery: (id: string) =>
    adminApi.get<NotificationDelivery>(
      `/internal/admin/notifications/deliveries/${encodeURIComponent(id)}`
    ),
  installations: (params: {
    limit: number
    offset: number
    appId?: string
    platform?: 'android' | 'ios'
    stale?: boolean
  }) =>
    adminApi.get<NotificationList<NotificationInstallation>>(
      '/internal/admin/notifications/installations',
      { params }
    ),
  audit: (params: { limit: number; offset: number }) =>
    adminApi.get<NotificationList<NotificationAudit>>(
      '/internal/admin/notifications/audit',
      { params }
    ),
  retry: (id: string, idempotencyKey: string) =>
    adminApi.post<NotificationDelivery>(
      `/internal/admin/notifications/deliveries/${encodeURIComponent(id)}/retry`,
      undefined,
      { headers: { 'Idempotency-Key': idempotencyKey } }
    ),
  cleanup: (input: { before?: string; dryRun: boolean }) =>
    adminApi.post<{ affected: number; dryRun: boolean }>(
      '/internal/admin/notifications/cleanup',
      input
    ),
}

export type NotificationResponse<T> = ApiEnvelope<T>
