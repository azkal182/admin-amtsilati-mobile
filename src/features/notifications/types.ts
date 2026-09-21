export type NotificationSummary = {
  fanoutPending: number
  deliveryPending: number
  deliveryRetry: number
  deliverySuppressed: number
  deliveryAccepted: number
  deliveryDeadLetter: number
}

export type NotificationEvent = {
  notificationId: string
  eventId: string
  producerId?: string
  appId: string
  category: 'general' | 'user'
  eventType: string
  principalId?: string | null
  sequence?: number | null
  createdAt: string
  expiresAt?: string | null
  content?: { title?: string; body?: string } | Record<string, unknown>
  metadata?: Record<string, unknown>
}

export type NotificationDelivery = {
  id: string
  notificationId: string
  installationId: string
  bindingId?: string | null
  platform: 'android' | 'ios' | string
  appVersion?: string | null
  status: string
  attemptCount: number
  providerStatus?: string | null
  providerMessageId?: string | null
  failureCode?: string | null
  lastError?: string | null
  createdAt: string
  updatedAt: string
  availableAt?: string | null
}

export type NotificationInstallation = {
  installationId: string
  appId: string
  platform: 'android' | 'ios' | string
  appVersion?: string | null
  pushPermission?: string | null
  lastSeenAt?: string | null
  stale: boolean
  bindingActive?: boolean
}

export type NotificationAudit = {
  id: string
  actor?: string | null
  action: string
  resource: string
  requestId?: string | null
  statusHttp: number
  createdAt: string
}

export type NotificationList<T> = {
  items: T[]
  total: number
  limit: number
  offset: number
}

export type NotificationSendInput = {
  schemaVersion: 1
  eventId: string
  category: 'general' | 'user'
  idSantri?: string
  eventType: string
  content: { title: string; body: string }
  metadata: { resourceId?: string; target?: { screen: string } }
}

export type NotificationSendResult = {
  notificationId?: string
  eventId: string
  queued?: boolean
  duplicate?: boolean
}
