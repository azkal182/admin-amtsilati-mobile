import { beforeEach, describe, expect, it, vi } from 'vitest'
import { adminAuthApi } from '@/api/auth-client'
import { ApiRequestError } from '@/api/types'
import { useAuthStore } from '@/stores/auth-store'
import {
  getSafeRedirect,
  refreshAdminSession,
  signOutAdmin,
  signInAdmin,
} from './auth-session'

describe('auth session helpers', () => {
  beforeEach(() => {
    useAuthStore.getState().auth.reset()
    vi.restoreAllMocks()
  })

  it('only allows internal absolute-path redirects', () => {
    expect(getSafeRedirect('/admin-users')).toBe('/admin-users')
    expect(getSafeRedirect('https://example.com')).toBe('/')
    expect(getSafeRedirect('//example.com')).toBe('/')
    expect(getSafeRedirect(undefined)).toBe('/')
  })

  it('clears the session when refresh is unavailable', async () => {
    useAuthStore.getState().auth.setAccessToken('expired-token')
    useAuthStore
      .getState()
      .auth.setUser({ id: 1, username: 'admin', name: 'Admin' })

    await expect(refreshAdminSession()).resolves.toBe(false)
    expect(useAuthStore.getState().auth.accessToken).toBe('')
    expect(useAuthStore.getState().auth.user).toBeNull()
  })

  it('stores the admin session returned by login', async () => {
    vi.spyOn(adminAuthApi, 'login').mockResolvedValue({
      success: true,
      data: {
        user: { id: 1, username: 'admin', name: 'Administrator' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      },
      meta: { timestamp: '2026-09-09T00:00:00.000Z' },
    })

    await signInAdmin({ username: 'admin', password: 'password' })
    expect(useAuthStore.getState().auth.user?.username).toBe('admin')
    expect(useAuthStore.getState().auth.accessToken).toBe('access-token')
    expect(useAuthStore.getState().auth.refreshToken).toBe('refresh-token')
  })

  it('deduplicates concurrent refresh calls', async () => {
    useAuthStore.getState().auth.setRefreshToken('refresh-token')
    const refresh = vi.spyOn(adminAuthApi, 'refresh').mockResolvedValue({
      success: true,
      data: {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      },
      meta: { timestamp: '2026-09-09T00:00:00.000Z' },
    })

    const result = await Promise.all([
      refreshAdminSession(),
      refreshAdminSession(),
    ])
    expect(result).toEqual([true, true])
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(useAuthStore.getState().auth.accessToken).toBe('new-access-token')
  })

  it('clears the session when refresh fails', async () => {
    useAuthStore.getState().auth.setRefreshToken('refresh-token')
    vi.spyOn(adminAuthApi, 'refresh').mockRejectedValue(
      new ApiRequestError({ status: 401, message: 'Refresh expired' })
    )

    await expect(refreshAdminSession()).resolves.toBe(false)
    expect(useAuthStore.getState().auth.refreshToken).toBe('')
    expect(useAuthStore.getState().auth.accessToken).toBe('')
  })

  it('always clears the session when logout fails', async () => {
    useAuthStore.getState().auth.setAccessToken('access-token')
    useAuthStore.getState().auth.setRefreshToken('refresh-token')
    vi.spyOn(adminAuthApi, 'logout').mockRejectedValue(
      new ApiRequestError({ status: 500, message: 'Logout failed' })
    )

    await signOutAdmin()
    expect(useAuthStore.getState().auth.accessToken).toBe('')
    expect(useAuthStore.getState().auth.refreshToken).toBe('')
  })
})
