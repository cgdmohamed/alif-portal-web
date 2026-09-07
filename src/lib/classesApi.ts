import { api } from './api'

export type ClassStatus = 'preparing' | 'active' | 'completed' | 'cancelled'

export interface ClassMeeting {
  id: string
  title: string
  date: string
  time: string
  // The real, joinable meeting (Agora channel etc.) this schedule row is
  // linked to — pass this, not `id`, to anything that joins live video
  // (e.g. meetingsApi.join). Null only for rows that predate the link.
  meetingId: string | null
}

export interface ApiClass {
  id: string
  schoolId: string
  school?: { id: string; name: string }
  resourceId: string | null
  resourceVersionAtGeneration: number | null
  resource: { id: string; name: string; program: string } | null
  teacherId: string | null
  teacher: { id: string; name: string } | null
  name: string
  studentsCount: number
  color: string
  performance: number
  status: ClassStatus
  autoAgora: boolean
  meetings: ClassMeeting[]
}

export const statusLabel: Record<ClassStatus, { label: string; tone: 'success' | 'warning' | 'neutral' | 'danger' }> = {
  preparing: { label: 'قيد الإعداد', tone: 'neutral' },
  active: { label: 'نشط', tone: 'success' },
  completed: { label: 'مكتمل', tone: 'neutral' },
  cancelled: { label: 'ملغى', tone: 'danger' },
}

export const classesApi = {
  listAll: () => api.get<ApiClass[]>('/classes'),
  listForSchool: (schoolId: string) => api.get<ApiClass[]>(`/schools/${schoolId}/classes`),
  get: (id: string) => api.get<ApiClass>(`/classes/${id}`),
  create: (
    schoolId: string,
    input: { name: string; resourceId?: string; teacherId?: string; color: string; autoAgora: boolean },
  ) => api.post<ApiClass>(`/schools/${schoolId}/classes`, input),
  addMeeting: (classId: string, meeting: { title: string; date: string; time: string }) =>
    api.post<ClassMeeting>(`/classes/${classId}/meetings`, meeting),
}
