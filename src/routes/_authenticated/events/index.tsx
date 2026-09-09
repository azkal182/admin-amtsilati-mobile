import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { CalendarEventsPage } from '@/features/calendar-events'

export const Route = createFileRoute('/_authenticated/events/')({
  validateSearch: z.object({
    page: z.coerce.number().int().min(1).catch(1),
    limit: z.coerce.number().int().min(1).max(100).catch(20),
    scope: z.enum(['all', 'NATIONAL', 'PESANTREN']).catch('all'),
    category: z
      .enum([
        'all',
        'ISLAMIC',
        'NATIONAL',
        'ACADEMIC',
        'PESANTREN',
        'PAYMENT',
        'HOLIDAY',
        'ANNOUNCEMENT',
        'OTHER',
      ])
      .catch('all'),
    status: z.enum(['all', 'DRAFT', 'PUBLISHED', 'ARCHIVED']).catch('all'),
  }),
  component: CalendarEventsPage,
})
