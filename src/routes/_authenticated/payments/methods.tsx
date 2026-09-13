import { createFileRoute } from '@tanstack/react-router'
import { PaymentMethodsPage } from '@/features/payments'

export const Route = createFileRoute('/_authenticated/payments/methods')({
  component: PaymentMethodsPage,
})
