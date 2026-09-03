import { api } from './api'

export interface ApiRecording {
  id: string
  meetingId: string
  meeting: {
    title: string
    scheduledAt: string
    classEntity: { name: string; teacher: { name: string } | null }
  }
  title: string
  playbackUrl: string
  durationSeconds: number
  views: number
  sizeBytes: number
  isPublic: boolean
  createdAt: string
}

export interface StorageUsage {
  usedBytes: number
  totalBytes: number
  usedPercent: number
}

export function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function formatBytes(bytes: number) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  return `${Math.round(bytes / 1024)} KB`
}

export const recordingsApi = {
  list: (search?: string) => api.get<ApiRecording[]>(`/recordings${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  update: (id: string, input: { title?: string; isPublic?: boolean }) =>
    api.patch<ApiRecording>(`/recordings/${id}`, input),
  remove: (id: string) => api.delete<{ id: string }>(`/recordings/${id}`),
  storageUsage: () => api.get<StorageUsage>('/storage/usage'),
}
