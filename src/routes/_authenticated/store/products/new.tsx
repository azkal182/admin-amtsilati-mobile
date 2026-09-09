import { createFileRoute } from '@tanstack/react-router'
import { StoreProductEditorPage } from '@/features/store'

export const Route = createFileRoute('/_authenticated/store/products/new')({
  component: StoreProductEditorPage,
})
