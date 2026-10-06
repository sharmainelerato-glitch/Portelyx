const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

export const API_BASE_URL =
  configuredApiBaseUrl || 'http://127.0.0.1:8000'

export const apiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  return `${API_BASE_URL.replace(/\/+$/, '')}${normalizedPath}`
}