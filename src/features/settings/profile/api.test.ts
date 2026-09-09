import { describe, expect, it, vi } from 'vitest'
import { adminApi } from '@/api/admin-client'
import { getAdminProfileAccess, getCurrentAdminProfile } from './api'

describe('profile API mapping', () => {
  it('loads the current admin profile and effective access', async () => {
    const get = vi.spyOn(adminApi, 'get').mockResolvedValue({
      data: { roles: [], permissions: [] },
      success: true,
      meta: {},
    })

    await getCurrentAdminProfile()
    await getAdminProfileAccess(7)

    expect(get).toHaveBeenNthCalledWith(1, '/internal/admin/users/me')
    expect(get).toHaveBeenNthCalledWith(2, '/internal/admin/users/7/access')
    vi.restoreAllMocks()
  })
})
