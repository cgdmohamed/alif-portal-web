import { api } from './api'

export type EnrollmentCodeType = 'single' | 'multi' | 'batch'
export type EnrollmentCodeStatus = 'active' | 'expired' | 'disabled'

export interface ApiEnrollmentCode {
  id: string
  code: string
  classId: string
  codeType: EnrollmentCodeType
  maxUses: number
  currentUses: number
  expiresAt: string
  status: EnrollmentCodeStatus
  createdAt: string
}

export const enrollmentCodesApi = {
  listForSchool: (schoolId: string) => api.get<ApiEnrollmentCode[]>(`/schools/${schoolId}/enrollment-codes`),
  create: (schoolId: string, input: { classId: string; codeType: EnrollmentCodeType; maxUses: number; expiresAt: string }) =>
    api.post<ApiEnrollmentCode>(`/schools/${schoolId}/enrollment-codes`, input),
  disable: (id: string) => api.patch<ApiEnrollmentCode>(`/enrollment-codes/${id}/disable`),
}
