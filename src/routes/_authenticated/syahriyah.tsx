import { createFileRoute } from '@tanstack/react-router'
import { SyahriyahPage } from '@/features/syahriyah'

export const Route = createFileRoute('/_authenticated/syahriyah')({
  component: SyahriyahPage,
})
