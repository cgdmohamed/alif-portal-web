import { useState } from 'react'
import Modal from './ui/Modal'
import { Field } from './ui/Input'
import Button from './ui/Button'
import { useSchoolStudents } from '../context/SchoolStudentsContext'
import { useSchoolClasses } from '../context/SchoolClassesContext'

const stages = ['ابتدائي', 'متوسط', 'ثانوي']

export default function AddStudentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addStudent } = useSchoolStudents()
  const { classes } = useSchoolClasses()
  const [name, setName] = useState('')
  const [stage, setStage] = useState(stages[0])
  const [className, setClassName] = useState(classes[0]?.name ?? '')
  const [parentName, setParentName] = useState('')
  const [parentEmail, setParentEmail] = useState('')
  const [studentEmail, setStudentEmail] = useState('')
  const [done, setDone] = useState(false)

  function close() {
    setName('')
    setParentName('')
    setParentEmail('')
    setStudentEmail('')
    setDone(false)
    onClose()
  }

  function submit() {
    if (!name.trim()) return
    addStudent({
      name: name.trim(),
      stage,
      className,
      parentName: parentName.trim() || '—',
      parentEmail: parentEmail.trim() || '—',
      studentEmail: studentEmail.trim() || '—',
    })
    setDone(true)
  }

  return (
    <Modal open={open} onClose={close} width={560}>
      {done ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success-bg text-2xl text-success">✓</span>
          <span className="font-sans text-lg font-extrabold text-navy">تمت إضافة الطالب بنجاح</span>
          <p className="text-xs text-ink-faint">سيتم إرسال دعوة للانضمام إلى بريد ولي الأمر عند توفره</p>
          <Button size="sm" className="mt-2" onClick={close}>تم</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xl font-extrabold text-navy">إضافة طالب جديد</span>
            <button onClick={close} className="text-xl text-ink-faint">✕</button>
          </div>

          <Field label="اسم الطالب">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="لمى الحربي"
              className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink focus:border-indigo focus:bg-white focus:outline-none"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="المرحلة الدراسية">
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-soft focus:outline-none"
              >
                {stages.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="الفصل">
              <select
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-soft focus:outline-none"
              >
                {classes.map((c) => <option key={c.id}>{c.name}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="اسم ولي الأمر">
              <input
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="عبدالله الحربي"
                className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink focus:border-indigo focus:bg-white focus:outline-none"
              />
            </Field>
            <Field label="بريد ولي الأمر">
              <input
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                placeholder="parent@email.com"
                className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink focus:border-indigo focus:bg-white focus:outline-none"
              />
            </Field>
          </div>

          <Field label="بريد الطالب (اختياري)">
            <input
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              placeholder="student@school.edu.sa"
              className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink focus:border-indigo focus:bg-white focus:outline-none"
            />
          </Field>

          <div className="flex justify-end gap-2.5">
            <Button variant="secondary" size="sm" onClick={close}>إلغاء</Button>
            <Button size="sm" onClick={submit}>إضافة الطالب</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
