import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import { Field } from '../components/ui/Input'
import { Fragment } from 'react'
import { meetingsApi, type ApiMeeting } from '../lib/meetingsApi'
import { classesApi, type ApiClass } from '../lib/classesApi'
import { ApiError } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { teachersApi } from '../lib/teachersApi'

const days = ['سبت', 'أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة']
const hourSlots = [9, 11, 13, 15, 17, 19]
const hourLabels = ['9ص', '11ص', '1م', '3م', '5م', '7م']
const views = ['أسبوع', 'يوم', 'قائمة'] as const

function dayIndexOf(date: Date) {
  // JS getDay(): 0=Sun..6=Sat. Arabic week here starts Saturday.
  return (date.getDay() + 1) % 7
}

function nearestHourSlot(date: Date) {
  const hour = date.getHours()
  let best = 0
  let bestDiff = Infinity
  hourSlots.forEach((h, i) => {
    const diff = Math.abs(h - hour)
    if (diff < bestDiff) {
      bestDiff = diff
      best = i
    }
  })
  return best
}

export default function CalendarPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [view, setView] = useState<(typeof views)[number]>('أسبوع')
  const [dayIndex, setDayIndex] = useState(dayIndexOf(new Date()))
  const [meetings, setMeetings] = useState<ApiMeeting[] | null>(null)
  const [classes, setClasses] = useState<ApiClass[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<ApiMeeting | null>(null)

  const [title, setTitle] = useState('')
  const [classId, setClassId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('16:00')
  const [duration, setDuration] = useState(60)
  const [confirmed, setConfirmed] = useState(false)

  function load() {
    meetingsApi
      .list('month')
      .then(setMeetings)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'تعذر تحميل اللقاءات'))
  }

  useEffect(load, [])
  useEffect(() => {
    const request = user?.role === 'teacher'
      ? teachersApi.myClasses()
      : user?.schoolId
        ? classesApi.listForSchool(user.schoolId)
        : classesApi.listAll()
    request.then(setClasses).catch(() => setClasses([]))
  }, [user?.role, user?.schoolId])

  const events = useMemo(
    () =>
      (meetings ?? []).map((m) => {
        const d = new Date(m.scheduledAt)
        return { meeting: m, day: dayIndexOf(d), row: nearestHourSlot(d), date: d }
      }),
    [meetings],
  )

  async function scheduleMeeting() {
    if (!title.trim() || !classId || !date) return
    await meetingsApi.create({
      classId,
      title: title.trim(),
      scheduledAt: new Date(`${date}T${time}`).toISOString(),
      durationMinutes: duration,
    })
    setTitle('')
    setClassId('')
    setDate('')
    setConfirmed(true)
    setTimeout(() => setConfirmed(false), 2500)
    load()
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="التقويم وجدولة اللقاءات" />
        <div className="rounded-xl bg-danger-bg-soft px-4 py-6 text-center text-sm text-danger-light">{error}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="التقويم وجدولة اللقاءات"
        subtitle="جدولة كل اللقاءات مع تكامل Agora"
        actions={
          <>
            {views.map((v) => (
              <Button key={v} size="sm" variant={view === v ? 'primary' : 'secondary'} onClick={() => setView(v)}>
                {v}
              </Button>
            ))}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="overflow-x-auto p-4">
          {meetings === null ? (
            <div className="py-10 text-center text-xs text-ink-faint">جارٍ التحميل...</div>
          ) : (
            <>
              {view === 'أسبوع' && (
                <div className="grid min-w-[640px] grid-cols-8 gap-1.5">
                  <div />
                  {days.map((d) => (
                    <div key={d} className="pb-2 text-center text-xs font-bold text-ink-soft">
                      {d}
                    </div>
                  ))}
                  {hourLabels.map((h, rowIdx) => (
                    <Fragment key={h}>
                      <div className="pe-2 text-left text-[10px] text-ink-faint">{h}</div>
                      {days.map((_, colIdx) => {
                        const ev = events.find((e) => e.day === colIdx && e.row === rowIdx)
                        return (
                          <div key={colIdx} className="h-14 rounded-md border border-line-soft bg-surface-alt/50">
                            {ev && (
                              <button
                                onClick={() => setSelectedEvent(ev.meeting)}
                                className="h-full w-full rounded-md px-2 py-1 text-right text-[10px] font-bold text-white transition-transform hover:scale-[1.03] bg-indigo"
                              >
                                {ev.meeting.title}
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </Fragment>
                  ))}
                </div>
              )}

              {view === 'يوم' && (
                <div className="flex min-w-[320px] flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setDayIndex((d) => (d - 1 + days.length) % days.length)}
                      className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft"
                    >
                      ◀ السابق
                    </button>
                    <span className="text-sm font-extrabold text-ink">يوم {days[dayIndex]}</span>
                    <button
                      onClick={() => setDayIndex((d) => (d + 1) % days.length)}
                      className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft"
                    >
                      التالي ▶
                    </button>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {hourLabels.map((h, rowIdx) => {
                      const ev = events.find((e) => e.day === dayIndex && e.row === rowIdx)
                      return (
                        <div key={h} className="flex items-center gap-3">
                          <span className="w-10 flex-none text-[10px] text-ink-faint">{h}</span>
                          <div className="h-12 flex-1 rounded-md border border-line-soft bg-surface-alt/50">
                            {ev && (
                              <button
                                onClick={() => setSelectedEvent(ev.meeting)}
                                className="flex h-full w-full items-center rounded-md bg-indigo px-3 text-right text-xs font-bold text-white"
                              >
                                {ev.meeting.title} — {ev.meeting.classEntity.teacher?.name ?? 'بدون مدرب'}
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {view === 'قائمة' && (
                <div className="flex min-w-[320px] flex-col gap-2">
                  {events.length === 0 && <div className="text-xs text-ink-faint">لا توجد لقاءات مجدولة</div>}
                  {[...events]
                    .sort((a, b) => a.date.getTime() - b.date.getTime())
                    .map((ev) => (
                      <button
                        key={ev.meeting.id}
                        onClick={() => setSelectedEvent(ev.meeting)}
                        className="flex items-center gap-3 rounded-lg bg-surface-alt px-3.5 py-2.5 text-right hover:bg-surface"
                      >
                        <span className="h-2.5 w-2.5 flex-none rounded-full bg-indigo" />
                        <span className="w-32 flex-none text-[11px] text-ink-faint">
                          {ev.date.toLocaleDateString('ar-SA')} · {ev.date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="flex-1 text-xs font-bold text-ink">{ev.meeting.title}</span>
                        <span className="text-[11px] text-ink-faint">{ev.meeting.classEntity.name}</span>
                      </button>
                    ))}
                </div>
              )}
            </>
          )}
        </Card>

        <Card className="flex flex-col gap-3.5">
          <span className="text-sm font-extrabold text-ink">جدولة لقاء جديد</span>
          {confirmed && (
            <div className="rounded-xl bg-success-bg px-3.5 py-2.5 text-xs font-semibold text-success">
              تم جدولة اللقاء بنجاح ✓
            </div>
          )}
          <Field label="العنوان">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:border-indigo focus:bg-white focus:outline-none"
              placeholder="عنوان اللقاء"
            />
          </Field>
          <Field label="الفصل">
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
          <div className="grid grid-cols-2 gap-3">
            <Field label="التاريخ">
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl border border-line bg-surface px-3 py-3 text-sm focus:outline-none" />
            </Field>
            <Field label="الوقت">
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="rounded-xl border border-line bg-surface px-3 py-3 text-sm focus:outline-none" />
            </Field>
          </div>
          <Field label="المدة (دقيقة)">
            <input value={duration} onChange={(e) => setDuration(Number(e.target.value))} type="number" className="rounded-xl border border-line bg-surface px-3 py-3 text-sm focus:outline-none" />
          </Field>
          <Button size="sm" className="mt-1" disabled={!title || !classId || !date} onClick={scheduleMeeting}>جدولة اللقاء</Button>
        </Card>
      </div>

      <Modal open={selectedEvent !== null} onClose={() => setSelectedEvent(null)} width={420}>
        {selectedEvent && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-sans text-lg font-extrabold text-navy">{selectedEvent.title}</span>
              <button onClick={() => setSelectedEvent(null)} className="text-xl text-ink-faint">✕</button>
            </div>
            <div className="text-xs text-ink-faint">
              {selectedEvent.classEntity.teacher?.name ?? 'بدون مدرب'} · {new Date(selectedEvent.scheduledAt).toLocaleString('ar-SA')}
            </div>
            <div className="flex gap-2.5">
              <Button variant="secondary" size="sm" onClick={() => setSelectedEvent(null)}>إغلاق</Button>
              <Button
                size="sm"
                onClick={() =>
                  navigate(user?.role === 'teacher' ? '/teacher/live-session' : user?.role === 'school_admin' ? '/school/live-session' : '/live-session', {
                    state: {
                      meetingId: selectedEvent.id,
                      title: selectedEvent.title,
                      trainer: selectedEvent.classEntity.teacher?.name,
                      className: selectedEvent.classEntity.name,
                    },
                  })
                }
              >
                الانضمام إلى اللقاء
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
