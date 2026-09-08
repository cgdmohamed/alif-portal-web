import { useEffect, useState } from 'react'
import { attendanceApi, type AttendanceStatus, type MeetingAttendanceRow } from '../lib/attendanceApi'
import { ApiError } from '../lib/api'
import Button from './ui/Button'
import Modal from './ui/Modal'

export default function AttendanceModal({ meetingId, open, onClose }: { meetingId?: string; open: boolean; onClose: () => void }) {
  const [rows, setRows] = useState<MeetingAttendanceRow[] | null>(null)
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({})
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open || !meetingId) return
    setRows(null)
    setError(null)
    attendanceApi.list(meetingId)
      .then((data) => {
        setRows(data)
        setStatuses(Object.fromEntries(data.map((row) => [row.student.id, row.record?.status ?? 'present'])))
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'تعذر تحميل قائمة الطلاب'))
  }, [meetingId, open])

  async function save() {
    if (!meetingId || !rows) return
    setSaving(true)
    setError(null)
    try {
      await attendanceApi.save(meetingId, rows.map((row) => ({ studentId: row.student.id, status: statuses[row.student.id] })))
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'تعذر حفظ الحضور')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} width={520}>
      <div className="flex flex-col gap-4">
        <span className="font-sans text-lg font-extrabold text-navy">تسجيل الحضور</span>
        {error && <div className="rounded-lg bg-danger-bg-soft p-3 text-xs text-danger-light">{error}</div>}
        {rows === null ? <div className="text-xs text-ink-faint">جارٍ التحميل...</div> : (
          <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
            {rows.length === 0 && <div className="text-xs text-ink-faint">لا يوجد طلاب في هذا الفصل</div>}
            {rows.map((row) => (
              <div key={row.student.id} className="flex items-center justify-between rounded-lg bg-surface-alt px-3 py-2">
                <span className="text-xs font-semibold text-ink">{row.student.name}</span>
                <div className="flex gap-1">
                  {(['present', 'absent'] as const).map((status) => (
                    <button key={status} onClick={() => setStatuses((value) => ({ ...value, [row.student.id]: status }))}
                      className={`rounded-lg px-3 py-1.5 text-[11px] font-bold ${statuses[row.student.id] === status ? (status === 'present' ? 'bg-success text-white' : 'bg-warning text-white') : 'border border-line bg-white text-ink-faint'}`}>
                      {status === 'present' ? 'حاضر' : 'غائب'}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>إلغاء</Button>
          <Button size="sm" disabled={!rows || saving} onClick={save}>{saving ? 'جارٍ الحفظ...' : 'حفظ الحضور'}</Button>
        </div>
      </div>
    </Modal>
  )
}
