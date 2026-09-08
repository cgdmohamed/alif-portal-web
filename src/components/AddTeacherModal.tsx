import { useState } from 'react'
import Modal from './ui/Modal'
import { Field } from './ui/Input'
import Button from './ui/Button'
import { useSchoolTeachers } from '../context/SchoolTeachersContext'

export default function AddTeacherModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addTeacher } = useSchoolTeachers()
  const [name, setName] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [done, setDone] = useState(false)

  function close() {
    setName('')
    setSpecialty('')
    setEmail('')
    setPhone('')
    setDone(false)
    onClose()
  }

  function submit() {
    if (!name.trim()) return
    addTeacher({
      name: name.trim(),
      specialty: specialty.trim() || 'أخصائي موهبة',
      email: email.trim() || '—',
      phone: phone.trim() || '—',
    })
    setDone(true)
  }

  return (
    <Modal open={open} onClose={close} width={520}>
      {done ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success-bg text-2xl text-success">✓</span>
          <span className="font-sans text-lg font-extrabold text-navy">تمت إضافة المعلم بنجاح</span>
          <p className="text-xs text-ink-faint">أضف بيانات المعلم إلى سجل المدرسة</p>
          <Button size="sm" className="mt-2" onClick={close}>تم</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xl font-extrabold text-navy">إضافة معلم جديد</span>
            <button onClick={close} className="text-xl text-ink-faint">✕</button>
          </div>

          <Field label="اسم المعلم">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="أ. بندر القحطاني"
              className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink focus:border-indigo focus:bg-white focus:outline-none"
            />
          </Field>
          <Field label="التخصص">
            <input
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="أخصائي موهبة — رياضيات"
              className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink focus:border-indigo focus:bg-white focus:outline-none"
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="البريد الإلكتروني">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@alef.edu"
                className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink focus:border-indigo focus:bg-white focus:outline-none"
              />
            </Field>
            <Field label="رقم الجوال">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05xxxxxxxx"
                className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink focus:border-indigo focus:bg-white focus:outline-none"
              />
            </Field>
          </div>

          <div className="flex justify-end gap-2.5">
            <Button variant="secondary" size="sm" onClick={close}>إلغاء</Button>
            <Button size="sm" onClick={submit}>إضافة المعلم</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
