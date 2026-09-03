import { api } from './api'

export type BackendRole =
  | 'platform_admin'
  | 'school_admin'
  | 'teacher'
  | 'student'
  | 'parent'
  | 'support_agent'

export type UserStatus = 'active' | 'disabled' | 'pending_consent'

export interface ApiUser {
  id: string
  name: string
  email: string | null
  phone: string | null
  role: BackendRole
  schoolId: string | null
  status: UserStatus
  lastLoginAt: string | null
  createdAt: string
}

export const roleLabel: Record<BackendRole, string> = {
  platform_admin: 'ألف المستقبل',
  school_admin: 'إدارة المدرسة',
  teacher: 'أخصائي موهبة',
  student: 'طالب',
  parent: 'ولي أمر',
  support_agent: 'فريق الدعم الفني',
}

export const roleColor: Record<BackendRole, string> = {
  platform_admin: '#4338F2',
  school_admin: '#3FA9F5',
  teacher: '#807FF9',
  student: '#3FA9F5',
  parent: '#FF6B6B',
  support_agent: '#22B07D',
}

export const statusLabel: Record<UserStatus, { label: string; tone: 'success' | 'warning' }> = {
  active: { label: 'نشط', tone: 'success' },
  disabled: { label: 'معطل', tone: 'warning' },
  pending_consent: { label: 'بانتظار موافقة ولي الأمر', tone: 'warning' },
}

export const usersApi = {
  list: (filters: { role?: BackendRole } = {}) => {
    const params = new URLSearchParams()
    if (filters.role) params.set('role', filters.role)
    const qs = params.toString()
    return api.get<ApiUser[]>(`/users${qs ? `?${qs}` : ''}`)
  },
  create: (input: { name: string; email?: string; phone?: string; password?: string; role: BackendRole; schoolId?: string }) =>
    api.post<ApiUser>('/users', input),
  update: (id: string, input: Partial<{ status: UserStatus; name: string; email: string; phone: string }>) =>
    api.patch<ApiUser>(`/users/${id}`, input),
  remove: (id: string) => api.delete<{ id: string }>(`/users/${id}`),
}
