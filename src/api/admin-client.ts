import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { useAuthStore } from '@/stores/auth-store'
import { getApiUrl } from './config'
import { parseApiEnvelope } from './envelope'
import { mapApiError } from './error-mapper'
import { ApiRequestError, type ApiEnvelope } from './types'

export const adminClient = axios.create({
  baseURL: getApiUrl(),
  headers: { 'Content-Type': 'application/json' },
})

adminClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().auth.accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

adminClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(mapApiError(error))
)

async function request<T>(config: AxiosRequestConfig): Promise<ApiEnvelope<T>> {
  try {
    const response: AxiosResponse<unknown> = await adminClient.request(config)
    return parseApiEnvelope<T>(response.data)
  } catch (error) {
    throw mapApiError(error)
  }
}

export const adminApi = {
  request,
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'GET', url }),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'POST', url, data }),
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'PATCH', url, data }),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'DELETE', url }),
}

export function isApiRequestError(error: unknown): error is ApiRequestError {
  return error instanceof ApiRequestError
}
