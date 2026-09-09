import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { StoreProductsPage } from '@/features/store'

export const Route = createFileRoute('/_authenticated/store/products/')({
  validateSearch: z.object({
    page: z.coerce.number().int().min(1).catch(1),
    limit: z.coerce.number().int().min(1).max(100).catch(20),
    search: z.string().catch(''),
    available: z.enum(['all', 'true', 'false']).catch('all'),
  }),
  component: StoreProductsPage,
})
