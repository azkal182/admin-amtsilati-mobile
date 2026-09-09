import axios from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { adminApi } from '@/api/admin-client'
import { listStoreProducts, storeApi, uploadStoreImage } from './api'

describe('store API', () => {
  afterEach(() => vi.restoreAllMocks())

  it('maps product list filters to the admin endpoint', async () => {
    const get = vi
      .spyOn(adminApi, 'get')
      .mockResolvedValue({ success: true, data: [], meta: {} })

    await listStoreProducts({
      page: 2,
      limit: 20,
      search: 'kitab',
      available: 'true',
    })

    expect(get).toHaveBeenCalledWith('/internal/admin/store/products', {
      params: { page: 2, limit: 20, search: 'kitab', available: true },
    })
  })

  it('uses product detail and mutation endpoints', async () => {
    const get = vi
      .spyOn(adminApi, 'get')
      .mockResolvedValue({ success: true, data: {}, meta: {} })
    const post = vi
      .spyOn(adminApi, 'post')
      .mockResolvedValue({ success: true, data: {}, meta: {} })
    const patch = vi
      .spyOn(adminApi, 'patch')
      .mockResolvedValue({ success: true, data: {}, meta: {} })
    const input = {
      name: 'Kitab Amtsilati',
      description: 'Buku belajar',
      imageUrl: 'https://cdn.example.com/kitab.png',
      price: 50000,
      maxBuy: 2,
      available: true,
    }

    await storeApi.get(7)
    await storeApi.create(input)
    await storeApi.update(7, input)
    await storeApi.signUpload()

    expect(get).toHaveBeenCalledWith('/internal/admin/store/products/7')
    expect(post).toHaveBeenNthCalledWith(
      1,
      '/internal/admin/store/products',
      input
    )
    expect(post).toHaveBeenNthCalledWith(
      2,
      '/internal/admin/store/uploads/sign'
    )
    expect(patch).toHaveBeenCalledWith(
      '/internal/admin/store/products/7',
      input
    )
  })

  it('retries Cloudinary upload on 429 and returns only secure URL', async () => {
    vi.useFakeTimers()
    const rateLimit = Object.assign(new axios.AxiosError('rate limited'), {
      response: { status: 429 },
    })
    const upload = vi
      .spyOn(axios, 'post')
      .mockRejectedValueOnce(rateLimit)
      .mockResolvedValueOnce({
        data: { secure_url: 'https://cdn.example/image.png' },
      })

    const resultPromise = uploadStoreImage(
      {
        uploadUrl: 'https://api.cloudinary.com/upload',
        cloudName: 'amtsilati',
        apiKey: 'public-key',
        timestamp: 1,
        signature: 'signature',
        folder: 'store',
        expiresAt: '2026-09-09T00:00:00Z',
      },
      new File(['image'], 'image.png', { type: 'image/png' })
    )
    await vi.advanceTimersByTimeAsync(250)

    await expect(resultPromise).resolves.toBe('https://cdn.example/image.png')
    expect(upload).toHaveBeenCalledTimes(2)
    vi.useRealTimers()
  })
})
