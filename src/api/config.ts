const DEVELOPMENT_API_BASE_URL = 'http://localhost:4054'
const DEFAULT_API_PREFIX = '/api/v1'

function normalizePath(value: string) {
  return `/${value.replace(/^\/+|\/+$/g, '')}`
}

export const apiConfig = {
  baseUrl:
    import.meta.env.VITE_API_BASE_URL?.trim() ||
    (import.meta.env.DEV ? DEVELOPMENT_API_BASE_URL : ''),
  prefix: normalizePath(
    import.meta.env.VITE_API_PREFIX?.trim() || DEFAULT_API_PREFIX
  ),
  environment: import.meta.env.VITE_APP_ENV?.trim() || import.meta.env.MODE,
}

export function getApiBaseUrl() {
  return apiConfig.baseUrl.replace(/\/$/, '')
}

export function getApiUrl() {
  return `${getApiBaseUrl()}${apiConfig.prefix}`
}
