import { describe, expect, it, vi } from 'vitest'
import { adminApi } from '@/api/admin-client'
import {
  adminAccessApi,
  createAdminUser,
  listAdminUsers,
  updateAdminPassword,
  updateAdminUser,
} from './api'

describe('admin users API mapping', () => {
  it('maps access catalog, effective access, role assignment, and revoke', async () => {
    const get = vi
      .spyOn(adminApi, 'get')
      .mockResolvedValue({ data: [], success: true, meta: {} })
    const post = vi
      .spyOn(adminApi, 'post')
      .mockResolvedValue({ data: {}, success: true, meta: {} })
    const remove = vi
      .spyOn(adminApi, 'delete')
      .mockResolvedValue({ data: {}, success: true, meta: {} })
    await adminAccessApi.roles()
    await adminAccessApi.permissions()
    await adminAccessApi.access(7)
    await adminAccessApi.assignRole(7, 'event_editor')
    await adminAccessApi.revokeRole(7, 'event_editor')
    expect(get).toHaveBeenNthCalledWith(1, '/internal/admin/roles')
    expect(get).toHaveBeenNthCalledWith(2, '/internal/admin/permissions')
    expect(get).toHaveBeenNthCalledWith(3, '/internal/admin/users/7/access')
    expect(post).toHaveBeenCalledWith('/internal/admin/users/7/roles', {
      roleCode: 'event_editor',
    })
    expect(remove).toHaveBeenCalledWith(
      '/internal/admin/users/7/roles/event_editor'
    )
    vi.restoreAllMocks()
  })

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
