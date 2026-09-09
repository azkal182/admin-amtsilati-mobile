import { adminApi } from '@/api/admin-client'
import type { ApiEnvelope } from '@/api/types'

export type ProfileAdminUser = {
  id: number
  username: string
  name: string
  isActive: boolean
}

export type ProfileRole = {
  id: number
  code: string
  name: string
  description: string
  isSystem: boolean
}

export type ProfilePermission = {
  id: number
  code: string
  name: string
  description: string
}

export type ProfileAccess = {
  roles: ProfileRole[]
  permissions: ProfilePermission[]
}

export function getCurrentAdminProfile() {
  return adminApi.get<ProfileAdminUser>('/internal/admin/users/me')
}

export function getAdminProfileAccess(id: number) {
  return adminApi.get<ProfileAccess>(`/internal/admin/users/${id}/access`)
}

export type CurrentAdminProfileResponse = ApiEnvelope<ProfileAdminUser>
