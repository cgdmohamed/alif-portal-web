import { api } from './api'

export type AttendanceStatus = 'present' | 'absent'

export interface MeetingAttendanceRow {
  student: { id: string; name: string }
  record: { id: string; status: AttendanceStatus; reason: string | null } | null
}

export const attendanceApi = {
  list: (meetingId: string) => api.get<MeetingAttendanceRow[]>(`/meetings/${meetingId}/attendance`),
  save: (meetingId: string, entries: Array<{ studentId: string; status: AttendanceStatus; reason?: string }>) =>
    api.post(`/meetings/${meetingId}/attendance`, { entries }),
}
