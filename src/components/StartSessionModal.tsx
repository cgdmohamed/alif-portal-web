import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from './ui/Modal'
import { Field } from './ui/Input'
import Button from './ui/Button'
import { useAuth } from '../context/AuthContext'
import { useCurrentTeacher } from '../context/CurrentTeacherContext'
import { meetingsApi } from '../lib/meetingsApi'

export default function StartSessionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { classes } = useCurrentTeacher()
  const [classId, setClassId] = useState(classes[0]?.id ?? '')
  const [topic, setTopic] = useState('')
  const [starting, setStarting] = useState(false)

  function close() {
    setTopic('')
    onClose()
  }

  async function start() {
    const cls = classes.find((c) => c.id === classId) ?? classes[0]
    if (!cls) return
    setStarting(true)
    try {
      const meeting = await meetingsApi.create({
        classId: cls.id,
        title: topic.trim() || `لقاء مباشر — ${cls.name}`,
        scheduledAt: new Date().toISOString(),
        durationMinutes: 60,
      })
      navigate('/teacher/live-session', {
        state: {
          meetingId: meeting.id,
          title: meeting.title,
          trainer: user?.name,
          className: cls.name,
          count: cls.studentsCount,
        },
      })
    } finally {
      setStarting(false)
    }
  }

  return (
    <Modal open={open} onClose={close} width={480}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="font-sans text-lg font-extrabold text-navy">بدء لقاء مباشر الآن</span>
          <button onClick={close} className="text-xl text-ink-faint">✕</button>
        </div>
        <p className="text-xs text-ink-muted">
          سيبدأ اللقاء فورًا وسيصل إشعار للطلاب للانضمام مباشرة — بدون الحاجة لجدولة مسبقة.
        </p>

        <Field label="الفصل">
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-soft focus:outline-none"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name} — {c.studentsCount} طالب</option>
            ))}
          </select>
        </Field>

        <Field label="عنوان اللقاء (اختياري)">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="مثال: مراجعة سريعة قبل الاختبار"
            className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink focus:border-indigo focus:bg-white focus:outline-none"
          />
        </Field>

        <Button size="sm" disabled={!classId || starting} onClick={start}>
          {starting ? 'جارٍ البدء...' : '🔴 بدء اللقاء الآن'}
        </Button>
      </div>
    </Modal>
  )
}
