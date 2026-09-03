import { api, apiUpload } from './api'

export type ContentItemType = 'video' | 'pdf' | 'image' | 'activity'

export interface ApiContentItem {
  id: string
  title: string
  type: ContentItemType
  sizeBytes: number
  storageUrl: string
  color: string
  folder: string
  tags: string[]
  createdAt: string
}

export const typeLabel: Record<ContentItemType, string> = {
  video: 'فيديو',
  pdf: 'PDF',
  image: 'صورة',
  activity: 'نشاط',
}

export function formatBytes(bytes: number) {
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  return `${Math.round(bytes / 1024)} KB`
}

export const contentLibraryApi = {
  list: (filters: { folder?: string; type?: ContentItemType } = {}) => {
    const params = new URLSearchParams()
    if (filters.folder) params.set('folder', filters.folder)
    if (filters.type) params.set('type', filters.type)
    const qs = params.toString()
    return api.get<ApiContentItem[]>(`/content-items${qs ? `?${qs}` : ''}`)
  },
  upload: (
    file: File,
    meta: { title: string; type: ContentItemType; color: string; folder: string; tags: string[] },
  ) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', meta.title)
    formData.append('type', meta.type)
    formData.append('color', meta.color)
    formData.append('folder', meta.folder)
    meta.tags.forEach((t) => formData.append('tags', t))
    return apiUpload<ApiContentItem>('/content-items', formData)
  },
  remove: (id: string) => api.delete<{ id: string }>(`/content-items/${id}`),
}
