import { useEffect, useState } from 'react'
import Modal from './ui/Modal'
import { Field } from './ui/Input'
import Button from './ui/Button'
import { packagesApi, schoolsApi, type Package } from '../lib/schoolsApi'
import { ApiError } from '../lib/api'

const schoolTypes = ['أهلية · بنين وبنات', 'حكومية · بنين', 'حكومية · بنات', 'عالمية']

export default function AddSchoolModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: () => void
}) {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [packages, setPackages] = useState<Package[]>([])

  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [type, setType] = useState(schoolTypes[0])
  const [principal, setPrincipal] = useState('')
  const [packageId, setPackageId] = useState('')

  useEffect(() => {
    if (open) packagesApi.list().then(setPackages).catch(() => setPackages([]))
  }, [open])

  function close() {
    setSubmitted(false)
    setError(null)
    setName('')
    setCity('')
    setPrincipal('')
    onClose()
  }

  async function submit() {
    setError(null)
    setSubmitting(true)
    try {
      await schoolsApi.create({ name, city, type, principal, packageId: packageId || undefined })
      setSubmitted(true)
      onCreated()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'تعذر إضافة المدرسة')
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
          <span className="font-sans text-lg font-extrabold text-navy">تمت إضافة المدرسة بنجاح</span>
          <p className="text-xs text-ink-faint">
            سيتم إرسال دعوة انضمام إلى مدير المدرسة عبر البريد الإلكتروني
          </p>
          <Button size="sm" className="mt-2" onClick={close}>
            تم
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xl font-extrabold text-navy">إضافة مدرسة جديدة</span>
            <button onClick={close} className="text-xl text-ink-faint">
              ✕
            </button>
          </div>

          {error && (
            <div className="rounded-xl bg-danger-bg-soft px-4 py-3 text-xs font-semibold text-danger-light">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="اسم المدرسة">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مدارس الرواد الأهلية"
                className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink focus:border-indigo focus:bg-white focus:outline-none"
              />
            </Field>
            <Field label="المدينة">
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="الرياض"
                className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink focus:border-indigo focus:bg-white focus:outline-none"
              />
            </Field>
            <Field label="نوع المدرسة">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-soft focus:outline-none"
              >
                {schoolTypes.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="مدير المدرسة">
              <input
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                placeholder="أ. فهد المالكي"
                className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink focus:border-indigo focus:bg-white focus:outline-none"
              />
            </Field>
            <Field label="الباقة">
              <select
                value={packageId}
                onChange={(e) => setPackageId(e.target.value)}
                className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-soft focus:outline-none"
              >
                <option value="">بدون باقة</option>
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="flex justify-end gap-2.5">
            <Button variant="secondary" size="sm" onClick={close}>
              إلغاء
            </Button>
            <Button size="sm" disabled={submitting || !name || !city || !principal} onClick={submit}>
              {submitting ? 'جارٍ الإضافة...' : 'إضافة المدرسة'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
