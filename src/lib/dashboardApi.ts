import { api } from './api'

export interface ReportsOverview {
  studentsCount: number
  averagePerformance: number
  gradedAssignmentsCount: number
}

export interface DashboardMeeting {
  id: string
  title: string
  scheduledAt: string
  durationMinutes: number
  classEntity: {
    name: string
    studentsCount: number
    teacher: { name: string } | null
  }
}

export interface StudentSummary {
  id: string
  name: string
  className: string | null
  average: number
  attendancePercent: number
  points: number
}

export interface ActivityLogEntry {
  id: string
  actorName: string
  action: string
  target: string
  tone: 'success' | 'warning' | 'danger' | 'indigo'
  createdAt: string
}

export const dashboardApi = {
  overview: () => api.get<ReportsOverview>('/reports/overview'),
  schoolsCount: () => api.get<unknown[]>('/schools').then((rows) => rows.length),
  todayMeetings: () => api.get<DashboardMeeting[]>('/meetings?scope=today'),
  topStudents: (limit = 3) =>
    api
      .get<StudentSummary[]>('/reports/students')
      .then((rows) => [...rows].sort((a, b) => b.points - a.points).slice(0, limit)),
  activityLog: (limit = 5) => api.get<ActivityLogEntry[]>(`/activity-log?limit=${limit}`),
}
