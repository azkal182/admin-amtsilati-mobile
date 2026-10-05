import { adminApi } from '@/api/admin-client'
import type {
  ContactDirectoryDelete,
  ContactDirectoryInput,
  ContactDirectoryItem,
} from './types'

export const contactDirectoryQueryKey = ['contact-directory'] as const

export const contactDirectoryApi = {
  list: () =>
    adminApi.get<ContactDirectoryItem[]>('/internal/admin/contact-directory'),
  get: (id: string) =>
    adminApi.get<ContactDirectoryItem>(
      `/internal/admin/contact-directory/${encodeURIComponent(id)}`
    ),
  create: (input: ContactDirectoryInput) =>
    adminApi.post<ContactDirectoryItem>(
      '/internal/admin/contact-directory',
      input
    ),
  update: (id: string, input: ContactDirectoryInput) =>
    adminApi.put<ContactDirectoryItem>(
      `/internal/admin/contact-directory/${encodeURIComponent(id)}`,
      input
    ),
  delete: (id: string) =>
    adminApi.delete<ContactDirectoryDelete>(
      `/internal/admin/contact-directory/${encodeURIComponent(id)}`
    ),
}
