import { createFileRoute } from '@tanstack/react-router'
import { ModulePlaceholder } from '@/components/module-placeholder'

export const Route = createFileRoute('/_authenticated/events')({
  component: () => (
    <ModulePlaceholder
      title='Calendar Events'
      description='Kelola event kalender Amtsilati.'
    />
  ),
})
