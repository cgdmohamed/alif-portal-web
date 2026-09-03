import { api } from './api'

export type ResourceStatus = 'draft' | 'published' | 'archived'
export type ResourceStage = 'ابتدائي' | 'متوسط' | 'ثانوي'

export interface ApiResource {
  id: string
  name: string
  subject: string
  stage: ResourceStage
  program: string
  description: string
  sessionsCount: number
  questionsIncluded: number
  contentItemsIncluded: number
  requiredFeature: string
  color: string
  status: ResourceStatus
  versionNumber: number
  schoolsUsingCount: number
  totalStudentsCount: number
}

export interface CreateResourceInput {
  name: string
  subject: string
  stage: ResourceStage
  program: string
  description: string
  requiredFeature: string
  color: string
  sessionsCount?: number
  questionsIncluded?: number
  contentItemsIncluded?: number
}

export const resourcesApi = {
  list: (status?: ResourceStatus) => api.get<ApiResource[]>(`/resources${status ? `?status=${status}` : ''}`),
  get: (id: string) => api.get<ApiResource>(`/resources/${id}`),
  create: (input: CreateResourceInput) => api.post<ApiResource>('/resources', input),
  update: (id: string, input: Partial<CreateResourceInput & { status: ResourceStatus; versionNumber: number }>) =>
    api.patch<ApiResource>(`/resources/${id}`, input),
}
