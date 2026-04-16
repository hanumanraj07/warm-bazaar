import axios from 'axios'

const trimTrailingSlash = (value) => value.replace(/\/+$/, '')

const normalizeApiBaseUrl = (value) => {
  const raw = trimTrailingSlash(value || '')
  if (!raw) return raw

  // On Vercel multi-service deploys, backend is mounted under /_/backend.
  // If env accidentally points to same-origin /api, rewrite to the correct route.
  if (import.meta.env.PROD && typeof window !== 'undefined') {
    if (raw === '/api') return '/_/backend/api'
    try {
      const parsed = new URL(raw, window.location.origin)
      if (
        parsed.origin === window.location.origin &&
        trimTrailingSlash(parsed.pathname) === '/api'
      ) {
        return '/_/backend/api'
      }
    } catch {
      // Ignore invalid URL and keep original value.
    }
  }

  return raw
}

const getDefaultApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL)
  }
  if (import.meta.env.PROD) return '/_/backend/api'
  return 'http://localhost:4000/api'
}

const api = axios.create({
  baseURL: getDefaultApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

let authToken = null

api.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authToken = null
      localStorage.removeItem('auth_token')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const setAuthToken = (token) => {
  authToken = token
  if (token) {
    localStorage.setItem('auth_token', token)
  } else {
    localStorage.removeItem('auth_token')
  }
}

export const getAuthToken = () => {
  if (!authToken) {
    authToken = localStorage.getItem('auth_token')
  }
  return authToken
}

export default api
