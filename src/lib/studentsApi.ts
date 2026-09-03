import { api } from './api'

export interface ApiStudentWithClass {
  id: string
  schoolId: string
  classId: string | null
  className: string | null
  name: string
  stage: string
  parentName: string
  parentEmail: string
  studentEmail: string
  source: 'manual' | 'csv'
  points: number
}

export interface CreateStudentInput {
  name: string
  stage?: string
  className: string
  parentName: string
  parentEmail: string
  studentEmail: string
}

export const studentsApi = {
  listForSchool: (schoolId: string) => api.get<ApiStudentWithClass[]>(`/schools/${schoolId}/students`),
  create: (schoolId: string, input: CreateStudentInput) =>
    api.post<ApiStudentWithClass>(`/schools/${schoolId}/students`, input),
  createBulk: (schoolId: string, inputs: CreateStudentInput[]) =>
    api.post<ApiStudentWithClass[]>(`/schools/${schoolId}/students/bulk`, { students: inputs }),
  remove: (id: string) => api.delete<{ id: string }>(`/students/${id}`),
}
