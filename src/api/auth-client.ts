import axios from 'axios'
import { getApiUrl } from './config'
import { parseApiEnvelope } from './envelope'
import { mapApiError } from './error-mapper'
import type { ApiEnvelope } from './types'

export type AdminLoginRequest = {
  username: string
  password: string
}

export type AdminUserIdentity = {
  id: number
  username: string
  name: string
  iat?: number | null
  exp?: number | null
}

export type AdminLoginResponse = {
  user: AdminUserIdentity
  accessToken: string
  refreshToken: string
}

export type RefreshTokenResponse = {
  accessToken: string
  refreshToken: string
}

const authClient = axios.create({
  baseURL: getApiUrl(),
  headers: { 'Content-Type': 'application/json' },
})

async function send<T>(config: Parameters<typeof authClient.request>[0]) {
  try {
    const response = await authClient.request<unknown>(config)
    return parseApiEnvelope<T>(response.data)
  } catch (error) {
    throw mapApiError(error)
  }
}

export const adminAuthApi = {
  login: (
    credentials: AdminLoginRequest
  ): Promise<ApiEnvelope<AdminLoginResponse>> =>
    send({
      method: 'POST',
      url: '/internal/admin/auth/login',
      data: credentials,
    }),
  refresh: (refreshToken: string): Promise<ApiEnvelope<RefreshTokenResponse>> =>
    send({
      method: 'POST',
      url: '/internal/admin/auth/token/refresh',
      data: { refreshToken },
    }),
  logout: (accessToken?: string): Promise<ApiEnvelope<null>> =>
    send({
      method: 'POST',
      url: '/internal/admin/auth/logout',
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : undefined,
    }),
}
