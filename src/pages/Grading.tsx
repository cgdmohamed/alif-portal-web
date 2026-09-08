import { useEffect, useState } from 'react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { Field } from '../components/ui/Input'
import Avatar from '../components/ui/Avatar'
import { assignmentsApi, type ApiSubmission } from '../lib/assignmentsApi'
import { ApiError } from '../lib/api'

export default function Grading() {
  const [queue, setQueue] = useState<ApiSubmission[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [current, setCurrent] = useState(0)
  const [grade, setGrade] = useState(85)
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState<'idle' | 'sent'>('idle')

  function load() {
    assignmentsApi
      .gradingQueue()
      .then(setQueue)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'تعذر تحميل قائمة التصحيح'))
  }

  useEffect(load, [])

  const student = queue?.[current] ?? null

  useEffect(() => {
    setGrade(85)
    setNote('')
    setSaved('idle')
  }, [current])

  async function submitGrade() {
    if (!student) return
    await assignmentsApi.grade(student.id, { grade, teacherNote: note || undefined })
    setSaved('sent')
    setTimeout(() => {
      setQueue((q) => q?.filter((s) => s.id !== student.id) ?? null)
      setCurrent((c) => Math.max(0, Math.min(c, (queue?.length ?? 1) - 2)))
    }, 900)
  }

  if (error) {
    return <div className="rounded-xl bg-danger-bg-soft px-4 py-6 text-center text-sm text-danger-light">{error}</div>
  }

  if (queue === null) {
    return <div className="rounded-xl bg-surface-alt px-4 py-8 text-center text-sm text-ink-faint">جارٍ التحميل...</div>
  }

  if (queue.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-2 text-center">
        <span className="text-2xl">🎉</span>
        <span className="text-sm font-bold text-ink">لا توجد واجبات بحاجة للتصحيح حاليًا</span>
      </div>
    )
  }

  return (
    <div dir="rtl" className="flex h-[calc(100vh-56px)] gap-4">
      <Card className="flex w-[26%] flex-none flex-col gap-3 overflow-y-auto">
        <span className="text-xs font-bold text-ink-soft">قائمة الانتظار ({queue.length})</span>
        {queue.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrent(i)}
            className={`flex items-center gap-2.5 rounded-lg p-2.5 text-right transition-colors ${
              current === i ? 'bg-indigo/10 ring-1 ring-indigo' : 'bg-surface-alt hover:bg-surface'
            }`}
          >
            <Avatar initials={q.student.name[0]} size={30} />
            <div className="flex-1 overflow-hidden">
              <div className="truncate text-xs font-semibold text-ink">{q.student.name}</div>
              <div className="truncate text-[10px] text-ink-faint">{q.assignment.title}</div>
            </div>
            <Badge tone="warning">بانتظار</Badge>
          </button>
        ))}
      </Card>

      {student && (
        <>
          <Card className="flex flex-1 flex-col gap-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <Button variant="secondary" size="sm" disabled={current === 0} onClick={() => setCurrent((c) => Math.max(0, c - 1))}>
                ◀ السابق
              </Button>
              <span className="text-xs font-semibold text-ink-muted">{current + 1} من {queue.length}</span>
              <Button variant="secondary" size="sm" disabled={current === queue.length - 1} onClick={() => setCurrent((c) => Math.min(queue.length - 1, c + 1))}>
                التالي ▶
              </Button>
            </div>
            <div className="flex items-center gap-2.5">
              <Avatar initials={student.student.name[0]} size={38} />
              <div>
                <div className="text-sm font-bold text-ink">{student.student.name}</div>
                <div className="text-[11px] text-ink-faint">{student.assignment.title}</div>
              </div>
            </div>
            <div className="rounded-xl border border-line p-4 text-sm leading-relaxed text-ink-soft">
              {student.answerPayload ? (
                <pre className="whitespace-pre-wrap font-sans">{JSON.stringify(student.answerPayload, null, 2)}</pre>
              ) : (
                'لا توجد إجابة نصية مرفقة لهذا التقديم'
              )}
            </div>
          </Card>

          <Card className="flex w-[26%] flex-none flex-col gap-3.5 overflow-y-auto">
            <span className="text-sm font-extrabold text-ink">التقييم</span>
            <Field label="الدرجة (%)">
              <input
                type="number"
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:border-indigo focus:bg-white focus:outline-none"
              />
            </Field>
            <Field label="ملاحظات للطالب">
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:border-indigo focus:bg-white focus:outline-none"
                placeholder="أحسنت! ركّز أكثر على الأمثلة..."
              />
            </Field>
            <div className="rounded-xl bg-success-bg px-3.5 py-2.5 text-[11px] text-success">
              سيصل الطالب إشعار بالدرجة بعد الحفظ
            </div>
            <Button size="sm" onClick={submitGrade}>
              {saved === 'sent' ? 'تم الإرسال ✓' : 'إرسال التقييم'}
            </Button>
          </Card>
        </>
      )}
    </div>
  )
}
