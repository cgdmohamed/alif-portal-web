import { useEffect, useState } from 'react'
import Modal from './ui/Modal'
import { Field } from './ui/Input'
import Button from './ui/Button'
import { classesApi } from '../lib/classesApi'
import { teachersApi, type ApiTeacher } from '../lib/teachersApi'
import { resourcesApi, type ApiResource } from '../lib/resourcesApi'
import type { School } from '../lib/schoolsApi'
import { ApiError } from '../lib/api'

const colors = ['#4338F2', '#807FF9', '#3FA9F5', '#8B89B8', '#22B07D', '#FF9F4A']

export default function AddClassModal({
  open,
  onClose,
  onCreated,
  schools,
}: {
  open: boolean
  onClose: () => void
  onCreated: () => void
  schools: School[]
}) {
  const [name, setName] = useState('')
  const [schoolId, setSchoolId] = useState('')
  const [teacherId, setTeacherId] = useState('')
  const [resourceId, setResourceId] = useState('')
  const [teachers, setTeachers] = useState<ApiTeacher[]>([])
  const [resources, setResources] = useState<ApiResource[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (open) resourcesApi.list('published').then(setResources).catch(() => setResources([]))
  }, [open])

  useEffect(() => {
    if (schoolId) teachersApi.listForSchool(schoolId).then(setTeachers).catch(() => setTeachers([]))
    else setTeachers([])
    setTeacherId('')
  }, [schoolId])

  function close() {
    setName('')
    setSchoolId('')
    setTeacherId('')
    setResourceId('')
    setError(null)
    setSubmitted(false)
    onClose()
  }

  async function submit() {
    setSubmitting(true)
    setError(null)
    try {
      await classesApi.create(schoolId, {
        name,
        teacherId: teacherId || undefined,
        resourceId: resourceId || undefined,
        color: colors[Math.floor(Math.random() * colors.length)],
        autoAgora: true,
      })
      setSubmitted(true)
      onCreated()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'تعذر إنشاء الفصل')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={close} width={640}>
      {submitted ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success-bg text-2xl text-success">
            ✓
          </span>
          <span className="font-sans text-lg font-extrabold text-navy">تم إنشاء الفصل بنجاح</span>
          <p className="text-xs text-ink-faint">يمكنك الآن إضافة الطلاب وجدولة الحصص</p>
          <Button size="sm" className="mt-2" onClick={close}>
            تم
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xl font-extrabold text-navy">إنشاء فصل جديد</span>
            <button onClick={close} className="text-xl text-ink-faint">
              ✕
            </button>
          </div>

          {error && (
            <div className="rounded-xl bg-danger-bg-soft px-4 py-3 text-xs font-semibold text-danger-light">
              {error}
            </div>
          )}

          <Field label="اسم الفصل">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="فصل الموهوبين — الرياضيات 3أ"
              className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink focus:border-indigo focus:bg-white focus:outline-none"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="المدرسة">
              <select
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
                className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-soft focus:outline-none"
              >
                <option value="">اختر المدرسة</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </Field>
            <Field label="المدرب">
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                disabled={!schoolId}
                className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-soft focus:outline-none disabled:opacity-50"
              >
                <option value="">— بحاجة لتعيين لاحقًا —</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </Field>
            <Field label="البرنامج المرتبط">
              <select
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value)}
                className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-soft focus:outline-none"
              >
                <option value="">بدون برنامج</option>
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="flex justify-end gap-2.5">
            <Button variant="secondary" size="sm" onClick={close}>
              إلغاء
            </Button>
            <Button size="sm" disabled={submitting || !name || !schoolId} onClick={submit}>
              {submitting ? 'جارٍ الإنشاء...' : 'إنشاء الفصل'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
