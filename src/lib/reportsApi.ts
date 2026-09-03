import { api } from './api'

export interface ReportsOverview {
  studentsCount: number
  averagePerformance: number
  averageAttendance: number
  gradedAssignmentsCount: number
}

export interface StudentSummary {
  id: string
  name: string
  className: string | null
  average: number
  attendancePercent: number
  points: number
}

export interface AttendanceRecord {
  id: string
  status: 'present' | 'absent'
  reason: string | null
}

export interface StudentSubmission {
  id: string
  assignment: { title: string; dueAt: string }
  status: string
  grade: number | null
  submittedAt: string | null
}

export interface StudentDetail {
  student: { id: string; name: string }
  submissions: StudentSubmission[]
  attendance: AttendanceRecord[]
  summary: StudentSummary
}

export const reportsApi = {
  overview: (schoolId?: string) => api.get<ReportsOverview>(`/reports/overview${schoolId ? `?schoolId=${schoolId}` : ''}`),
  studentsTable: (schoolId?: string) => api.get<StudentSummary[]>(`/reports/students${schoolId ? `?schoolId=${schoolId}` : ''}`),
  studentDetail: (id: string) => api.get<StudentDetail>(`/reports/students/${id}`),
}
