import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import ProgressBar from '../../components/ui/ProgressBar'
import { StudentsIcon, ClassesIcon, TrainersIcon, MeetingsIcon, PlayIcon, ContentIcon, ReportsIcon } from '../../components/ui/icons'
import { useCurrentSchool, schoolStatusLabel } from '../../context/CurrentSchoolContext'
import { useSchoolClasses } from '../../context/SchoolClassesContext'
import { useSchoolStudents } from '../../context/SchoolStudentsContext'
import { useSchoolTeachers } from '../../context/SchoolTeachersContext'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function addDaysIso(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export default function SchoolDashboard() {
  const navigate = useNavigate()
  const { school, loading: schoolLoading } = useCurrentSchool()
  const { classes } = useSchoolClasses()
  const { students } = useSchoolStudents()
  const { teachers } = useSchoolTeachers()
  const unassignedTeachers = teachers.filter((t) => !classes.some((c) => c.trainer === t.name)).length
  const activeTeachers = teachers.filter((t) => t.status === 'نشط').length

  const today = todayIso()
  const weekEnd = addDaysIso(7)

  const allMeetings = useMemo(
    () =>
      classes
        .flatMap((c) =>
          c.meetings.map((m) => ({
            ...m,
            className: c.name,
            trainer: c.trainer,
            studentsCount: c.studentsCount,
          })),
        )
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    [classes],
  )

  const todayMeetings = allMeetings.filter((m) => m.date === today)
  const weekMeetings = allMeetings.filter((m) => m.date >= today && m.date <= weekEnd)
  const upcomingMeetings = allMeetings.filter((m) => m.date >= today).slice(0, 3)
  const displayedMeetings = todayMeetings.length > 0 ? todayMeetings : upcomingMeetings

  const classesWithPerformance = classes.filter((c) => c.performance > 0)
  const avgPerformance =
    classesWithPerformance.length > 0
      ? Math.round(classesWithPerformance.reduce((sum, c) => sum + c.performance, 0) / classesWithPerformance.length)
      : null

  const schoolPackage = school?.package ?? null
  const packageUsagePct = schoolPackage ? Math.round((students.length / schoolPackage.maxStudents) * 100) : 0

  const activityItems = [
    students.filter((s) => s.source === 'CSV').length > 0 &&
      `تم استيراد ${students.filter((s) => s.source === 'CSV').length} طالبًا عبر ملف CSV`,
    teachers.filter((t) => t.source === 'CSV').length > 0 &&
      `تم استيراد ${teachers.filter((t) => t.source === 'CSV').length} معلمًا عبر ملف CSV`,
    classes.filter((c) => c.resourceId).length > 0 &&
      `تم توليد ${classes.filter((c) => c.resourceId).length} فصل من مكتبة موارد ألف`,
    (school?.approvals.length ?? 0) > 0 &&
      `${school?.approvals.length} طلب موافقة من أولياء الأمور بانتظار المراجعة`,
  ].filter((x): x is string => Boolean(x))

  if (schoolLoading || !school) {
    return <div className="rounded-xl bg-surface-alt px-4 py-8 text-center text-sm text-ink-faint">جارٍ التحميل...</div>
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-sans text-2xl font-extrabold text-navy">
            صباح الخير، {school.principal} ☀
          </h1>
          <p className="mt-1 text-[13px] text-ink-muted">{school.name} · {school.city}</p>
        </div>
        <Badge tone={schoolStatusLabel[school.status].tone}>{schoolStatusLabel[school.status].label}</Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="إجمالي الطلاب"
          value={String(students.length)}
          trend={`${students.filter((s) => s.source === 'CSV').length} عبر استيراد CSV`}
          trendTone="neutral"
          icon={<StudentsIcon className="h-4 w-4 text-indigo" />}
          iconBg="#EEF0FF"
        />
        <StatCard
          label="الفصول النشطة"
          value={String(classes.length)}
          trend={`${classes.filter((c) => c.resourceId).length} مولّدة من موارد ألف`}
          trendTone="neutral"
          icon={<ClassesIcon className="h-4 w-4 text-sky" />}
          iconBg="#EAF6FF"
        />
        <StatCard
          label="المعلمون"
          value={String(teachers.length)}
          trend={unassignedTeachers > 0 ? `${unassignedTeachers} بانتظار تعيين فصل` : 'الجميع مسند لفصول'}
          trendTone="neutral"
          icon={<TrainersIcon className="h-4 w-4 text-indigo-light" />}
          iconBg="#F3EEFF"
        />
        <StatCard
          label="لقاءات هذا الأسبوع"
          value={String(weekMeetings.length)}
          trend={todayMeetings.length > 0 ? `${todayMeetings.length} اليوم` : 'لا يوجد لقاء اليوم'}
          trendTone="neutral"
          icon={<MeetingsIcon className="h-4 w-4 text-warning" />}
          iconBg="#FFF1E9"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="متوسط أداء الفصول"
          value={avgPerformance !== null ? `${avgPerformance}%` : '—'}
          trend={
            classes.length - classesWithPerformance.length > 0
              ? `${classes.length - classesWithPerformance.length} فصل بلا بيانات بعد`
              : 'جميع الفصول لديها بيانات'
          }
          trendTone="neutral"
          icon={<ReportsIcon className="h-4 w-4 text-indigo" />}
          iconBg="#EEF0FF"
        />
        <StatCard
          label="المعلمون النشطون"
          value={`${activeTeachers}/${teachers.length}`}
          trend={teachers.length - activeTeachers > 0 ? `${teachers.length - activeTeachers} معطّل` : 'الجميع نشط'}
          trendTone="neutral"
          icon={<TrainersIcon className="h-4 w-4 text-sky" />}
          iconBg="#EAF6FF"
        />
        <StatCard
          label="استخدام سعة الباقة"
          value={`${packageUsagePct}%`}
          trend={packageUsagePct >= 90 ? 'قارب على الامتلاء' : 'ضمن الحد الآمن'}
          trendTone="neutral"
          icon={<SchoolCapacityIcon />}
          iconBg="#F3EEFF"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <span className="text-base font-extrabold text-ink">
              {todayMeetings.length > 0 ? 'لقاءات اليوم' : 'أقرب اللقاءات القادمة'}
            </span>
            <Button variant="secondary" size="sm" onClick={() => navigate('/school/classes')}>
              + جدولة لقاء
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            {displayedMeetings.length === 0 ? (
              <div className="rounded-lg bg-surface-alt px-4 py-6 text-center text-xs text-ink-faint">
                لا توجد لقاءات مجدولة حاليًا — جدولة لقاء من صفحة الفصول
              </div>
            ) : (
              displayedMeetings.map((m) => (
                <div key={m.id} className="flex items-center gap-3.5 rounded-lg bg-surface-alt p-3">
                  <div className="w-16 flex-none text-center">
                    <div className="font-sans text-[13px] font-extrabold text-indigo">{m.date}</div>
                    <div className="text-[10px] text-ink-faint">{m.time}</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] font-bold text-ink">{m.title}</div>
                    <div className="text-[11px] text-ink-faint">
                      {m.trainer} · {m.className} · {m.studentsCount} طالب
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      navigate('/live-session', {
                        state: { title: m.title, trainer: m.trainer, className: m.className, count: m.studentsCount },
                      })
                    }
                    className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-lg bg-indigo transition-transform hover:scale-105"
                  >
                    <PlayIcon />
                  </button>
                </div>
              ))
            )}
          </div>

          {classesWithPerformance.length > 0 && (
            <>
              <span className="mt-2 text-base font-extrabold text-ink">أداء الفصول</span>
              <svg width="100%" height="120" viewBox={`0 0 ${classesWithPerformance.length * 90} 120`} preserveAspectRatio="none">
                {classesWithPerformance.map((c, i) => (
                  <g key={c.id}>
                    <rect
                      x={i * 90 + 15}
                      y={110 - c.performance}
                      width={50}
                      height={c.performance}
                      rx={6}
                      fill={c.color}
                      opacity={0.85}
                    />
                    <text x={i * 90 + 40} y={108 - c.performance} textAnchor="middle" fontSize="11" fontWeight="700" fill="#14123F">
                      {c.performance}%
                    </text>
                  </g>
                ))}
              </svg>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-ink-faint">
                {classesWithPerformance.map((c) => (
                  <span key={c.id} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-sm" style={{ background: c.color }} />
                    {c.name}
                  </span>
                ))}
              </div>
            </>
          )}

          <span className="mt-2 text-base font-extrabold text-ink">نشاط حديث</span>
          <div className="flex flex-col gap-2 text-[11px] text-ink-soft">
            {activityItems.length === 0 ? (
              <div>لا يوجد نشاط حديث يُذكر</div>
            ) : (
              activityItems.map((item) => <div key={item}>• {item}</div>)
            )}
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-extrabold text-ink">الباقة والاشتراك</span>
              <Badge tone={schoolStatusLabel[school.status].tone}>{schoolStatusLabel[school.status].label}</Badge>
            </div>
            {schoolPackage && (
              <>
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-11 w-11 flex-none items-center justify-center rounded-xl font-sans text-sm font-extrabold text-white"
                    style={{ background: schoolPackage.color }}
                  >
                    {schoolPackage.name[0]}
                  </span>
                  <div>
                    <div className="text-sm font-bold text-ink">{schoolPackage.name}</div>
                    <div className="text-[11px] text-ink-faint">
                      {schoolPackage.price === 0 ? 'مجانية' : `${schoolPackage.price.toLocaleString('ar')} ريال`} · {schoolPackage.cycle}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-[11px] text-ink-faint">
                    <span>الطلاب</span><span>{students.length} / {schoolPackage.maxStudents}</span>
                  </div>
                  <ProgressBar value={packageUsagePct} color={schoolPackage.color} />
                </div>
              </>
            )}
            <Button size="sm" onClick={() => navigate('/school/package')}>عرض تفاصيل الباقة</Button>
          </Card>

          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-extrabold text-ink">مكتبة موارد ألف</span>
              <ContentIcon className="h-4 w-4 text-indigo" />
            </div>
            <Button variant="secondary" size="sm" onClick={() => navigate('/school/resources')}>
              تصفّح المكتبة وتوليد فصل
            </Button>
          </Card>

          <Card className="flex flex-col gap-2.5">
            <span className="text-sm font-extrabold text-ink">موافقات أولياء الأمور</span>
            {school.approvals.length === 0 ? (
              <div className="text-xs text-ink-faint">لا توجد طلبات معلّقة</div>
            ) : (
              school.approvals.map((a) => (
                <div key={a.id} className="rounded-lg bg-surface-alt px-3.5 py-2.5">
                  <div className="text-xs font-bold text-ink">{a.parentName} — {a.studentName}</div>
                  <div className="text-[10px] text-ink-faint">{a.note}</div>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

function SchoolCapacityIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#807FF9" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 15h18" />
    </svg>
  )
}
