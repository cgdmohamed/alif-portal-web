const DEFAULT_API_URL = 'https://api.aliffuture.com'

function normalizeApiUrl(value?: string) {
  const configuredUrl = value?.trim() || DEFAULT_API_URL
  const absoluteUrl = /^https?:\/\//i.test(configuredUrl)
    ? configuredUrl
    : `https://${configuredUrl.replace(/^\/+/, '')}`

  return absoluteUrl.replace(/\/+$/, '')
}

const API_URL = normalizeApiUrl(import.meta.env.VITE_API_URL)

export function apiAssetUrl(value: string) {
  if (/^https?:\/\//i.test(value)) return value
  return `${API_URL}/${value.replace(/^\/+/, '')}`
}

const ACCESS_TOKEN_KEY = 'alef_access_token'
const REFRESH_TOKEN_KEY = 'alef_refresh_token'

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

async function parseErrorMessage(res: Response) {
  try {
    const body = await res.json()
    return Array.isArray(body.message) ? body.message.join(', ') : (body.message ?? res.statusText)
  } catch {
    return res.statusText
  }
}

async function rawRequest(path: string, options: RequestInit) {
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  const res = await rawRequest('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  })
  if (!res.ok) {
    clearTokens()
    return false
  }
  const data = await res.json()
  setTokens(data.accessToken, data.refreshToken)
  return true
}

/**
 * Authenticated request helper. Retries once with a refreshed access token
 * on a 401, then gives up (caller should send the user back to /login).
 */
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  isRetry = false,
): Promise<T> {
  const accessToken = getAccessToken()
  const res = await rawRequest(path, {
    ...options,
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  })

  if (res.status === 401 && !isRetry && (await refreshAccessToken())) {
    return apiRequest<T>(path, options, true)
  }

  if (!res.ok) {
    throw new ApiError(res.status, await parseErrorMessage(res))
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => apiRequest<T>(path),
  post: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => apiRequest<T>(path, { method: 'DELETE' }),
}

/**
 * multipart/form-data upload — bypasses the JSON Content-Type that
 * `apiRequest` always sets, letting the browser attach its own boundary.
 */
export async function apiUpload<T>(path: string, formData: FormData, isRetry = false): Promise<T> {
  const accessToken = getAccessToken()
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    body: formData,
  })

  if (res.status === 401 && !isRetry && (await refreshAccessToken())) {
    return apiUpload<T>(path, formData, true)
  }
  if (!res.ok) {
    throw new ApiError(res.status, await parseErrorMessage(res))
  }
  return res.json() as Promise<T>
}
