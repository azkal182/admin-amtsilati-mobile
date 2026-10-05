import { adminApi } from '@/api/admin-client'

export type AdminAppConfig = {
  whatsappAdminNumber: string
  whatsappStoreNumber: string
}

export const appConfigQueryKey = ['admin-app-config'] as const

export function getAdminAppConfig() {
  return adminApi.get<AdminAppConfig>('/internal/admin/app-config')
}

export function updateAdminAppConfig(input: AdminAppConfig) {
  return adminApi.put<AdminAppConfig>('/internal/admin/app-config', input)
}
