import { createFileRoute } from '@tanstack/react-router'
import { ModulePlaceholder } from '@/components/module-placeholder'

export const Route = createFileRoute('/_authenticated/students')({
  component: () => (
    <ModulePlaceholder
      title='Students'
      description='Lihat snapshot data santri secara read-only.'
    />
  ),
})
