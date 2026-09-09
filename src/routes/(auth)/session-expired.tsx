import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { SessionExpired } from '@/features/auth/session-expired'

const searchSchema = z.object({ redirect: z.string().optional() })

export const Route = createFileRoute('/(auth)/session-expired')({
  component: SessionExpired,
  validateSearch: searchSchema,
})
