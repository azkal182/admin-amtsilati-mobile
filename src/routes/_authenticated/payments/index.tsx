import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { PaymentsPage } from '@/features/payments'

export const Route = createFileRoute('/_authenticated/payments/')({
  validateSearch: z.object({
    status: z
      .enum(['all', 'pending', 'paid', 'failed', 'expired', 'cancelled'])
      .catch('all'),
    limit: z.coerce.number().int().min(1).max(100).catch(20),
    offset: z.coerce.number().int().min(0).catch(0),
  }),
  component: PaymentsPage,
})
