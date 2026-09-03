import { api } from './api'

export interface Package {
  id: string
  name: string
  price: number
  cycle: 'monthly' | 'quarterly' | 'annual'
  maxStudents: number
  maxClasses: number
  storageGB: number
  color: string
  features: string[]
}

export interface SchoolContact {
  id: string
  name: string
  role: string
  phone: string
  email: string
}

export type SchoolStatus = 'active' | 'renewal_due' | 'suspended'

export interface SchoolApproval {
  id: string
  parentName: string
  studentName: string
  note: string
  createdAt: string
}

export interface School {
  id: string
  name: string
  city: string
  type: string
  principal: string
  status: SchoolStatus
  package: Package | null
  packageId: string | null
  joinedAt: string
  contacts: SchoolContact[]
  approvals: SchoolApproval[]
}

export interface SchoolInvoice {
  id: string
  issuedAt: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
}

export interface ClassSummary {
  id: string
  name: string
  studentsCount: number
  status: string
}

export interface StudentRosterEntry {
  id: string
  name: string
  stage: string
  classId: string | null
}

export const statusLabel: Record<SchoolStatus, { label: string; tone: 'success' | 'warning' | 'danger' }> = {
  active: { label: 'اشتراك فعّال', tone: 'success' },
  renewal_due: { label: 'التجديد قريبًا', tone: 'warning' },
  suspended: { label: 'موقوفة', tone: 'danger' },
}

export const schoolsApi = {
  list: () => api.get<School[]>('/schools'),
  get: (id: string) => api.get<School>(`/schools/${id}`),
  create: (input: {
    name: string
    city: string
    type: string
    principal: string
    packageId?: string
    contacts?: Omit<SchoolContact, 'id'>[]
  }) => api.post<School>('/schools', input),
  update: (id: string, input: Partial<{ name: string; city: string; type: string; principal: string }>) =>
    api.patch<School>(`/schools/${id}`, input),
  approvals: (id: string) => api.get<SchoolApproval[]>(`/schools/${id}/approvals`),
  classes: (id: string) => api.get<ClassSummary[]>(`/schools/${id}/classes`),
  students: (id: string) => api.get<StudentRosterEntry[]>(`/schools/${id}/students`),
  invoices: (id: string) => api.get<SchoolInvoice[]>(`/schools/${id}/invoices`),
  subscribe: (id: string, packageId: string) => api.post<School>(`/schools/${id}/subscription`, { packageId }),
}

export interface PackageWithSubscribers extends Package {
  subscribedSchools: number
}

export const packagesApi = {
  list: () => api.get<PackageWithSubscribers[]>('/packages'),
  create: (input: Omit<Package, 'id'>) => api.post<Package>('/packages', input),
  update: (id: string, input: Partial<Omit<Package, 'id'>>) => api.patch<Package>(`/packages/${id}`, input),
  remove: (id: string) => api.delete<{ id: string }>(`/packages/${id}`),
}
