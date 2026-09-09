import { adminApi } from '@/api/admin-client'
import type { ApiEnvelope, ApiPagination } from '@/api/types'
import type { AdminUser, AdminUserInput, AdminUsersSearch } from './types'

export type PaginatedAdminUsers = {
  data: AdminUser[]
  pagination?: ApiPagination
}

export function listAdminUsers(search: AdminUsersSearch) {
  return adminApi.get<AdminUser[]>('/internal/admin/users', {
    params: {
      page: search.page,
      limit: search.limit,
      ...(search.search ? { search: search.search } : {}),
    },
  }) as Promise<ApiEnvelope<AdminUser[]>>
}

export function createAdminUser(input: Required<AdminUserInput>) {
  return adminApi.post<AdminUser>('/internal/admin/users', input)
}

export function updateAdminUser(
  id: number,
  input: Omit<AdminUserInput, 'password'>
) {
  return adminApi.patch<AdminUser>(`/internal/admin/users/${id}`, input)
}

export function updateAdminPassword(id: number, password: string) {
  return adminApi.patch<{ saved: boolean }>(
    `/internal/admin/users/${id}/password`,
    { password }
  )
}
