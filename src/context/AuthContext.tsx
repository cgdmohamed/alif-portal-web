import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, ApiError, clearTokens, getAccessToken, setTokens } from '../lib/api'

export type UserRole =
  | 'platform_admin'
  | 'school_admin'
  | 'teacher'
  | 'student'
  | 'parent'
  | 'support_agent'

export interface AuthUser {
  id: string
  name: string
  email: string | null
  phone: string | null
  role: UserRole
  schoolId: string | null
  status: string
}

interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  requestOtp: (email: string) => Promise<void>
  loginWithOtp: (email: string, code: string) => Promise<AuthUser>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!getAccessToken()) {
      setLoading(false)
      return
    }
    api
      .get<AuthUser>('/auth/me')
      .then(setUser)
      .catch(() => clearTokens())
      .finally(() => setLoading(false))
  }, [])

  async function login(email: string, password: string) {
    try {
      const data = await api.post<LoginResponse>('/auth/login', { email, password })
      setTokens(data.accessToken, data.refreshToken)
      setUser(data.user)
      return data.user
    } catch (err) {
      if (err instanceof ApiError) throw err
      throw new ApiError(0, 'تعذر الاتصال بالخادم — تحقق من الاتصال بالإنترنت')
    }
  }

  async function requestOtp(email: string) {
    await api.post('/auth/otp/request', { email })
  }

  async function loginWithOtp(email: string, code: string) {
    const data = await api.post<LoginResponse>('/auth/otp/verify', { email, code })
    setTokens(data.accessToken, data.refreshToken)
    setUser(data.user)
    return data.user
  }

  function logout() {
    clearTokens()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, requestOtp, loginWithOtp, logout }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
