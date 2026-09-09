import { createFileRoute } from '@tanstack/react-router'
import { ModulePlaceholder } from '@/components/module-placeholder'

export const Route = createFileRoute('/_authenticated/store/products/')({
  component: () => (
    <ModulePlaceholder
      title='Store Products'
      description='Kelola katalog produk Amtsilati.'
    />
  ),
})
