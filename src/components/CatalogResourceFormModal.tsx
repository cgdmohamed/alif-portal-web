import { useState } from 'react'
import Modal from './ui/Modal'
import { Field } from './ui/Input'
import Button from './ui/Button'
import { allFeatures } from '../data/packages'
import { resourcesApi, type ResourceStage } from '../lib/resourcesApi'
import { ApiError } from '../lib/api'

const colors = ['#4338F2', '#807FF9', '#3FA9F5', '#22B07D', '#FF9F4A', '#8B89B8']
const stages: ResourceStage[] = ['ابتدائي', 'متوسط', 'ثانوي']
const programs = ['موهبة أكاديمية', 'إبداع وابتكار', 'قيادة وريادة']

export default function CatalogResourceFormModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: () => void
}) {
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [stage, setStage] = useState<ResourceStage>(stages[0])
  const [program, setProgram] = useState(programs[0])
  const [description, setDescription] = useState('')
  const [sessionsCount, setSessionsCount] = useState(8)
  const [requiredFeature, setRequiredFeature] = useState(allFeatures[0])
  const [color, setColor] = useState(colors[0])
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function close() {
    setName('')
    setSubject('')
    setDescription('')
    setSessionsCount(8)
    setDone(false)
    setError(null)
    onClose()
  }

  async function submit() {
    if (!name.trim() || !subject.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const created = await resourcesApi.create({
        name: name.trim(),
        subject: subject.trim(),
        stage,
        program,
        description: description.trim() || 'وصف البرنامج قيد الإعداد.',
        sessionsCount,
        requiredFeature,
        color,
      })
      await resourcesApi.update(created.id, { status: 'published' })
      setDone(true)
      onCreated()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'تعذر نشر البرنامج')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={close} width={640}>
      {done ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success-bg text-2xl text-success">✓</span>
          <span className="font-sans text-lg font-extrabold text-navy">تم نشر البرنامج بنجاح</span>
          <p className="text-xs text-ink-faint">أصبح البرنامج متاحًا الآن للمدارس التي تملك الميزة المطلوبة ضمن باقتها</p>
          <Button size="sm" className="mt-2" onClick={close}>تم</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xl font-extrabold text-navy">نشر برنامج جديد</span>
            <button onClick={close} className="text-xl text-ink-faint">✕</button>
          </div>

          {error && (
            <div className="rounded-xl bg-danger-bg-soft px-4 py-3 text-xs font-semibold text-danger-light">
              {error}
            </div>
          )}

          <Field label="اسم البرنامج">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="برنامج التفكير الناقد"
              className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink focus:border-indigo focus:bg-white focus:outline-none"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="الموضوع">
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="مهارات تفكير"
                className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink focus:border-indigo focus:bg-white focus:outline-none"
              />
            </Field>
            <Field label="المرحلة الدراسية">
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as ResourceStage)}
                className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-soft focus:outline-none"
              >
                {stages.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="البرنامج">
              <select
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-soft focus:outline-none"
              >
                {programs.map((p) => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="عدد اللقاءات">
              <input
                type="number"
                value={sessionsCount}
                onChange={(e) => setSessionsCount(Number(e.target.value))}
                className="rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:border-indigo focus:bg-white focus:outline-none"
              />
            </Field>
          </div>

          <Field label="وصف البرنامج">
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف مختصر لمحتوى البرنامج وأهدافه"
              className="rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:border-indigo focus:bg-white focus:outline-none"
            />
          </Field>

          <Field label="الميزة المطلوبة للوصول (من باقة المدرسة)">
            <select
              value={requiredFeature}
              onChange={(e) => setRequiredFeature(e.target.value)}
              className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-soft focus:outline-none"
            >
              {allFeatures.map((f) => <option key={f}>{f}</option>)}
            </select>
          </Field>

          <Field label="لون الغلاف">
            <div className="flex items-center gap-2 pt-1">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-navy' : ''}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </Field>

          <div className="flex justify-end gap-2.5">
            <Button variant="secondary" size="sm" onClick={close}>إلغاء</Button>
            <Button size="sm" disabled={submitting} onClick={submit}>
              {submitting ? 'جارٍ النشر...' : 'نشر البرنامج'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
