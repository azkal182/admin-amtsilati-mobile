import { afterEach, describe, expect, it, vi } from 'vitest'
import { adminApi } from '@/api/admin-client'
import { getAdminAppConfig, updateAdminAppConfig } from './api'

describe('admin app config API', () => {
  afterEach(() => vi.restoreAllMocks())

  it('loads application contact numbers from the admin endpoint', async () => {
    const get = vi.spyOn(adminApi, 'get').mockResolvedValue({
      success: true,
      data: {
        whatsappAdminNumber: '6281234567890',
        whatsappStoreNumber: '6289876543210',
      },
      meta: {},
    })

    await getAdminAppConfig()

    expect(get).toHaveBeenCalledWith('/internal/admin/app-config')
  })

  it('replaces both contact numbers in one PUT request', async () => {
    const put = vi.spyOn(adminApi, 'put').mockResolvedValue({
      success: true,
      data: {
        whatsappAdminNumber: '',
        whatsappStoreNumber: '6289876543210',
      },
      meta: {},
    })
    const input = {
      whatsappAdminNumber: '',
      whatsappStoreNumber: '6289876543210',
    }

    await updateAdminAppConfig(input)

    expect(put).toHaveBeenCalledWith('/internal/admin/app-config', input)
  })
})
