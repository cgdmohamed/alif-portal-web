import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import { SearchIcon } from '../components/ui/icons'
import AssignmentWizardModal from '../components/AssignmentWizardModal'
import { assignmentsApi, type ApiAssignment, type ApiSubmission } from '../lib/assignmentsApi'
import { ApiError } from '../lib/api'

const kindLabel: Record<string, string> = { quiz: 'اختبار', essay: 'مقالي', puzzle: 'لغز' }
const statusLabel: Record<string, { label: string; tone: 'success' | 'warning' | 'danger' }> = {
  in_progress: { label: 'قيد الحل', tone: 'warning' },
  submitted: { label: 'مسلّم', tone: 'success' },
  late: { label: 'متأخر', tone: 'danger' },
  graded: { label: 'مصحح', tone: 'success' },
}

export default function Assignments() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [assignments, setAssignments] = useState<ApiAssignment[] | null>(null)
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [detail, setDetail] = useState<ApiAssignment | null>(null)
  const [submissions, setSubmissions] = useState<ApiSubmission[] | null>(null)

  function load() {
    assignmentsApi
      .listAll()
      .then(setAssignments)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'تعذر تحميل الواجبات'))
  }

  useEffect(load, [])

  useEffect(() => {
    if (!detail) return
    setSubmissions(null)
    assignmentsApi.submissions(detail.id).then(setSubmissions).catch(() => setSubmissions([]))
  }, [detail])

  const filtered = (assignments ?? []).filter((a) =>
    search.trim() ? a.title.toLowerCase().includes(search.trim().toLowerCase()) : true,
  )

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="إدارة الواجبات والاختبارات" />
        <div className="rounded-xl bg-danger-bg-soft px-4 py-6 text-center text-sm text-danger-light">{error}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="إدارة الواجبات والاختبارات" actions={<Button size="sm" onClick={() => setOpen(true)}>+ واجب جديد</Button>} />

      <div className="flex items-center gap-2.5 rounded-lg border border-line bg-white px-3.5 py-2.5">
        <SearchIcon />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث في الواجبات..."
          className="w-full bg-transparent text-xs focus:outline-none"
        />
      </div>

      {assignments === null ? (
        <div className="rounded-xl bg-surface-alt px-4 py-8 text-center text-sm text-ink-faint">جارٍ التحميل...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl bg-surface-alt px-4 py-8 text-center text-sm text-ink-faint">لا توجد واجبات مطابقة</div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((a) => (
            <Card
              key={a.id}
              onClick={() => setDetail(a)}
              className="flex cursor-pointer flex-wrap items-center justify-between gap-3 transition-shadow hover:shadow-panel"
            >
              <div>
                <div className="text-sm font-bold text-ink">{a.title}</div>
                <div className="text-[11px] text-ink-faint">{a.classEntity.name} · {kindLabel[a.kind]}</div>
              </div>
              <div className="flex items-center gap-6 text-xs text-ink-soft">
                <span>{a.submitted} مسلّم</span>
                <span>{a.graded} مصحح</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AssignmentWizardModal open={open} onClose={() => setOpen(false)} onCreated={() => { setOpen(false); load() }} />

      <Modal open={detail !== null} onClose={() => setDetail(null)} width={720}>
        {detail && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-sans text-xl font-extrabold text-navy">{detail.title}</span>
                <div className="mt-1 text-xs text-ink-faint">{detail.classEntity.name}</div>
              </div>
              <button onClick={() => setDetail(null)} className="text-xl text-ink-faint">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-surface-alt p-3">
                <div className="font-sans text-lg font-black text-navy">{detail.submitted}</div>
                <div className="text-[10px] text-ink-faint">مسلّم</div>
              </div>
              <div className="rounded-xl bg-surface-alt p-3">
                <div className="font-sans text-lg font-black text-navy">{detail.graded}</div>
                <div className="text-[10px] text-ink-faint">مصحح</div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-ink-soft">التقديمات</span>
              {submissions === null && <div className="text-xs text-ink-faint">جارٍ التحميل...</div>}
              {submissions?.length === 0 && <div className="text-xs text-ink-faint">لا توجد تقديمات بعد</div>}
              {submissions?.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-lg bg-surface-alt px-3.5 py-2.5">
                  <div>
                    <div className="text-xs font-semibold text-ink">{s.student.name}</div>
                    <div className="text-[10px] text-ink-faint">
                      {s.submittedAt ? new Date(s.submittedAt).toLocaleDateString('ar-SA') : '—'}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={statusLabel[s.status].tone}>{statusLabel[s.status].label}</Badge>
                    <span className="w-10 text-right text-xs font-bold text-indigo">{s.grade ?? '—'}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2.5">
              <Button variant="secondary" size="sm" onClick={() => setDetail(null)}>إغلاق</Button>
              <Button size="sm" onClick={() => navigate('/grading')}>فتح التصحيح اليدوي</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
