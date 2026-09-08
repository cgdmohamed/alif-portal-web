import { api } from './api'
import type { ApiUser } from './usersApi'

export type ConversationStatus = 'open' | 'closed'

export interface ApiConversation {
  id: string
  participant: { id: string; name: string }
  agent: { id: string; name: string } | null
  status: ConversationStatus
  createdAt: string
}

export interface ApiSupportMessage {
  id: string
  conversationId: string
  sender: { id: string; name: string }
  text: string
  createdAt: string
}

export const supportApi = {
  conversations: () => api.get<ApiConversation[]>('/support/conversations'),
  agents: () => api.get<ApiUser[]>('/support/agents'),
  messages: (conversationId: string) => api.get<ApiSupportMessage[]>(`/support/conversations/${conversationId}/messages`),
  sendMessage: (conversationId: string, text: string) =>
    api.post<ApiSupportMessage>(`/support/conversations/${conversationId}/messages`, { text }),
  transfer: (conversationId: string, agentId: string) =>
    api.post<ApiConversation>(`/support/conversations/${conversationId}/transfer`, { agentId }),
  close: (conversationId: string) => api.post<ApiConversation>(`/support/conversations/${conversationId}/close`),
}
