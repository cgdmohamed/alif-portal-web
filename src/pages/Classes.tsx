import { useEffect, useState } from 'react'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Tabs from '../components/ui/Tabs'
import AddClassModal from '../components/AddClassModal'
import { classesApi, statusLabel, type ApiClass } from '../lib/classesApi'
import { schoolsApi, type School } from '../lib/schoolsApi'
import { ApiError } from '../lib/api'

const detailTabs = ['معلومات', 'اللقاءات']

export default function Classes() {
  const [classes, setClasses] = useState<ApiClass[] | null>(null)
  const [schools, setSchools] = useState<School[]>([])
  const [error, setError] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [tab, setTab] = useState(detailTabs[0])

  function load() {
    classesApi
      .listAll()
      .then(setClasses)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'تعذر تحميل الفصول'))
  }

  useEffect(load, [])
  useEffect(() => {
    schoolsApi.list().then(setSchools).catch(() => setSchools([]))
  }, [])

  const activeClass = classes?.find((c) => c.id === selected) ?? null
  const schoolName = (id: string) => schools.find((s) => s.id === id)?.name ?? '—'

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="الفصول والحصص" />
        <div className="rounded-xl bg-danger-bg-soft px-4 py-6 text-center text-sm text-danger-light">{error}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="الفصول والحصص" actions={<Button size="sm" onClick={() => setAddOpen(true)}>+ فصل جديد</Button>} />

      {classes === null ? (
        <div className="rounded-xl bg-surface-alt px-4 py-8 text-center text-sm text-ink-faint">جارٍ التحميل...</div>
      ) : classes.length === 0 ? (
        <div className="rounded-xl bg-surface-alt px-4 py-8 text-center text-sm text-ink-faint">لا توجد فصول بعد</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {classes.map((c) => {
            const status = statusLabel[c.status]
            return (
              <Card
                key={c.id}
                onClick={() => { setSelected(c.id); setTab(detailTabs[0]) }}
                className="flex cursor-pointer flex-col gap-2.5 transition-shadow hover:shadow-panel"
              >
                <div className="flex justify-between">
                  <span className="text-sm font-bold text-ink">{c.name}</span>
                  <Badge tone={status.tone}>{status.label}</Badge>
                </div>
                <div className="text-[11px] text-ink-faint">{schoolName(c.schoolId)}</div>
                <div className="flex gap-4 text-[11px] text-ink-muted">
                  <span>{c.studentsCount} طالب</span>
                  <span>{c.resource ? `برنامج: ${c.resource.name}` : 'بدون برنامج مرتبط'}</span>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <AddClassModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={() => { setAddOpen(false); load() }}
        schools={schools}
      />

      <Modal open={activeClass !== null} onClose={() => setSelected(null)} width={720}>
        {activeClass && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-sans text-xl font-extrabold text-navy">{activeClass.name}</span>
                <div className="mt-1 text-xs text-ink-faint">{schoolName(activeClass.schoolId)}</div>
              </div>
              <button onClick={() => setSelected(null)} className="text-xl text-ink-faint">
                ✕
              </button>
            </div>

            <Tabs items={detailTabs} active={tab} onChange={setTab} />

            {tab === 'معلومات' && (
              <div className="grid grid-cols-2 gap-3.5 text-xs text-ink-soft sm:grid-cols-3">
                <div><div className="mb-1 text-ink-faint">البرنامج</div>{activeClass.resource?.name ?? '—'}</div>
                <div><div className="mb-1 text-ink-faint">المدرب</div>{activeClass.teacher?.name ?? '— بدون تعيين —'}</div>
                <div><div className="mb-1 text-ink-faint">عدد الطلاب</div>{activeClass.studentsCount}</div>
                <div><div className="mb-1 text-ink-faint">الحالة</div><Badge tone={statusLabel[activeClass.status].tone}>{statusLabel[activeClass.status].label}</Badge></div>
                <div><div className="mb-1 text-ink-faint">Agora تلقائي</div>{activeClass.autoAgora ? 'مفعّل' : 'غير مفعّل'}</div>
              </div>
            )}
            {tab === 'اللقاءات' && (
              <div className="flex flex-col gap-2">
                {activeClass.meetings.length === 0 ? (
                  <div className="text-xs text-ink-soft">لا توجد لقاءات مجدولة لهذا الفصل بعد</div>
                ) : (
                  activeClass.meetings.map((m) => (
                    <div key={m.id} className="flex items-center justify-between rounded-lg bg-surface-alt px-3.5 py-2.5 text-xs">
                      <span className="font-semibold text-ink">{m.title}</span>
                      <span className="text-ink-faint">{m.date} · {m.time}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
