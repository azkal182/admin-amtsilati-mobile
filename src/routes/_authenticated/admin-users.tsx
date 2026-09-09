import { createFileRoute } from '@tanstack/react-router'
import { ModulePlaceholder } from '@/components/module-placeholder'

export const Route = createFileRoute('/_authenticated/admin-users')({
  component: () => (
    <ModulePlaceholder
      title='Admin Users'
      description='Kelola pengguna administrator Amtsilati.'
    />
  ),
})
