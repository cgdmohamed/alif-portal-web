import { api } from './api'

export type AssignmentKind = 'quiz' | 'essay' | 'puzzle'
export type SubmissionStatus = 'in_progress' | 'submitted' | 'late' | 'graded'

export interface ApiAssignment {
  id: string
  classId: string
  classEntity: { id: string; name: string }
  title: string
  kind: AssignmentKind
  dueAt: string
  submitted: number
  graded: number
}

export interface ApiSubmission {
  id: string
  assignmentId: string
  assignment: { title: string; dueAt: string; classId: string }
  studentId: string
  student: { id: string; name: string }
  status: SubmissionStatus
  answerPayload: Record<string, unknown> | null
  submittedAt: string | null
  grade: number | null
  gradedAt: string | null
  teacherNote: string | null
}

export const assignmentsApi = {
  listAll: () => api.get<ApiAssignment[]>('/assignments'),
  create: (classId: string, input: { title: string; kind: AssignmentKind; dueAt: string }) =>
    api.post<ApiAssignment>(`/classes/${classId}/assignments`, input),
  submissions: (assignmentId: string) => api.get<ApiSubmission[]>(`/assignments/${assignmentId}/submissions`),
  gradingQueue: () => api.get<ApiSubmission[]>('/grading-queue'),
  grade: (submissionId: string, input: { grade: number; teacherNote?: string }) =>
    api.post<ApiSubmission>(`/submissions/${submissionId}/grade`, input),
}
