import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { AdminUsersPage } from '@/features/admin-users'

export const Route = createFileRoute('/_authenticated/admin-users')({
  validateSearch: z.object({
    page: z.coerce.number().int().min(1).catch(1),
    limit: z.coerce.number().int().min(1).max(100).catch(20),
    search: z.string().catch(''),
  }),
  component: AdminUsersPage,
})
