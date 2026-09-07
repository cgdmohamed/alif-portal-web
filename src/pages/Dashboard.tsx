import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import StatCard from '../components/ui/StatCard'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Switch from '../components/ui/Switch'
import { StudentsIcon, SchoolsIcon, MeetingsIcon, PlayIcon } from '../components/ui/icons'
import { useAuth } from '../context/AuthContext'
import {
  dashboardApi,
  type ReportsOverview,
  type DashboardMeeting,
  type StudentSummary,
  type ActivityLogEntry,
} from '../lib/dashboardApi'

const widgetLabels: Record<string, string> = {
  weeklyActivity: 'نشاط الطلاب الأسبوعي',
  programDistribution: 'توزيع الطلاب حسب البرنامج',
  todayMeetings: 'لقاءات اليوم',
  topStudents: 'أفضل الطلاب هذا الشهر',
  recentActivity: 'نشاط حديث',
}

const leaderColors = ['#F59E0B', '#8B89B8', '#C08A45']
const leaderGradients = ['from-indigo to-indigo-light', 'from-sky to-indigo-light', 'from-indigo-light to-indigo']

function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'الآن'
  if (minutes < 60) return `قبل ${minutes} دقيقة`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `قبل ${hours} ساعة`
  return `قبل ${Math.floor(hours / 24)} يوم`
}

function formatMeetingTime(iso: string) {
  const date = new Date(iso)
  const hours = date.getHours()
  const displayHour = hours % 12 === 0 ? 12 : hours % 12
  return { time: `${displayHour}:${String(date.getMinutes()).padStart(2, '0')}`, period: hours >= 12 ? 'مساءً' : 'صباحًا' }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [widgets, setWidgets] = useState({
    weeklyActivity: true,
    programDistribution: true,
    todayMeetings: true,
    topStudents: true,
    recentActivity: true,
  })

  const [overview, setOverview] = useState<ReportsOverview | null>(null)
  const [schoolsCount, setSchoolsCount] = useState<number | null>(null)
  const [meetings, setMeetings] = useState<DashboardMeeting[] | null>(null)
  const [topStudents, setTopStudents] = useState<StudentSummary[] | null>(null)
  const [activity, setActivity] = useState<ActivityLogEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      dashboardApi.overview(),
      dashboardApi.schoolsCount(),
      dashboardApi.todayMeetings(),
      dashboardApi.topStudents(),
      dashboardApi.activityLog(),
    ])
      .then(([o, sc, m, ts, a]) => {
        setOverview(o)
        setSchoolsCount(sc)
        setMeetings(m)
        setTopStudents(ts)
        setActivity(a)
      })
      .catch(() => setError('تعذر تحميل بيانات لوحة التحكم'))
  }, [])

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-sans text-2xl font-extrabold text-navy">
            مرحبًا{user ? `، ${user.name}` : ''} ☀
          </h1>
          <p className="mt-1 text-[13px] text-ink-muted">
            {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setCustomizeOpen(true)}>
          + تخصيص الويدجتس
        </Button>
      </div>

      {error && <Card className="text-center text-sm text-danger-light">{error}</Card>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="إجمالي الطلاب"
          value={overview ? overview.studentsCount.toLocaleString('ar') : '—'}
          trend="عدد الطلاب المسجّلين حاليًا"
          trendTone="neutral"
          icon={<StudentsIcon className="h-4 w-4 text-indigo" />}
          iconBg="#EEF0FF"
        />
        <StatCard
          label="المدارس المشتركة"
          value={schoolsCount !== null ? schoolsCount.toLocaleString('ar') : '—'}
          trend="مدرسة مشتركة في المنصة"
          trendTone="neutral"
          icon={<SchoolsIcon className="h-4 w-4 text-sky" />}
          iconBg="#EAF6FF"
        />
        <StatCard
          label="لقاءات اليوم"
          value={meetings ? meetings.length.toLocaleString('ar') : '—'}
          trend="لقاء مجدول اليوم"
          trendTone="neutral"
          icon={<MeetingsIcon className="h-4 w-4 text-indigo-light" />}
          iconBg="#F3EEFF"
        />
        <StatCard
          label="متوسط الأداء"
          value={overview ? `${overview.averagePerformance}%` : '—'}
          trend={overview ? `${overview.gradedAssignmentsCount} واجب مُقيّم` : ''}
          trendTone="neutral"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF9F4A" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          }
          iconBg="#FFF1E9"
        />
      </div>

      {(widgets.weeklyActivity || widgets.programDistribution) && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
          {widgets.weeklyActivity && (
            <Card className="flex flex-col gap-3.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-ink">نشاط الطلاب الأسبوعي</span>
                <span className="text-[11px] text-ink-faint">آخر 7 أيام</span>
              </div>
              <svg width="100%" height="130" viewBox="0 0 600 130" preserveAspectRatio="none">
                <polyline
                  points="0,90 90,70 180,80 270,40 360,55 450,20 540,35"
                  fill="none"
                  stroke="#4338F2"
                  strokeWidth="3"
                />
                <polyline
                  points="0,90 90,70 180,80 270,40 360,55 450,20 540,35 540,130 0,130"
                  fill="url(#dashboardGradient)"
                  stroke="none"
                />
                <defs>
                  <linearGradient id="dashboardGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#4338F2" stopOpacity="0.18" />
                    <stop offset="1" stopColor="#4338F2" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="flex justify-between text-[11px] text-ink-faint">
                {['سبت', 'أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'].map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
            </Card>
          )}

          {widgets.programDistribution && (
            <Card className="flex flex-col gap-3">
              <span className="text-sm font-bold text-ink">توزيع الطلاب حسب البرنامج</span>
              <div className="flex items-center gap-4">
                <svg width="110" height="110" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E2E8F0" strokeWidth="4" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none" stroke="#4338F2" strokeWidth="4"
                    strokeDasharray="45 55" strokeDashoffset="25"
                  />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none" stroke="#807FF9" strokeWidth="4"
                    strokeDasharray="30 70" strokeDashoffset="-20"
                  />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none" stroke="#3FA9F5" strokeWidth="4"
                    strokeDasharray="25 75" strokeDashoffset="-50"
                  />
                </svg>
                <div className="flex flex-col gap-1.5 text-[11px] text-ink-soft">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-indigo" />
                    موهبة أكاديمية 45%
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-indigo-light" />
                    إبداع وابتكار 30%
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-sky" />
                    قيادة وريادة 25%
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {(widgets.todayMeetings || widgets.topStudents || widgets.recentActivity) && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {widgets.todayMeetings && (
            <Card className="flex flex-col gap-3.5">
              <span className="text-base font-extrabold text-ink">لقاءات اليوم</span>
              <div className="flex flex-col gap-3">
                {meetings === null && <div className="text-xs text-ink-faint">جارٍ التحميل...</div>}
                {meetings?.length === 0 && <div className="text-xs text-ink-faint">لا توجد لقاءات مجدولة اليوم</div>}
                {meetings?.map((m) => {
                  const { time, period } = formatMeetingTime(m.scheduledAt)
                  return (
                    <div key={m.id} className="flex items-center gap-3.5 rounded-lg bg-surface-alt p-3">
                      <div className="w-14 flex-none text-center">
                        <div className="font-sans text-[15px] font-extrabold text-indigo">{time}</div>
                        <div className="text-[10px] text-ink-faint">{period}</div>
                      </div>
                      <div className="flex-1">
                        <div className="text-[13px] font-bold text-ink">{m.title}</div>
                        <div className="text-[11px] text-ink-faint">
                          {m.classEntity.teacher?.name ?? 'بدون مدرب'} · {m.classEntity.studentsCount} طالب
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          navigate('/live-session', {
                            state: {
                              meetingId: m.id,
                              title: m.title,
                              trainer: m.classEntity.teacher?.name,
                              className: m.classEntity.name,
                              count: m.classEntity.studentsCount,
                            },
                          })
                        }
                        className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-lg bg-indigo transition-transform hover:scale-105"
                        title="الانضمام إلى Agora"
                      >
                        <PlayIcon />
                      </button>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {(widgets.topStudents || widgets.recentActivity) && (
            <div className="flex flex-col gap-4">
              {widgets.topStudents && (
                <Card className="flex flex-1 flex-col gap-2.5">
                  <span className="text-base font-extrabold text-ink">أفضل الطلاب هذا الشهر</span>
                  <div className="flex flex-col gap-2.5">
                    {topStudents === null && <div className="text-xs text-ink-faint">جارٍ التحميل...</div>}
                    {topStudents?.length === 0 && <div className="text-xs text-ink-faint">لا توجد بيانات بعد</div>}
                    {topStudents?.map((s, i) => (
                      <div key={s.id} className="flex items-center gap-2.5">
                        <span className="w-4 text-center text-[13px] font-extrabold" style={{ color: leaderColors[i % leaderColors.length] }}>
                          {i + 1}
                        </span>
                        <Avatar initials={s.name[0]} size={30} gradient={leaderGradients[i % leaderGradients.length]} />
                        <span className="flex-1 text-xs font-semibold text-ink">{s.name}</span>
                        <span className="text-xs font-bold text-indigo">{s.points} نقطة</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
              {widgets.recentActivity && (
                <Card className="flex flex-1 flex-col gap-2">
                  <span className="text-base font-extrabold text-ink">نشاط حديث</span>
                  <div className="flex flex-col gap-2 text-[11px] text-ink-soft">
                    {activity === null && <div className="text-ink-faint">جارٍ التحميل...</div>}
                    {activity?.length === 0 && <div className="text-ink-faint">لا يوجد نشاط حديث</div>}
                    {activity?.map((a) => (
                      <div key={a.id}>
                        • {a.action} — {a.target} — {formatRelativeTime(a.createdAt)}
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      <Modal open={customizeOpen} onClose={() => setCustomizeOpen(false)} width={420}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-sans text-lg font-extrabold text-navy">تخصيص الويدجتس</span>
            <button onClick={() => setCustomizeOpen(false)} className="text-xl text-ink-faint">✕</button>
          </div>
          <div className="flex flex-col gap-2">
            {Object.entries(widgetLabels).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between rounded-xl bg-surface-alt px-4 py-3">
                <span className="text-xs text-ink-soft">{label}</span>
                <Switch
                  checked={widgets[key as keyof typeof widgets]}
                  onChange={(v) => setWidgets((w) => ({ ...w, [key]: v }))}
                />
              </div>
            ))}
          </div>
          <Button size="sm" onClick={() => setCustomizeOpen(false)}>تم</Button>
        </div>
      </Modal>
    </div>
  )
}
