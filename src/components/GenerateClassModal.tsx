import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from './ui/Modal'
import { Field } from './ui/Input'
import Button from './ui/Button'
import Switch from './ui/Switch'
import type { ApiResource as AlifResource } from '../lib/resourcesApi'
import { useSchoolClasses } from '../context/SchoolClassesContext'
import { useSchoolTeachers } from '../context/SchoolTeachersContext'

const UNASSIGNED = '— بحاجة لتعيين لاحقًا —'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function addDaysToIso(iso: string, days: number) {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

interface SessionRow {
  title: string
  date: string
  time: string
}

export default function GenerateClassModal({
  resource,
  onClose,
}: {
  resource: AlifResource | null
  onClose: () => void
}) {
  const navigate = useNavigate()
  const { addClass } = useSchoolClasses()
  const { teachers } = useSchoolTeachers()
  const trainerOptions = [...teachers.filter((t) => t.status === 'نشط').map((t) => t.name), UNASSIGNED]

  const [step, setStep] = useState<1 | 2>(1)
  const [trainer, setTrainer] = useState(trainerOptions[0])
  const [studentsCount, setStudentsCount] = useState(25)
  const [firstDate, setFirstDate] = useState(todayIso())
  const [defaultTime, setDefaultTime] = useState('16:00')
  const [autoAgora, setAutoAgora] = useState(true)
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [done, setDone] = useState(false)

  function close() {
    setStep(1)
    setDone(false)
    setTrainer(trainerOptions[0])
    setStudentsCount(25)
    setFirstDate(todayIso())
    setDefaultTime('16:00')
    setAutoAgora(true)
    setSessions([])
    onClose()
  }

  function goToSchedule() {
    if (!resource) return
    const proposed: SessionRow[] = Array.from({ length: resource.sessionsCount }, (_, i) => ({
      title: `لقاء ${i + 1} — ${resource.name}`,
      date: addDaysToIso(firstDate || todayIso(), i * 7),
      time: defaultTime,
    }))
    setSessions(proposed)
    setStep(2)
  }

  function updateSession(index: number, patch: Partial<SessionRow>) {
    setSessions((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)))
  }

  async function generate() {
    if (!resource) return
    const teacherId = teachers.find((t) => t.name === trainer)?.id ?? null
    await addClass(
      {
        name: `${resource.name} — ${resource.stage}`,
        resourceId: resource.id,
        resourceName: resource.name,
        resourceVersionAtGeneration: resource.versionNumber,
        trainer,
        teacherId,
        studentsCount,
        color: resource.color,
        performance: 0,
        autoAgora,
      },
      sessions,
    )
    setDone(true)
  }

  return (
    <Modal open={resource !== null} onClose={close} width={640}>
      {resource && (
        done ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success-bg text-2xl text-success">✓</span>
            <span className="font-sans text-lg font-extrabold text-navy">تم توليد الفصل بنجاح</span>
            <p className="text-xs text-ink-faint">
              تم إنشاء الفصل من برنامج «{resource.name}» وجدولة {sessions.length} لقاءً
              {autoAgora ? ' مع إنشاء اجتماع Agora تلقائي لكل لقاء' : ''}.
            </p>
            <div className="mt-2 flex gap-2.5">
              <Button variant="secondary" size="sm" onClick={close}>إغلاق</Button>
              <Button size="sm" onClick={() => { close(); navigate('/school/classes') }}>عرض الفصول</Button>
            </div>
          </div>
        ) : step === 1 ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-sans text-lg font-extrabold text-navy">توليد فصل من «{resource.name}»</span>
              <button onClick={close} className="text-xl text-ink-faint">✕</button>
            </div>
            <div className="text-[11px] font-bold text-indigo">الخطوة 1 من 2 — معلومات الفصل</div>
            <div className="rounded-xl bg-surface-alt p-3.5 text-[11px] text-ink-soft">
              يتضمن هذا البرنامج {resource.sessionsCount} لقاءً، {resource.questionsIncluded} سؤالًا من بنك أسئلة ألف،
              و{resource.contentItemsIncluded} عنصر محتوى — سيتم ربطها تلقائيًا بالفصل الجديد.
            </div>

            <Field label="المدرب المسؤول">
              <select
                value={trainer}
                onChange={(e) => setTrainer(e.target.value)}
                className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-soft focus:outline-none"
              >
                {trainerOptions.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="عدد الطلاب المتوقع">
              <input
                type="number"
                value={studentsCount}
                onChange={(e) => setStudentsCount(Number(e.target.value))}
                className="rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:border-indigo focus:bg-white focus:outline-none"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="تاريخ أول لقاء">
                <input
                  type="date"
                  value={firstDate}
                  onChange={(e) => setFirstDate(e.target.value)}
                  className="rounded-xl border border-line bg-surface px-3 py-3 text-sm focus:outline-none"
                />
              </Field>
              <Field label="الوقت المعتاد للقاءات">
                <input
                  type="time"
                  value={defaultTime}
                  onChange={(e) => setDefaultTime(e.target.value)}
                  className="rounded-xl border border-line bg-surface px-3 py-3 text-sm focus:outline-none"
                />
              </Field>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-line-accent bg-surface-alt px-4 py-3">
              <span className="text-xs text-navy-darker">إنشاء اجتماع Agora تلقائيًا لكل لقاء</span>
              <Switch checked={autoAgora} onChange={setAutoAgora} />
            </div>

            <div className="flex justify-end gap-2.5">
              <Button variant="secondary" size="sm" onClick={close}>إلغاء</Button>
              <Button size="sm" onClick={goToSchedule}>التالي: جدول اللقاءات</Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-sans text-lg font-extrabold text-navy">جدول لقاءات «{resource.name}»</span>
              <button onClick={close} className="text-xl text-ink-faint">✕</button>
            </div>
            <div className="text-[11px] font-bold text-indigo">الخطوة 2 من 2 — جدول اللقاءات ({sessions.length} لقاء)</div>
            <p className="text-[11px] text-ink-faint">
              تم اقتراح موعد أسبوعي لكل لقاء بدءًا من التاريخ الذي اخترته — يمكنك تعديل أي موعد قبل التأكيد.
            </p>

            <div className="flex max-h-72 flex-col gap-2 overflow-y-auto pe-1">
              {sessions.map((s, i) => (
                <div key={i} className="flex items-center gap-2.5 rounded-xl bg-surface-alt p-2.5">
                  <span className="w-16 flex-none text-[11px] font-bold text-ink-soft">لقاء {i + 1}</span>
                  <input
                    type="date"
                    value={s.date}
                    onChange={(e) => updateSession(i, { date: e.target.value })}
                    className="flex-1 rounded-lg border border-line bg-white px-2.5 py-2 text-xs focus:border-indigo focus:outline-none"
                  />
                  <input
                    type="time"
                    value={s.time}
                    onChange={(e) => updateSession(i, { time: e.target.value })}
                    className="w-28 flex-none rounded-lg border border-line bg-white px-2.5 py-2 text-xs focus:border-indigo focus:outline-none"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2.5">
              <Button variant="secondary" size="sm" onClick={() => setStep(1)}>رجوع</Button>
              <Button size="sm" onClick={generate}>توليد الفصل</Button>
            </div>
          </div>
        )
      )}
    </Modal>
  )
}
