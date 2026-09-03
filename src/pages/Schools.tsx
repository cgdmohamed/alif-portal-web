import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Tabs from '../components/ui/Tabs'
import Avatar from '../components/ui/Avatar'
import ProgressBar from '../components/ui/ProgressBar'
import AddSchoolModal from '../components/AddSchoolModal'
import {
  schoolsApi,
  statusLabel,
  type School,
  type SchoolApproval,
  type ClassSummary,
  type StudentRosterEntry,
} from '../lib/schoolsApi'
import { ApiError } from '../lib/api'

const detailTabs = ['معلومات عامة', 'جهات الاتصال', 'الطلاب', 'الفصول', 'موافقات أولياء الأمور']

const avatarGradients = ['from-indigo to-indigo-light', 'from-sky to-indigo-light', 'from-indigo-light to-indigo']

export default function Schools() {
  const navigate = useNavigate()
  const [tab, setTab] = useState(detailTabs[0])
  const [schools, setSchools] = useState<School[] | null>(null)
  const [selected, setSelected] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [approvals, setApprovals] = useState<SchoolApproval[] | null>(null)
  const [classes, setClasses] = useState<ClassSummary[] | null>(null)
  const [students, setStudents] = useState<StudentRosterEntry[] | null>(null)

  const school = schools?.[selected] ?? null

  function loadSchools() {
    setError(null)
    schoolsApi
      .list()
      .then(setSchools)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'تعذر تحميل المدارس'))
  }

  useEffect(loadSchools, [])

  useEffect(() => {
    if (!school) return
    setApprovals(null)
    setClasses(null)
    setStudents(null)
    if (tab === 'موافقات أولياء الأمور') schoolsApi.approvals(school.id).then(setApprovals)
    if (tab === 'الفصول') schoolsApi.classes(school.id).then(setClasses)
    if (tab === 'الطلاب') schoolsApi.students(school.id).then(setStudents)
  }, [tab, school?.id])

  function decide(approvalId: string) {
    // No approve/reject endpoint exists on the backend yet — this only
    // removes the item from the local list so the UI reflects the action.
    setApprovals((list) => list?.filter((a) => a.id !== approvalId) ?? null)
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="إدارة المدارس" />
        <Card className="text-center text-sm text-danger-light">{error}</Card>
      </div>
    )
  }

  if (!schools) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="إدارة المدارس" />
        <Card className="text-center text-sm text-ink-faint">جارٍ التحميل...</Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="إدارة المدارس"
        actions={
          <>
            <Button variant="secondary" size="sm">استيراد من Excel</Button>
            <Button size="sm" onClick={() => setModalOpen(true)}>+ إضافة مدرسة</Button>
          </>
        }
      />

      {schools.length === 0 ? (
        <Card className="text-center text-sm text-ink-faint">لا توجد مدارس مسجّلة بعد</Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {schools.map((s, i) => {
            const status = statusLabel[s.status]
            return (
              <Card
                key={s.id}
                onClick={() => { setSelected(i); setTab(detailTabs[0]) }}
                className={`flex cursor-pointer flex-col gap-3 transition-shadow ${
                  selected === i ? 'ring-2 ring-indigo' : ''
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br font-sans text-[15px] font-extrabold text-white ${avatarGradients[i % avatarGradients.length]}`}
                  >
                    {s.name[0]}
                  </span>
                  <div>
                    <div className="text-[13px] font-bold text-ink">{s.name}</div>
                    <div className="text-[11px] text-ink-faint">{s.city}</div>
                  </div>
                </div>
                <Badge tone={status.tone}>{status.label}</Badge>
              </Card>
            )
          })}
        </div>
      )}

      {school && (
        <Card className="flex flex-1 flex-col gap-3.5">
          <span className="text-[15px] font-extrabold text-ink">تفاصيل: {school.name}</span>
          <Tabs items={detailTabs} active={tab} onChange={setTab} />

          {tab === 'معلومات عامة' && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3.5 text-xs text-ink-soft sm:grid-cols-4">
                <div>
                  <div className="mb-1 text-ink-faint">نوع المدرسة</div>{school.type}
                </div>
                <div>
                  <div className="mb-1 text-ink-faint">تاريخ الانضمام</div>{school.joinedAt}
                </div>
                <div>
                  <div className="mb-1 text-ink-faint">مدير المدرسة</div>{school.principal}
                </div>
                <div>
                  <div className="mb-1 text-ink-faint">الباقة</div>
                  <button onClick={() => navigate('/packages')} className="font-bold text-indigo hover:underline">
                    {school.package?.name ?? '—'}
                  </button>
                </div>
              </div>
              {school.package && (
                <div className="rounded-xl bg-surface-alt p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-ink">حدود الباقة الحالية</span>
                    <Badge tone={statusLabel[school.status].tone}>{statusLabel[school.status].label}</Badge>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <div>
                      <div className="mb-1 flex justify-between text-[11px] text-ink-faint">
                        <span>الحد الأقصى للطلاب</span><span>{school.package.maxStudents}</span>
                      </div>
                      <ProgressBar value={0} color={school.package.color} />
                    </div>
                    <div>
                      <div className="mb-1 flex justify-between text-[11px] text-ink-faint">
                        <span>الحد الأقصى للفصول</span><span>{school.package.maxClasses}</span>
                      </div>
                      <ProgressBar value={0} color={school.package.color} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'جهات الاتصال' && (
            <div className="flex flex-col gap-2">
              {school.contacts.length === 0 && (
                <div className="text-xs text-ink-faint">لا توجد جهات اتصال مسجّلة</div>
              )}
              {school.contacts.map((c) => (
                <div key={c.id} className="flex items-center gap-3 rounded-lg bg-surface-alt px-3.5 py-2.5">
                  <Avatar initials={c.name[0]} size={32} />
                  <div className="flex-1">
                    <div className="text-xs font-bold text-ink">{c.name}</div>
                    <div className="text-[10px] text-ink-faint">{c.role}</div>
                  </div>
                  <div className="text-left text-[11px] text-ink-faint">
                    <div>{c.phone}</div>
                    <div>{c.email}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'الطلاب' && (
            <div className="flex flex-col gap-2">
              {students === null && <div className="text-xs text-ink-faint">جارٍ التحميل...</div>}
              {students?.length === 0 && <div className="text-xs text-ink-faint">لا يوجد طلاب مسجّلون بعد</div>}
              {students?.map((s) => (
                <div key={s.id} className="flex items-center gap-3 rounded-lg bg-surface-alt px-3.5 py-2.5">
                  <Avatar initials={s.name[0]} size={28} />
                  <span className="flex-1 text-xs font-semibold text-ink">{s.name}</span>
                  <span className="text-[11px] text-ink-faint">{s.stage}</span>
                </div>
              ))}
            </div>
          )}

          {tab === 'الفصول' && (
            <div className="flex flex-col gap-2">
              {classes === null && <div className="text-xs text-ink-faint">جارٍ التحميل...</div>}
              {classes?.length === 0 && <div className="text-xs text-ink-faint">لا توجد فصول بعد</div>}
              {classes?.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg bg-surface-alt px-3.5 py-2.5 text-xs font-semibold text-ink">
                  <span>{c.name}</span>
                  <span className="text-[11px] text-ink-faint">{c.studentsCount} طالب</span>
                </div>
              ))}
            </div>
          )}

          {tab === 'موافقات أولياء الأمور' && (
            <div className="flex flex-col gap-2">
              {approvals === null && <div className="text-xs text-ink-faint">جارٍ التحميل...</div>}
              {approvals?.length === 0 && (
                <div className="text-xs text-ink-soft">لا توجد طلبات موافقة معلّقة حاليًا</div>
              )}
              {approvals?.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3 rounded-lg bg-surface-alt px-3.5 py-2.5">
                  <div>
                    <div className="text-xs font-bold text-ink">{a.parentName} — ولي أمر {a.studentName}</div>
                    <div className="text-[10px] text-ink-faint">{a.note}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="danger" size="sm" onClick={() => decide(a.id)}>رفض</Button>
                    <Button size="sm" onClick={() => decide(a.id)}>موافقة</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      <AddSchoolModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => { setModalOpen(false); loadSchools() }}
      />
    </div>
  )
}
