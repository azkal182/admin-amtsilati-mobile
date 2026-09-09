import axios from 'axios'
import { adminApi } from '@/api/admin-client'
import type { ApiEnvelope, ApiPagination } from '@/api/types'
import type {
  StoreProduct,
  StoreProductInput,
  StoreProductSearch,
  StoreProductDelete,
  StoreUploadSign,
} from './types'

export function listStoreProducts(search: StoreProductSearch) {
  return adminApi.get<StoreProduct[]>('/internal/admin/store/products', {
    params: {
      page: search.page,
      limit: search.limit,
      ...(search.search ? { search: search.search } : {}),
      ...(search.available !== 'all'
        ? { available: search.available === 'true' }
        : {}),
    },
  }) as Promise<ApiEnvelope<StoreProduct[]> & { pagination?: ApiPagination }>
}

export const storeApi = {
  get: (id: number) =>
    adminApi.get<StoreProduct>(`/internal/admin/store/products/${id}`),
  create: (input: StoreProductInput) =>
    adminApi.post<StoreProduct>('/internal/admin/store/products', input),
  update: (id: number, input: StoreProductInput) =>
    adminApi.patch<StoreProduct>(`/internal/admin/store/products/${id}`, input),
  delete: (id: number) =>
    adminApi.delete<StoreProductDelete>(`/internal/admin/store/products/${id}`),
  signUpload: () =>
    adminApi.post<StoreUploadSign>('/internal/admin/store/uploads/sign'),
}

export async function uploadStoreImage(
  sign: StoreUploadSign,
  file: File,
  maxRetries = 2
) {
  const form = new FormData()
  form.append('file', file)
  form.append('api_key', sign.apiKey)
  form.append('timestamp', String(sign.timestamp))
  form.append('signature', sign.signature)
  form.append('folder', sign.folder)
  for (let attempt = 0; ; attempt += 1) {
    try {
      const response = await axios.post<{ secure_url?: string }>(
        sign.uploadUrl,
        form
      )
      if (!response.data.secure_url)
        throw new Error('Upload tidak mengembalikan secure URL.')
      return response.data.secure_url
    } catch (error) {
      if (
        !axios.isAxiosError(error) ||
        error.response?.status !== 429 ||
        attempt >= maxRetries
      )
        throw error
      await new Promise((resolve) =>
        globalThis.setTimeout(resolve, 250 * 2 ** attempt)
      )
    }
  }
}
