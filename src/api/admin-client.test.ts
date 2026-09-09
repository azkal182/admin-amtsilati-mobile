import type { AxiosResponse } from 'axios'
import { describe, expect, it } from 'vitest'
import { useAuthStore } from '@/stores/auth-store'
import { adminApi, adminClient } from './admin-client'

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
})
