import { api } from './api'

export interface ApiAutoMessageTemplate {
  id: string
  name: string
  channel: string
  enabled: boolean
  body: string
  updatedAt: string
}

export const autoMessagesApi = {
  list: () => api.get<ApiAutoMessageTemplate[]>('/auto-message-templates'),
  update: (id: string, input: { enabled?: boolean; body?: string }) =>
    api.patch<ApiAutoMessageTemplate>(`/auto-message-templates/${id}`, input),
}
