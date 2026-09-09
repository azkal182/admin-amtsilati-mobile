import { AxiosError, type AxiosResponse } from 'axios'
import { describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@/stores/auth-store'
import { adminApi, adminClient } from './admin-client'
import { adminAuthApi } from './auth-client'
import { ApiRequestError } from './types'

describe('adminClient', () => {
  it('sends the admin bearer token without an internal token', async () => {
    const originalAdapter = adminClient.defaults.adapter
    let requestHeaders: Record<string, unknown> | undefined

    useAuthStore.getState().auth.setAccessToken('admin-access-token')
    adminClient.defaults.adapter = async (config) => {
      requestHeaders = config.headers.toJSON()
      return {
        data: {
          success: true,
          data: [{ id: 1 }],
          meta: { timestamp: '2026-09-09T00:00:00.000Z' },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      } as AxiosResponse
    }

    try {
      const response = await adminApi.get<{ id: number }[]>(
        '/internal/admin/users'
      )
      expect(response.data).toEqual([{ id: 1 }])
      expect(requestHeaders?.Authorization).toBe('Bearer admin-access-token')
      expect(requestHeaders?.['X-Internal-Token']).toBeUndefined()
    } finally {
      adminClient.defaults.adapter = originalAdapter
      useAuthStore.getState().auth.reset()
    }
  })

  it('refreshes once and retries a request after a 401', async () => {
    const originalAdapter = adminClient.defaults.adapter
    const refresh = vi.spyOn(adminAuthApi, 'refresh').mockResolvedValue({
      success: true,
      data: {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      },
      meta: { timestamp: '2026-09-09T00:00:00.000Z' },
    })
    let attempts = 0

    useAuthStore.getState().auth.setAccessToken('expired-token')
    useAuthStore.getState().auth.setRefreshToken('refresh-token')
    adminClient.defaults.adapter = async (config) => {
      attempts += 1
      if (attempts === 1) {
        throw new AxiosError(
          'Unauthorized',
          'ERR_BAD_REQUEST',
          config,
          undefined,
          {
            status: 401,
            statusText: 'Unauthorized',
            headers: {},
            config,
            data: { success: false, message: 'Unauthorized' },
          }
        )
      }
      return {
        data: {
          success: true,
          data: { ok: true },
          meta: { timestamp: '2026-09-09T00:00:00.000Z' },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      } as AxiosResponse
    }

    try {
      const response = await adminApi.get<{ ok: boolean }>(
        '/internal/admin/health'
      )
      expect(response.data).toEqual({ ok: true })
      expect(attempts).toBe(2)
      expect(refresh).toHaveBeenCalledTimes(1)
    } finally {
      adminClient.defaults.adapter = originalAdapter
      refresh.mockRestore()
      useAuthStore.getState().auth.reset()
    }
  })

  it('does not refresh a forbidden request', async () => {
    const originalAdapter = adminClient.defaults.adapter
    const refresh = vi.spyOn(adminAuthApi, 'refresh')
    let attempts = 0

    useAuthStore.getState().auth.setAccessToken('admin-token')
    useAuthStore.getState().auth.setRefreshToken('refresh-token')
    adminClient.defaults.adapter = async (config) => {
      attempts += 1
      throw new AxiosError('Forbidden', 'ERR_BAD_REQUEST', config, undefined, {
        status: 403,
        statusText: 'Forbidden',
        headers: {},
        config,
        data: { success: false, message: 'Forbidden' },
      })
    }

    try {
      await expect(
        adminApi.get('/internal/admin/users')
      ).rejects.toBeInstanceOf(ApiRequestError)
      expect(attempts).toBe(1)
      expect(refresh).not.toHaveBeenCalled()
    } finally {
      adminClient.defaults.adapter = originalAdapter
      refresh.mockRestore()
      useAuthStore.getState().auth.reset()
    }
  })
})
