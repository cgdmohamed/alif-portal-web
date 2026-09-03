import { useEffect, useState } from 'react'
import Modal from './ui/Modal'
import { Field } from './ui/Input'
import Button from './ui/Button'
import { assignmentsApi, type AssignmentKind } from '../lib/assignmentsApi'
import { classesApi, type ApiClass } from '../lib/classesApi'
import { ApiError } from '../lib/api'

const kinds: { value: AssignmentKind; label: string }[] = [
  { value: 'quiz', label: 'اختبار' },
  { value: 'essay', label: 'مقالي' },
  { value: 'puzzle', label: 'لغز' },
]

export default function AssignmentWizardModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: () => void
}) {
  const [title, setTitle] = useState('')
  const [classId, setClassId] = useState('')
  const [kind, setKind] = useState<AssignmentKind>('quiz')
  const [dueAt, setDueAt] = useState('')
  const [classes, setClasses] = useState<ApiClass[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (open) classesApi.listAll().then(setClasses).catch(() => setClasses([]))
  }, [open])

  function close() {
    setTitle('')
    setClassId('')
    setDueAt('')
    setError(null)
    setDone(false)
    onClose()
  }

  async function submit() {
    if (!title.trim() || !classId || !dueAt) return
    setSubmitting(true)
    setError(null)
    try {
      await assignmentsApi.create(classId, { title: title.trim(), kind, dueAt: new Date(dueAt).toISOString() })
      setDone(true)
      onCreated()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'تعذر إنشاء الواجب')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={close} width={560}>
      {done ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success-bg text-2xl text-success">✓</span>
          <span className="font-sans text-lg font-extrabold text-navy">تم نشر الواجب بنجاح</span>
          <Button size="sm" className="mt-2" onClick={close}>تم</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xl font-extrabold text-navy">إنشاء واجب جديد</span>
            <button onClick={close} className="text-xl text-ink-faint">✕</button>
          </div>

          {error && (
            <div className="rounded-xl bg-danger-bg-soft px-4 py-3 text-xs font-semibold text-danger-light">
              {error}
            </div>
          )}

          <Field label="عنوان الواجب">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="واجب التفاضل والتكامل"
              className="rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:border-indigo focus:bg-white focus:outline-none"
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="الفصل المستهدف">
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-soft focus:outline-none"
              >
                <option value="">اختر الفصل</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="النوع">
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as AssignmentKind)}
                className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-soft focus:outline-none"
              >
                {kinds.map((k) => (
                  <option key={k.value} value={k.value}>{k.label}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="الموعد النهائي">
            <input
              type="date"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className="rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:outline-none"
            />
          </Field>

          <div className="mt-1.5 flex justify-end">
            <Button size="sm" className="px-9" disabled={submitting || !title || !classId || !dueAt} onClick={submit}>
              {submitting ? 'جارٍ النشر...' : 'نشر الواجب'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
