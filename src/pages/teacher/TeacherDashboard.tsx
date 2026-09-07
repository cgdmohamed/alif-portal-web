import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import ProgressBar from '../../components/ui/ProgressBar'
import { StudentsIcon, ClassesIcon, MeetingsIcon, ReportsIcon, PlayIcon } from '../../components/ui/icons'
import { useAuth } from '../../context/AuthContext'
import { useCurrentTeacher } from '../../context/CurrentTeacherContext'
import { meetingsApi, type ApiMeeting } from '../../lib/meetingsApi'
import { assignmentsApi, type ApiSubmission } from '../../lib/assignmentsApi'
import StartSessionModal from '../../components/StartSessionModal'

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { teacher, classes, loading } = useCurrentTeacher()
  const [startOpen, setStartOpen] = useState(false)
  const [todayMeetings, setTodayMeetings] = useState<ApiMeeting[]>([])
  const [pendingQueue, setPendingQueue] = useState<ApiSubmission[]>([])

  useEffect(() => {
    meetingsApi.list('today').then(setTodayMeetings).catch(() => setTodayMeetings([]))
    assignmentsApi.gradingQueue().then(setPendingQueue).catch(() => setPendingQueue([]))
  }, [])

  const classIds = useMemo(() => new Set(classes.map((c) => c.id)), [classes])
  const myTodayMeetings = todayMeetings.filter((m) => classIds.has(m.classId))
  const myPending = pendingQueue.filter((s) => classIds.has(s.assignment.classId))

  const pendingByAssignment = useMemo(() => {
    const map = new Map<string, { title: string; className: string; count: number }>()
    for (const s of myPending) {
      const cls = classes.find((c) => c.id === s.assignment.classId)
      const key = s.assignment.title
      const existing = map.get(key)
      if (existing) existing.count += 1
      else map.set(key, { title: s.assignment.title, className: cls?.name ?? '—', count: 1 })
    }
    return [...map.values()]
  }, [myPending, classes])

  const totalStudents = classes.reduce((sum, c) => sum + c.studentsCount, 0)

  if (loading) {
    return <div className="rounded-xl bg-surface-alt px-4 py-8 text-center text-sm text-ink-faint">جارٍ التحميل...</div>
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-sans text-2xl font-extrabold text-navy">مرحبًا، {user?.name} ☀</h1>
          <p className="mt-1 text-[13px] text-ink-muted">{teacher?.specialty ?? ''}</p>
        </div>
        <Button size="sm" onClick={() => setStartOpen(true)}>🔴 بدء لقاء مباشر</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="فصولي"
          value={String(classes.length)}
          trend="عرض الفصول"
          trendTone="neutral"
          icon={<ClassesIcon className="h-4 w-4 text-indigo" />}
          iconBg="#EEF0FF"
        />
        <StatCard
          label="إجمالي طلابي"
          value={String(totalStudents)}
          trend={`عبر ${classes.length} فصل`}
          trendTone="neutral"
          icon={<StudentsIcon className="h-4 w-4 text-sky" />}
          iconBg="#EAF6FF"
        />
        <StatCard
          label="لقاءات اليوم"
          value={String(myTodayMeetings.length)}
          trend={myTodayMeetings.length > 0 ? 'انظر القائمة أدناه' : 'لا يوجد لقاء اليوم'}
          trendTone="neutral"
          icon={<MeetingsIcon className="h-4 w-4 text-indigo-light" />}
          iconBg="#F3EEFF"
        />
        <StatCard
          label="بانتظار التصحيح"
          value={String(myPending.length)}
          trend={myPending.length > 0 ? 'يحتاج مراجعة' : 'لا يوجد متأخر'}
          trendTone="neutral"
          icon={<ReportsIcon className="h-4 w-4 text-warning" />}
          iconBg="#FFF1E9"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="flex flex-col gap-3.5">
          <span className="text-base font-extrabold text-ink">لقاءات اليوم</span>
          <div className="flex flex-col gap-3">
            {myTodayMeetings.length === 0 && <div className="text-xs text-ink-faint">لا توجد لقاءات مجدولة اليوم</div>}
            {myTodayMeetings.map((m) => (
              <div key={m.id} className="flex items-center gap-3.5 rounded-lg bg-surface-alt p-3">
                <div className="flex-1">
                  <div className="text-[13px] font-bold text-ink">{m.title}</div>
                  <div className="text-[11px] text-ink-faint">{m.classEntity.name} · {m.classEntity.studentsCount} طالب</div>
                </div>
                <button
                  onClick={() =>
                    navigate('/teacher/live-session', {
                      state: { meetingId: m.id, title: m.title, trainer: user?.name, className: m.classEntity.name, count: m.classEntity.studentsCount },
                    })
                  }
                  className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-lg bg-indigo transition-transform hover:scale-105"
                >
                  <PlayIcon />
                </button>
              </div>
            ))}
          </div>

          <span className="mt-2 text-base font-extrabold text-ink">فصولي</span>
          <div className="flex flex-col gap-2.5">
            {classes.length === 0 && <div className="text-xs text-ink-faint">لا توجد فصول مسندة إليك بعد</div>}
            {classes.map((c) => (
              <div key={c.id} className="flex flex-col gap-2 rounded-lg bg-surface-alt p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink">{c.name}</span>
                  <span className="text-[11px] text-ink-faint">{c.studentsCount} طالب</span>
                </div>
                <ProgressBar value={c.performance} color={c.color} />
                <span className="text-[10px] text-ink-faint">أداء عام الفصل: {c.performance}%</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-extrabold text-ink">واجبات بانتظار التصحيح</span>
              <Badge tone={myPending.length > 0 ? 'warning' : 'success'}>
                {myPending.length > 0 ? `${myPending.length} بانتظار` : 'مكتمل'}
              </Badge>
            </div>
            <div className="flex flex-col gap-2">
              {pendingByAssignment.length === 0 && <div className="text-xs text-ink-faint">لا توجد تقديمات بانتظار التصحيح</div>}
              {pendingByAssignment.map((a) => (
                <div key={a.title} className="rounded-lg bg-surface-alt px-3.5 py-2.5">
                  <div className="text-xs font-bold text-ink">{a.title}</div>
                  <div className="text-[10px] text-ink-faint">{a.className} · {a.count} بانتظار التصحيح</div>
                </div>
              ))}
            </div>
            <Button size="sm" onClick={() => navigate('/grading')}>فتح التصحيح اليدوي</Button>
          </Card>
        </div>
      </div>

      <StartSessionModal open={startOpen} onClose={() => setStartOpen(false)} />
    </div>
  )
}
