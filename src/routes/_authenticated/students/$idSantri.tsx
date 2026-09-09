import { createFileRoute } from '@tanstack/react-router'
import { StudentDetailPage } from '@/features/students'

export const Route = createFileRoute('/_authenticated/students/$idSantri')({
  component: StudentDetailPage,
})
