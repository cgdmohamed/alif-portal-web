import { api } from './api'

export type ActivityTone = 'success' | 'warning' | 'danger' | 'indigo'

export interface ApiActivityLogEntry {
  id: string
  actorName: string
  action: string
  target: string
  ip: string | null
  tone: ActivityTone
  createdAt: string
}

export const activityLogApi = {
  list: (limit = 100) => api.get<ApiActivityLogEntry[]>(`/activity-log?limit=${limit}`),
}
