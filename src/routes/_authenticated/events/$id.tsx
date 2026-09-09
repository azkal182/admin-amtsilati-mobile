import { createFileRoute } from '@tanstack/react-router'
import { CalendarEventEditorPage } from '@/features/calendar-events'

export const Route = createFileRoute('/_authenticated/events/$id')({
  component: CalendarEventEditorPage,
})
