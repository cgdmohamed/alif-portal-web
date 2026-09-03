import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import ProgressBar from '../../components/ui/ProgressBar'
import { Field } from '../../components/ui/Input'
import { useSchoolClasses, type GeneratedClass, type ClassStatus } from '../../context/SchoolClassesContext'
import { resourcesApi, type ApiResource } from '../../lib/resourcesApi'

const statusTones: Record<ClassStatus, 'neutral' | 'success' | 'indigo' | 'danger'> = {
  'قيد الإعداد': 'neutral',
  'نشط': 'success',
  'مكتمل': 'indigo',
  'ملغى': 'danger',
}

export default function SchoolClasses() {
  const navigate = useNavigate()
  const { classes, addMeeting } = useSchoolClasses()
  const [resources, setResources] = useState<ApiResource[]>([])

  useEffect(() => {
    resourcesApi.list().then(setResources).catch(() => setResources([]))
  }, [])

  function newerVersionAvailable(c: GeneratedClass) {
    if (!c.resourceId || c.resourceVersionAtGeneration === null) return false
    const resource = resources.find((r) => r.id === c.resourceId)
    return Boolean(resource && resource.versionNumber > c.resourceVersionAtGeneration)
  }
  const [scheduling, setScheduling] = useState<GeneratedClass | null>(null)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('16:00')
  const [confirmed, setConfirmed] = useState(false)

  function closeScheduling() {
    setScheduling(null)
    setDate('')
  }

  function submitMeeting() {
    if (!scheduling || !date) return
    addMeeting(scheduling.id, {
      title: `لقاء ${scheduling.meetings.length + 1} — ${scheduling.resourceName ?? scheduling.name}`,
      date,
      time,
    })
    closeScheduling()
    setConfirmed(true)
    setTimeout(() => setConfirmed(false), 2500)
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="فصول المدرسة"
        subtitle={`${classes.length} فصل — بعضها مولّد من مكتبة موارد ألف`}
        actions={<Button size="sm" onClick={() => navigate('/school/resources')}>+ توليد فصل من موارد ألف</Button>}
      />

      {confirmed && (
        <div className="rounded-xl bg-success-bg px-4 py-3 text-xs font-semibold text-success">
          تم جدولة اللقاء بنجاح ✓
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((c) => (
          <Card key={c.id} className="flex flex-col gap-2.5">
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-bold text-ink">{c.name}</span>
              <span className="h-3 w-3 flex-none rounded-full" style={{ background: c.color }} />
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge tone={statusTones[c.status]}>{c.status}</Badge>
              {c.resourceName ? (
                <Badge tone="indigo">مولّد من: {c.resourceName}</Badge>
              ) : (
                <Badge tone="neutral">فصل محلي — غير مرتبط بمكتبة ألف</Badge>
              )}
              {newerVersionAvailable(c) && (
                <span
                  title="صدر إصدار أحدث من هذا البرنامج في مكتبة موارد ألف"
                  className="rounded-md bg-warning-bg px-2 py-1 text-[10px] font-bold text-warning"
                >
                  🔔 نسخة أحدث متاحة
                </span>
              )}
            </div>
            <div className="flex justify-between text-[11px] text-ink-muted">
              <span>{c.trainer}</span>
              <span>{c.studentsCount} طالب</span>
            </div>
            {c.performance > 0 ? (
              <>
                <ProgressBar value={c.performance} color={c.color} />
                <div className="text-[10px] text-ink-faint">أداء عام الفصل: {c.performance}%</div>
              </>
            ) : (
              <div className="text-[10px] text-ink-faint">لا توجد بيانات أداء بعد — فصل جديد</div>
            )}
            <div className="text-[11px] text-ink-faint">
              {c.meetings.length === 0 ? 'لا توجد لقاءات مجدولة' : `${c.meetings.length} لقاء مجدول`}
            </div>
            {c.meetings.length > 0 && (
              <div className="flex flex-col gap-1">
                {c.meetings.map((m) => (
                  <div key={m.id} className="rounded-lg bg-surface-alt px-3 py-2 text-[11px] text-ink-soft">
                    {m.title} — {m.date} {m.time}
                  </div>
                ))}
              </div>
            )}
            <Button variant="secondary" size="sm" onClick={() => setScheduling(c)}>+ جدولة لقاء</Button>
          </Card>
        ))}
      </div>

      <Modal open={scheduling !== null} onClose={closeScheduling} width={480}>
        {scheduling && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-sans text-lg font-extrabold text-navy">جدولة لقاء — {scheduling.name}</span>
              <button onClick={closeScheduling} className="text-xl text-ink-faint">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="التاريخ">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="rounded-xl border border-line bg-surface px-3 py-3 text-sm focus:outline-none"
                />
              </Field>
              <Field label="الوقت">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="rounded-xl border border-line bg-surface px-3 py-3 text-sm focus:outline-none"
                />
              </Field>
            </div>
            <Button size="sm" onClick={submitMeeting}>جدولة اللقاء</Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
