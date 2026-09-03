import { useState } from 'react'
import Modal from './ui/Modal'
import { Field } from './ui/Input'
import Button from './ui/Button'
import { useSchoolClasses } from '../context/SchoolClassesContext'
import { useSchoolEnrollmentCodes, type EnrollmentCode } from '../context/SchoolEnrollmentCodesContext'

const codeTypes: { value: EnrollmentCode['codeType']; label: string; hint: string }[] = [
  { value: 'single', label: 'استخدام واحد', hint: 'ينتهي بعد أول التحاق' },
  { value: 'multi', label: 'استخدامات متعددة', hint: 'يُستخدم حتى الحد الأقصى المحدد' },
  { value: 'batch', label: 'دفعة طلاب', hint: 'مخصص لاستيراد دفعة كاملة دفعة واحدة' },
]

function addDaysIso(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export default function GenerateCodeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { classes } = useSchoolClasses()
  const { addCode } = useSchoolEnrollmentCodes()
  const [classId, setClassId] = useState(classes[0]?.id ?? '')
  const [codeType, setCodeType] = useState<EnrollmentCode['codeType']>('multi')
  const [maxUses, setMaxUses] = useState(30)
  const [expiresAt, setExpiresAt] = useState(addDaysIso(30))
  const [generated, setGenerated] = useState<EnrollmentCode | null>(null)
  const [copied, setCopied] = useState(false)

  function close() {
    setGenerated(null)
    setCopied(false)
    setCodeType('multi')
    setMaxUses(30)
    setExpiresAt(addDaysIso(30))
    onClose()
  }

  async function submit() {
    if (!classId) return
    const code = await addCode({ classId, codeType, maxUses, expiresAt })
    setGenerated(code)
  }

  function copy() {
    if (!generated) return
    navigator.clipboard?.writeText(generated.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <Modal open={open} onClose={close} width={520}>
      {generated ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success-bg text-2xl text-success">✓</span>
          <span className="font-sans text-lg font-extrabold text-navy">تم توليد الكود بنجاح</span>
          <div className="mt-1 w-full rounded-xl border-2 border-dashed border-line-checkbox bg-surface-alt px-4 py-4 text-center">
            <span className="font-mono text-xl font-extrabold tracking-wider text-indigo">{generated.code}</span>
          </div>
          <p className="text-xs text-ink-faint">شارك هذا الكود مع الطلاب أو أولياء الأمور للالتحاق بالفصل مباشرة</p>
          <div className="mt-2 flex gap-2.5">
            <Button variant="secondary" size="sm" onClick={copy}>{copied ? 'تم النسخ ✓' : 'نسخ الكود'}</Button>
            <Button size="sm" onClick={close}>تم</Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-sans text-lg font-extrabold text-navy">توليد كود التحاق جديد</span>
            <button onClick={close} className="text-xl text-ink-faint">✕</button>
          </div>

          <Field label="الفصل المرتبط">
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-soft focus:outline-none"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>

          <Field label="نوع الكود">
            <div className="flex flex-col gap-2">
              {codeTypes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setCodeType(t.value)}
                  className={`flex flex-col items-start rounded-xl border px-4 py-3 text-right transition-colors ${
                    codeType === t.value ? 'border-indigo bg-surface-alt' : 'border-line bg-white hover:bg-surface-alt'
                  }`}
                >
                  <span className="text-xs font-bold text-ink">{t.label}</span>
                  <span className="text-[11px] text-ink-faint">{t.hint}</span>
                </button>
              ))}
            </div>
          </Field>

          {codeType !== 'single' && (
            <Field label="الحد الأقصى للاستخدامات">
              <input
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(Number(e.target.value))}
                className="rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:border-indigo focus:bg-white focus:outline-none"
              />
            </Field>
          )}

          <Field label="تاريخ الانتهاء">
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:outline-none"
            />
          </Field>

          <div className="flex justify-end gap-2.5">
            <Button variant="secondary" size="sm" onClick={close}>إلغاء</Button>
            <Button size="sm" onClick={submit} disabled={!classId}>توليد الكود</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
