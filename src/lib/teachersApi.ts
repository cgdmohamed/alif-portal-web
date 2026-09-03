import { api } from './api'
import type { ApiClass } from './classesApi'

export interface ApiTeacher {
  id: string
  schoolId: string
  name: string
  specialty: string
  email: string
  phone: string
  status: 'active' | 'disabled'
  source: 'manual' | 'csv'
}

export const teachersApi = {
  me: () => api.get<ApiTeacher | null>('/teachers/me'),
  myClasses: () => api.get<ApiClass[]>('/teachers/me/classes'),
  listForSchool: (schoolId: string) => api.get<ApiTeacher[]>(`/schools/${schoolId}/teachers`),
  create: (schoolId: string, input: { name: string; specialty: string; email: string; phone: string }) =>
    api.post<ApiTeacher>(`/schools/${schoolId}/teachers`, input),
  createBulk: (schoolId: string, inputs: { name: string; specialty: string; email: string; phone: string }[]) =>
    api.post<ApiTeacher[]>(`/schools/${schoolId}/teachers/bulk`, { teachers: inputs }),
  toggleStatus: (id: string) => api.patch<ApiTeacher>(`/teachers/${id}/status`),
  remove: (id: string) => api.delete<{ id: string }>(`/teachers/${id}`),
}
