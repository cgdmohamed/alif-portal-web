import { api } from './api'

export type MeetingStatus = 'scheduled' | 'live' | 'ended'

export interface ApiMeeting {
  id: string
  classId: string
  classEntity: { id: string; name: string; studentsCount: number; teacher: { name: string } | null }
  title: string
  scheduledAt: string
  durationMinutes: number
  status: MeetingStatus
  agoraChannelName: string | null
}

export interface AgoraJoinCredentials {
  channelName: string
  token: string
  appId: string
  uid: number
}

export interface MeetingSessionBlock {
  id: string
  type: 'lecture' | 'activity'
  title: string
  durationMinutes: number
  executionMode: string | null
  deliveryChannel: string | null
  activityType: string | null
  instructionsText: string | null
  materialsNeeded: string | null
  trainerNotes: string | null
}

export const meetingsApi = {
  list: (scope?: 'today' | 'week' | 'month') => api.get<ApiMeeting[]>(`/meetings${scope ? `?scope=${scope}` : ''}`),
  create: (input: { classId: string; title: string; scheduledAt: string; durationMinutes: number }) =>
    api.post<ApiMeeting>('/meetings', input),
  get: (id: string) => api.get<ApiMeeting>(`/meetings/${id}`),
  sessionPlan: (id: string) => api.get<MeetingSessionBlock[]>(`/meetings/${id}/session-plan`),
  pushActivity: (id: string, blockId: string) => api.post<ApiMeeting>(`/meetings/${id}/push-activity`, { blockId }),
  complete: (id: string, input: { checklist: Record<string, boolean>; rating: number; note?: string }) =>
    api.post<ApiMeeting>(`/meetings/${id}/complete`, input),
  join: (id: string) => api.post<AgoraJoinCredentials>(`/meetings/${id}/join`),
}
