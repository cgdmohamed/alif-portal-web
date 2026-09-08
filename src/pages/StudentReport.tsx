import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import { reportsApi, type StudentDetail } from '../lib/reportsApi'
import { ApiError } from '../lib/api'

export default function StudentReport() {
  const { id } = useParams()
  const [detail, setDetail] = useState<StudentDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    reportsApi
      .studentDetail(id)
      .then(setDetail)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'تعذر تحميل تقرير الطالب'))
  }, [id])

  if (error) {
    return <div className="rounded-xl bg-danger-bg-soft px-4 py-6 text-center text-sm text-danger-light">{error}</div>
  }
  if (!detail) {
    return <div className="rounded-xl bg-surface-alt px-4 py-8 text-center text-sm text-ink-faint">جارٍ التحميل...</div>
  }

  const { student, submissions, attendance, summary } = detail

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar initials={student.name[0]} size={64} />
          <div>
            <div className="font-sans text-lg font-extrabold text-navy">{student.name}</div>
            <div className="text-xs text-ink-faint">{summary.className ?? 'بدون فصل'}</div>
          </div>
        </div>
        <Button size="sm" onClick={() => window.print()}>طباعة / حفظ PDF</Button>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          ['متوسط الدرجات', `${summary.average}%`],
          ['الحضور', `${summary.attendancePercent}%`],
          ['النقاط', summary.points],
        ].map(([label, value]) => (
          <Card key={label} className="text-center">
            <div className="font-sans text-xl font-black text-navy">{value}</div>
            <div className="mt-1 text-[11px] text-ink-faint">{label}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="flex flex-col gap-3">
          <span className="text-sm font-bold text-ink">الواجبات المسلمة والتقييمات</span>
          <div className="flex flex-col gap-2">
            {submissions.length === 0 ? (
              <div className="text-xs text-ink-faint">لا توجد تقديمات بعد</div>
            ) : (
              submissions.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg bg-surface-alt px-3.5 py-2.5">
                  <div>
                    <div className="text-xs font-semibold text-ink">{a.assignment.title}</div>
                    <div className="text-[10px] text-ink-faint">
                      {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString('ar-SA') : 'لم يُسلّم بعد'}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-indigo">{a.grade ?? '—'}</span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="flex flex-col gap-3">
          <span className="text-sm font-bold text-ink">الحضور والغياب</span>
          <div className="flex flex-col gap-2">
            {attendance.length === 0 ? (
              <div className="text-xs text-ink-faint">لا يوجد سجل حضور بعد</div>
            ) : (
              attendance.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg bg-surface-alt px-3.5 py-2.5">
                  <div>
                    {a.reason && <div className="text-[10px] text-ink-faint">{a.reason}</div>}
                  </div>
                  <Badge tone={a.status === 'present' ? 'success' : 'warning'}>
                    {a.status === 'present' ? 'حاضر' : 'غائب'}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

    </div>
  )
}
