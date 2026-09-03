import { api } from './api'

export interface PlatformSettings {
  id: string
  platformName: string
  officialEmail: string | null
  logoUrl: string | null
  security: { minPasswordLength: number; sessionMinutes: number; twoFactorEnabled: boolean }
  zoom: { accountId: string | null }
  smtp: { host: string | null; port: number | null; encryption: string | null }
  sms: { gateway: string | null; senderName: string | null }
  storageAutoCleanup: boolean
  updatedAt: string
}

export interface ApiPdfTemplate {
  id: string
  name: string
  storageUrl: string | null
  updatedAt: string
}

export const settingsApi = {
  get: () => api.get<PlatformSettings>('/settings'),
  update: (input: Partial<Omit<PlatformSettings, 'id' | 'updatedAt'>>) => api.patch<PlatformSettings>('/settings', input),
  testConnection: (target: 'zoom' | 'smtp' | 'sms') => api.post<{ target: string; success: boolean }>('/settings/test-connection', { target }),
  pdfTemplates: () => api.get<ApiPdfTemplate[]>('/pdf-templates'),
}
