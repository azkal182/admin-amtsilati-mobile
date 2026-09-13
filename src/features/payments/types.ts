import type { ApiEnvelope } from '@/api/types'

export type PaymentInvoiceStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'expired'
  | 'cancelled'

export type PaymentAttemptStatus =
  | 'created'
  | 'pending'
  | 'paid'
  | 'failed'
  | 'expired'
  | 'cancelled'
  | 'unknown'

export type PaymentMethodType =
  | 'qris'
  | 'virtual_account'
  | 'e_wallet'
  | 'retail'

export type PaymentMethodInstructionKind =
  | 'qr'
  | 'virtual_account'
  | 'payment_code'
  | 'app_link'
  | 'approval_push'
  | 'external_redirect'

export type PaymentInstruction = {
  kind: PaymentMethodInstructionKind
  qrString?: string
  qrImageUrl?: string
  paymentCode?: string
  actionUrl?: string
}

export type PaymentInvoiceItem = {
  id: number
  itemCode: string
  description: string
  quantity: number
  unitAmount: number
  itemPrefix: string
  subtotal: number
  createdAt: string
}

export type PaymentAttempt = {
  id: number
  paymentInvoiceId: number
  provider: string
  providerOrderId: string
  providerReference?: string
  paymentMethodId?: number | null
  paymentMethodCode: string
  paymentMethodName: string
  paymentMethodType: PaymentMethodType
  status: PaymentAttemptStatus
  checkoutUrl?: string
  paymentInstruction?: PaymentInstruction
  providerErrorCode?: string
  providerErrorMessage?: string
  expiresAt?: string | null
  createdAt: string
  updatedAt: string
}

export type PaymentInvoice = {
  id: number
  invoiceNumber: string
  idSantri: string
  currency: 'IDR'
  totalAmount: number
  status: PaymentInvoiceStatus
  expiresAt: string
  createdAt: string
  updatedAt: string
  items: PaymentInvoiceItem[]
  paymentAttempt?: PaymentAttempt
}

export type PaymentOperationalSummary = {
  invoicePending?: number
  invoicePaid?: number
  invoiceFailed?: number
  invoiceExpired?: number
  deliveryPending?: number
  deliveryRetrying?: number
  deliveryFailed?: number
  providerEventsRejected?: number
}

export type AdminPaymentMethod = {
  id: number
  code: string
  provider: string
  providerMethodCode: string
  type: PaymentMethodType
  name: string
  active: boolean
  productionApproved?: boolean
  displayOrder: number
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export type PaymentWebhookConsumer = {
  id: number
  name: string
  endpointUrl: string
  eventTypes: string[]
  active: boolean
  createdAt: string
  updatedAt: string
}

export type ProviderEventRecord = {
  id: number
  provider: string
  providerEventId: string
  providerOrderId: string
  eventType: string
  payload?: Record<string, unknown>
  signatureValid: boolean
  processingStatus: string
  errorMessage?: string
  createdAt: string
}

export type PaymentWebhookDelivery = {
  id: number
  outboxEventId?: number
  eventId?: string
  consumerId?: number
  consumerName?: string
  eventType?: string
  status?: string
  attemptCount?: number
  httpStatus?: number
  responseBody?: string
  errorMessage?: string
  nextAttemptAt?: string
  deliveredAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export type PaymentWebhookDeliveryAttempt = {
  id: number
  deliveryId: number
  attemptNumber: number
  status: 'delivered' | 'retrying' | 'failed'
  httpStatus: number
  responseBody?: string
  errorMessage?: string
  durationMs: number
  createdAt: string
}

export type PaymentMethodUpdate = {
  active?: boolean
  productionApproved?: boolean
  displayOrder?: number
}

export type PaymentWebhookConsumerCreate = {
  name: string
  endpointUrl: string
  secret: string
  eventTypes: string[]
  active?: boolean
}

export type PaymentWebhookConsumerUpdate = Partial<
  Omit<PaymentWebhookConsumerCreate, 'secret'>
>

export type PaymentInvoiceMonitor = {
  invoice: PaymentInvoice
  attempts: PaymentAttempt[]
}

export type PaymentInvoiceList = {
  items: PaymentInvoice[]
  total: number
  limit: number
  offset: number
}

export type PaymentInvoiceSearch = {
  status: PaymentInvoiceStatus | 'all'
  limit: number
  offset: number
}

export type PaymentSecretRotation = {
  consumerId: number
  secret: string
}

export type PaymentActionResponse = ApiEnvelope<unknown>
