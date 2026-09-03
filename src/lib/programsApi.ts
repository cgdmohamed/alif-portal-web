import { api } from './api'

export interface ApiProgramDay {
  id: string
  resourceId: string
  dayNumber: number
  title: string
}

export interface ApiUnit {
  id: string
  dayId: string
  unitNumber: number
  title: string
}

export interface ApiSessionNode {
  id: string
  unitId: string
  sessionNumber: number
  title: string
  durationMinutes: number
}

export type ExecutionMode = 'فردي' | 'جماعي' | 'ثنائي'
export type DeliveryChannel =
  | 'trainer_guide_only'
  | 'shared_live_screen'
  | 'student_synchronous'
  | 'student_async_homework'

export interface ApiContentBlock {
  id: string
  sessionId: string
  type: 'lecture' | 'activity'
  title: string
  durationMinutes: number
  executionMode: ExecutionMode | null
  deliveryChannel: DeliveryChannel | null
  activityType: string | null
  instructionsText: string | null
  materialsNeeded: string | null
  trainerNotes: string | null
  position: number
}

export interface ProgramTree {
  days: ApiProgramDay[]
  units: ApiUnit[]
  sessions: ApiSessionNode[]
  blocks: ApiContentBlock[]
}

export interface CreateBlockInput {
  type: 'lecture' | 'activity'
  title: string
  durationMinutes: number
  executionMode?: ExecutionMode
  deliveryChannel?: DeliveryChannel
  activityType?: string
  instructionsText?: string
  materialsNeeded?: string
  trainerNotes?: string
}

export const programsApi = {
  getTree: (resourceId: string) => api.get<ProgramTree>(`/resources/${resourceId}/program`),
  addDay: (resourceId: string, title: string) => api.post<ApiProgramDay>(`/programs/${resourceId}/days`, { title }),
  updateDay: (id: string, title: string) => api.patch<ApiProgramDay>(`/days/${id}`, { title }),
  addUnit: (dayId: string, title: string) => api.post<ApiUnit>(`/days/${dayId}/units`, { title }),
  updateUnit: (id: string, title: string) => api.patch<ApiUnit>(`/units/${id}`, { title }),
  addSession: (unitId: string, title: string, durationMinutes: number) =>
    api.post<ApiSessionNode>(`/units/${unitId}/sessions`, { title, durationMinutes }),
  updateSession: (id: string, title: string, durationMinutes: number) =>
    api.patch<ApiSessionNode>(`/sessions/${id}`, { title, durationMinutes }),
  addBlock: (sessionId: string, input: CreateBlockInput) =>
    api.post<ApiContentBlock>(`/sessions/${sessionId}/blocks`, input),
  updateBlock: (id: string, input: Partial<CreateBlockInput>) => api.patch<ApiContentBlock>(`/blocks/${id}`, input),
  removeBlock: (id: string) => api.delete<{ id: string }>(`/blocks/${id}`),
}
