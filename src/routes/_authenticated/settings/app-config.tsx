import { createFileRoute } from '@tanstack/react-router'
import { AppConfigSettings } from '@/features/settings/app-config'

export const Route = createFileRoute('/_authenticated/settings/app-config')({
  component: AppConfigSettings,
})
