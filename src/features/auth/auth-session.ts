import { adminAuthApi, type AdminLoginRequest } from '@/api/auth-client'
import { useAuthStore } from '@/stores/auth-store'

let refreshInFlight: Promise<boolean> | null = null

export function getSafeRedirect(value: string | undefined) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/'
  return value
}

export async function signInAdmin(credentials: AdminLoginRequest) {
  const response = await adminAuthApi.login(credentials)
  const session = response.data
  useAuthStore.getState().auth.setSession(session)
  return session.user
}

export async function refreshAdminSession() {
  const { auth } = useAuthStore.getState()
  if (!auth.refreshToken) {
    auth.reset()
    return false
  }

  if (!refreshInFlight) {
    refreshInFlight = adminAuthApi
      .refresh(auth.refreshToken)
      .then(({ data }) => {
        useAuthStore.getState().auth.setAccessToken(data.accessToken)
        useAuthStore.getState().auth.setRefreshToken(data.refreshToken)
        return true
      })
      .catch(() => {
        useAuthStore.getState().auth.reset()
        return false
      })
      .finally(() => {
        refreshInFlight = null
      })
  }

  return refreshInFlight
}

export async function ensureAdminSession() {
  const { auth } = useAuthStore.getState()
  if (auth.accessToken) return true
  return refreshAdminSession()
}

export async function signOutAdmin() {
  const { auth } = useAuthStore.getState()
  try {
    if (auth.accessToken) await adminAuthApi.logout(auth.accessToken)
  } catch {
    // Local session cleanup in finally is the source of truth for logout.
  } finally {
    useAuthStore.getState().auth.reset()
  }
}
