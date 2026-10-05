import { afterEach, describe, expect, it, vi } from 'vitest'
import { adminApi } from '@/api/admin-client'
import { contactDirectoryApi } from './api'

describe('contact directory API', () => {
  afterEach(() => vi.restoreAllMocks())

  it('lists and loads an item by its backend UUID', async () => {
    const get = vi.spyOn(adminApi, 'get').mockResolvedValue({
      success: true,
      data: [],
      meta: {},
    })
    const id = '5a8c7bc2-7d2d-4bc2-bd43-8c99e63f0ced'

    await contactDirectoryApi.list()
    await contactDirectoryApi.get(id)

    expect(get).toHaveBeenNthCalledWith(1, '/internal/admin/contact-directory')
    expect(get).toHaveBeenNthCalledWith(
      2,
      `/internal/admin/contact-directory/${id}`
    )
  })

  it('creates without a frontend id and uses full replacement for updates', async () => {
    const post = vi.spyOn(adminApi, 'post').mockResolvedValue({
      success: true,
      data: { id: 'backend-generated-uuid' },
      meta: {},
    })
    const put = vi.spyOn(adminApi, 'put').mockResolvedValue({
      success: true,
      data: { id: 'backend-generated-uuid' },
      meta: {},
    })
    const input = {
      category: 'layanan_umum_pesantren' as const,
      name: 'Humas Pusat (Kominfo)',
      description: 'Informasi dan bantuan umum pesantren.',
      whatsappNumber: '6281234567890',
      displayOrder: 1,
      active: true,
    }
    const id = '5a8c7bc2-7d2d-4bc2-bd43-8c99e63f0ced'

    await contactDirectoryApi.create(input)
    await contactDirectoryApi.update(id, input)

    expect(post).toHaveBeenCalledWith(
      '/internal/admin/contact-directory',
      input
    )
    expect(put).toHaveBeenCalledWith(
      `/internal/admin/contact-directory/${id}`,
      input
    )
  })

  it('soft deletes by UUID', async () => {
    const del = vi.spyOn(adminApi, 'delete').mockResolvedValue({
      success: true,
      data: { id: '5a8c7bc2-7d2d-4bc2-bd43-8c99e63f0ced', status: 'DELETED' },
      meta: {},
    })
    const id = '5a8c7bc2-7d2d-4bc2-bd43-8c99e63f0ced'

    await contactDirectoryApi.delete(id)

    expect(del).toHaveBeenCalledWith(`/internal/admin/contact-directory/${id}`)
  })
})
