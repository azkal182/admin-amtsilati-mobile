import { create } from 'zustand'

const REFRESH_TOKEN = 'amtsilati_admin_refresh_token'
const AUTH_USER = 'amtsilati_admin_user'

export interface AuthUser {
  id: number
  username: string
  name: string
  iat?: number | null
  exp?: number | null
}

function getRefreshToken() {
  if (typeof window === 'undefined') return ''
  return window.sessionStorage.getItem(REFRESH_TOKEN) ?? ''
}

function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  const value = window.sessionStorage.getItem(AUTH_USER)
  if (!value) return null
  try {
    return JSON.parse(value) as AuthUser
  } catch {
    window.sessionStorage.removeItem(AUTH_USER)
    return null
  }
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    refreshToken: string
    setRefreshToken: (refreshToken: string) => void
    setSession: (session: {
      user: AuthUser
      accessToken: string
      refreshToken: string
    }) => void
    resetAccessToken: () => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  return {
    auth: {
      user: getUser(),
      setUser: (user) =>
        set((state) => {
          if (typeof window !== 'undefined') {
            if (user)
              window.sessionStorage.setItem(AUTH_USER, JSON.stringify(user))
            else window.sessionStorage.removeItem(AUTH_USER)
          }
          return { ...state, auth: { ...state.auth, user } }
        }),
      accessToken: '',
      setAccessToken: (accessToken) =>
        set((state) => ({ ...state, auth: { ...state.auth, accessToken } })),
      refreshToken: getRefreshToken(),
      setRefreshToken: (refreshToken) =>
        set((state) => {
          if (typeof window !== 'undefined') {
            if (refreshToken) {
              window.sessionStorage.setItem(REFRESH_TOKEN, refreshToken)
            } else {
              window.sessionStorage.removeItem(REFRESH_TOKEN)
            }
          }
          return { ...state, auth: { ...state.auth, refreshToken } }
        }),
      setSession: ({ user, accessToken, refreshToken }) =>
        set((state) => {
          if (typeof window !== 'undefined') {
            window.sessionStorage.setItem(REFRESH_TOKEN, refreshToken)
            window.sessionStorage.setItem(AUTH_USER, JSON.stringify(user))
          }
          return {
            ...state,
            auth: { ...state.auth, user, accessToken, refreshToken },
          }
        }),
      resetAccessToken: () =>
        set((state) => ({
          ...state,
          auth: { ...state.auth, accessToken: '' },
        })),
      reset: () =>
        set((state) => {
          if (typeof window !== 'undefined') {
            window.sessionStorage.removeItem(REFRESH_TOKEN)
            window.sessionStorage.removeItem(AUTH_USER)
          }
          return {
            ...state,
            auth: {
              ...state.auth,
              user: null,
              accessToken: '',
              refreshToken: '',
            },
          }
        }),
    },
  }
})
