import { createFileRoute } from '@tanstack/react-router'
import { PaymentInvoiceDetailPage } from '@/features/payments'

export const Route = createFileRoute('/_authenticated/payments/invoices/$id')({
  component: PaymentInvoiceDetailPage,
})
