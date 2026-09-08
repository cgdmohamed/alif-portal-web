import { useState } from 'react'
import Modal from './ui/Modal'
import { Field } from './ui/Input'
import Button from './ui/Button'
import { usersApi, roleLabel, type BackendRole } from '../lib/usersApi'
import type { School } from '../lib/schoolsApi'
import { ApiError } from '../lib/api'

const assignableRoles: BackendRole[] = ['platform_admin', 'school_admin', 'teacher', 'support_agent']

function generatePassword() {
  const bytes = crypto.getRandomValues(new Uint8Array(12))
  return Array.from(bytes, (byte) => 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'[byte % 57]).join('') + 'A1!'
}

export default function AddUserModal({
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
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<BackendRole>('teacher')
  const [schoolId, setSchoolId] = useState('')
  const [password] = useState(generatePassword)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState(false)

  function close() {
    setName('')
    setEmail('')
    setRole('teacher')
    setSchoolId('')
    setError(null)
    setCreated(false)
    onClose()
  }

  async function submit() {
    setSubmitting(true)
    setError(null)
    try {
      await usersApi.create({
        name,
        email,
        password,
        role,
        schoolId: schoolId || undefined,
      })
      setCreated(true)
      onCreated()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'تعذر إنشاء المستخدم')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={close}>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <span className="font-sans text-xl font-extrabold text-navy">إضافة مستخدم جديد</span>
          <button onClick={close} className="text-xl text-ink-faint">
            ✕
          </button>
        </div>

        {created ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success-bg text-2xl text-success">✓</span>
            <span className="font-sans text-lg font-extrabold text-navy">تم إنشاء المستخدم</span>
            <p className="text-xs text-ink-faint">
              كلمة السر المؤقتة: <span className="font-mono font-bold text-ink">{password}</span>
              <br />شاركها مع المستخدم ليسجل الدخول بها لأول مرة
            </p>
            <Button size="sm" className="mt-2" onClick={close}>تم</Button>
          </div>
        ) : (
          <>
            {error && (
              <div className="rounded-xl bg-danger-bg-soft px-4 py-3 text-xs font-semibold text-danger-light">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="الاسم الكامل">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl border border-line bg-surface px-4 py-3 text-[13px] text-ink-soft focus:border-indigo focus:bg-white focus:outline-none"
                />
              </Field>
              <Field label="البريد الإلكتروني">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl border border-line bg-surface px-4 py-3 text-[13px] text-ink-soft focus:border-indigo focus:bg-white focus:outline-none"
                />
              </Field>
              <Field label="الدور">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as BackendRole)}
                  className="rounded-xl border border-line bg-surface px-4 py-3 text-[13px] text-ink-soft focus:outline-none"
                >
                  {assignableRoles.map((r) => (
                    <option key={r} value={r}>{roleLabel[r]}</option>
                  ))}
                </select>
              </Field>
              {(role === 'school_admin' || role === 'teacher') && (
                <Field label="المدرسة">
                  <select
                    value={schoolId}
                    onChange={(e) => setSchoolId(e.target.value)}
                    className="rounded-xl border border-line bg-surface px-4 py-3 text-[13px] text-ink-soft focus:outline-none"
                  >
                    <option value="">اختر المدرسة</option>
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </Field>
              )}
            </div>

            <div className="mt-1.5 flex justify-end">
              <Button size="sm" className="px-9" disabled={submitting || !name || !email || ((role === 'school_admin' || role === 'teacher') && !schoolId)} onClick={submit}>
                {submitting ? 'جارٍ الإنشاء...' : 'إنشاء المستخدم'}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
