import { describe, expect, it, vi } from 'vitest'
import { adminApi } from '@/api/admin-client'
import {
  createAdminUser,
  listAdminUsers,
  updateAdminPassword,
  updateAdminUser,
} from './api'

describe('admin users API mapping', () => {
  it('maps list query, create, profile, and password requests to admin endpoints', async () => {
    const get = vi.spyOn(adminApi, 'get').mockResolvedValue({
      data: [],
      success: true,
      meta: {},
      pagination: undefined,
    })
    const post = vi
      .spyOn(adminApi, 'post')
      .mockResolvedValue({ data: {}, success: true, meta: {} })
    const patch = vi
      .spyOn(adminApi, 'patch')
      .mockResolvedValue({ data: {}, success: true, meta: {} })
    await listAdminUsers({ page: 2, limit: 10, search: 'ali' })
    await createAdminUser({
      username: 'ali',
      name: 'Ali',
      password: 'password123',
    })
    await updateAdminUser(7, { username: 'ali2', name: 'Ali Baru' })
    await updateAdminPassword(7, 'password456')
    expect(get).toHaveBeenCalledWith('/internal/admin/users', {
      params: { page: 2, limit: 10, search: 'ali' },
    })
    expect(post).toHaveBeenCalledWith('/internal/admin/users', {
      username: 'ali',
      name: 'Ali',
      password: 'password123',
    })
    expect(patch).toHaveBeenNthCalledWith(1, '/internal/admin/users/7', {
      username: 'ali2',
      name: 'Ali Baru',
    })
    expect(patch).toHaveBeenNthCalledWith(
      2,
      '/internal/admin/users/7/password',
      { password: 'password456' }
    )
    vi.restoreAllMocks()
  })
})
