export const notificationEventTypes = [
  'payment.paid',
  'payment.failed',
  'payment.expired',
  'payment.cancelled',
  'payment.updated',
  'savings.deposit.completed',
  'savings.withdrawal.completed',
  'savings.transfer.sent',
  'savings.transfer.received',
  'savings.payment.completed',
  'upt.deposit.completed',
  'upt.withdrawal.completed',
  'calendar.updated',
  'announcement.created',
  'announcement.test',
  'system.maintenance',
] as const

export type NotificationEventType = (typeof notificationEventTypes)[number]

export function isNotificationEventType(
  value: string
): value is NotificationEventType {
  return notificationEventTypes.some((eventType) => eventType === value)
}
