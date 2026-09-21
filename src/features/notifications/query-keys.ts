export const notificationQueryKeys = {
  all: ['notifications'] as const,
  summary: () => ['notifications', 'summary'] as const,
  events: (search: unknown) => ['notifications', 'events', search] as const,
  event: (id: string) => ['notifications', 'event', id] as const,
  deliveries: (id: string) => ['notifications', 'deliveries', id] as const,
  installations: (search: unknown) =>
    ['notifications', 'installations', search] as const,
  audit: (search: unknown) => ['notifications', 'audit', search] as const,
}
