import { api } from './api'

export interface ApiNotification {
  id: string
  title: string
  subtitle: string
  read: boolean
  createdAt: string
}

export const notificationsApi = {
  list: () => api.get<ApiNotification[]>('/notifications'),
  markRead: (id: string) => api.patch<ApiNotification>(`/notifications/${id}/read`),
  markAllRead: () => api.post<{ updated: true }>('/notifications/read-all'),
}
