import { createFileRoute } from '@tanstack/react-router'
import { PaymentConsumersPage } from '@/features/payments'

export const Route = createFileRoute('/_authenticated/payments/consumers')({
  component: PaymentConsumersPage,
})
