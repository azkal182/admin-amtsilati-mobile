import { adminApi } from '@/api/admin-client'
import type { ApiEnvelope, ApiPagination } from '@/api/types'
import type {
  CalendarEvent,
  CalendarEventInput,
  CalendarEventPatch,
  CalendarEventSearch,
} from './types'

export function listCalendarEvents(search: CalendarEventSearch) {
  return adminApi.get<CalendarEvent[]>('/internal/admin/events', {
    params: {
      page: search.page,
      limit: search.limit,
      ...(search.scope !== 'all' ? { scope: search.scope } : {}),
      ...(search.category !== 'all' ? { category: search.category } : {}),
      ...(search.status !== 'all' ? { status: search.status } : {}),
    },
  }) as Promise<ApiEnvelope<CalendarEvent[]> & { pagination?: ApiPagination }>
}

export const calendarEventsApi = {
  get: (id: string) =>
    adminApi.get<CalendarEvent>(
      `/internal/admin/events/${encodeURIComponent(id)}`
    ),
  create: (input: CalendarEventInput) =>
    adminApi.post<CalendarEvent>('/internal/admin/events', input),
  update: (id: string, input: CalendarEventPatch) =>
    adminApi.patch<CalendarEvent>(
      `/internal/admin/events/${encodeURIComponent(id)}`,
      input
    ),
  archive: (id: string) =>
    adminApi.delete<{ id: string; status: 'ARCHIVED' }>(
      `/internal/admin/events/${encodeURIComponent(id)}`
    ),
}
