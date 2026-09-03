import { useEffect, useState } from 'react'
import Modal from './ui/Modal'
import { Field } from './ui/Input'
import Button from './ui/Button'
import { packagesApi, type PackageWithSubscribers } from '../lib/schoolsApi'
import { ApiError } from '../lib/api'

const colors = ['#4338F2', '#807FF9', '#3FA9F5', '#8B89B8', '#22B07D', '#FF9F4A']
const cycles = [
  { value: 'monthly', label: 'شهري' },
  { value: 'quarterly', label: 'فصلي' },
  { value: 'annual', label: 'سنوي' },
] as const

export default function PackageFormModal({
  open,
  onClose,
  onSaved,
  initial,
  allFeatures,
}: {
  open: boolean
  onClose: () => void
  onSaved: () => void
  initial: PackageWithSubscribers | null
  allFeatures: string[]
}) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState(0)
  const [cycle, setCycle] = useState<(typeof cycles)[number]['value']>('annual')
  const [maxStudents, setMaxStudents] = useState(300)
  const [maxClasses, setMaxClasses] = useState(15)
  const [storageGB, setStorageGB] = useState(100)
  const [color, setColor] = useState(colors[0])
  const [features, setFeatures] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? '')
      setPrice(initial?.price ?? 0)
      setCycle((initial?.cycle as (typeof cycles)[number]['value']) ?? 'annual')
      setMaxStudents(initial?.maxStudents ?? 300)
      setMaxClasses(initial?.maxClasses ?? 15)
      setStorageGB(initial?.storageGB ?? 100)
      setColor(initial?.color ?? colors[0])
      setFeatures(initial?.features ?? [])
      setError(null)
    }
  }, [open, initial])

  function toggleFeature(f: string) {
    setFeatures((fs) => (fs.includes(f) ? fs.filter((x) => x !== f) : [...fs, f]))
  }

  async function save() {
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    const payload = { name: name.trim(), price, cycle, maxStudents, maxClasses, storageGB, color, features }
    try {
      if (initial) {
        await packagesApi.update(initial.id, payload)
      } else {
        await packagesApi.create(payload)
      }
      onSaved()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'تعذر حفظ الباقة')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} width={640}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="font-sans text-xl font-extrabold text-navy">
            {initial ? 'تعديل الباقة' : 'إنشاء باقة جديدة'}
          </span>
          <button onClick={onClose} className="text-xl text-ink-faint">✕</button>
        </div>

        {error && (
          <div className="rounded-xl bg-danger-bg-soft px-4 py-3 text-xs font-semibold text-danger-light">
            {error}
          </div>
        )}

        <Field label="اسم الباقة">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="باقة المؤسسات — سنوية"
            className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink focus:border-indigo focus:bg-white focus:outline-none"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="السعر (ريال)">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:border-indigo focus:bg-white focus:outline-none"
            />
          </Field>
          <Field label="الدورة">
            <select
              value={cycle}
              onChange={(e) => setCycle(e.target.value as (typeof cycles)[number]['value'])}
              className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-soft focus:outline-none"
            >
              {cycles.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </Field>
          <Field label="الحد الأقصى للطلاب">
            <input
              type="number"
              value={maxStudents}
              onChange={(e) => setMaxStudents(Number(e.target.value))}
              className="rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:border-indigo focus:bg-white focus:outline-none"
            />
          </Field>
          <Field label="الحد الأقصى للفصول">
            <input
              type="number"
              value={maxClasses}
              onChange={(e) => setMaxClasses(Number(e.target.value))}
              className="rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:border-indigo focus:bg-white focus:outline-none"
            />
          </Field>
          <Field label="المساحة التخزينية (GB)">
            <input
              type="number"
              value={storageGB}
              onChange={(e) => setStorageGB(Number(e.target.value))}
              className="rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:border-indigo focus:bg-white focus:outline-none"
            />
          </Field>
          <Field label="لون الباقة">
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
        </div>

        <Field label="الميزات المضمنة">
          <div className="flex flex-col gap-2">
            {allFeatures.map((f) => (
              <label key={f} className="flex items-center gap-2.5 rounded-lg bg-surface-alt px-3.5 py-2.5 text-xs">
                <input
                  type="checkbox"
                  checked={features.includes(f)}
                  onChange={() => toggleFeature(f)}
                  className="h-4 w-4 accent-indigo"
                />
                <span className="text-ink">{f}</span>
              </label>
            ))}
          </div>
        </Field>

        <div className="flex justify-end gap-2.5">
          <Button variant="secondary" size="sm" onClick={onClose}>إلغاء</Button>
          <Button size="sm" disabled={saving} onClick={save}>
            {saving ? 'جارٍ الحفظ...' : initial ? 'حفظ التعديلات' : 'إنشاء الباقة'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
