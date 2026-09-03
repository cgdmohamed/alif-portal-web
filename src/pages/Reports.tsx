import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import StatCard from '../components/ui/StatCard'
import Table, { type Column } from '../components/ui/Table'
import { StudentsIcon, ReportsIcon } from '../components/ui/icons'
import { reportsApi, type ReportsOverview, type StudentSummary } from '../lib/reportsApi'
import { ApiError } from '../lib/api'

const columns: Column<StudentSummary>[] = [
  { header: 'اسم الطالب', render: (s) => <span className="text-xs font-bold text-ink">{s.name}</span> },
  { header: 'الفصل', render: (s) => <span className="text-[11px] text-ink-faint">{s.className ?? '—'}</span> },
  { header: 'الحضور', render: (s) => <span className="text-[11px] text-ink-soft">{s.attendancePercent}%</span> },
  { header: 'المتوسط', render: (s) => <span className="text-[11px] font-bold text-indigo">{s.average}%</span> },
  { header: 'النقاط', render: (s) => <span className="text-[11px] text-ink-faint">{s.points}</span> },
  { header: 'التقرير', render: () => <span className="text-[11px] font-bold text-indigo">عرض ›</span> },
]

export default function Reports() {
  const navigate = useNavigate()
  const [overview, setOverview] = useState<ReportsOverview | null>(null)
  const [students, setStudents] = useState<StudentSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([reportsApi.overview(), reportsApi.studentsTable()])
      .then(([o, s]) => { setOverview(o); setStudents(s) })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'تعذر تحميل التقارير'))
  }, [])

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="التقارير والتحليلات" />
        <div className="rounded-xl bg-danger-bg-soft px-4 py-6 text-center text-sm text-danger-light">{error}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="التقارير والتحليلات" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="متوسط الأداء"
          value={overview ? `${overview.averagePerformance}%` : '—'}
          trend="عبر جميع الواجبات المصححة"
          trendTone="neutral"
          icon={<ReportsIcon className="h-4 w-4 text-indigo" />}
          iconBg="#EEF0FF"
        />
        <StatCard
          label="نسبة الحضور"
          value={overview ? `${overview.averageAttendance}%` : '—'}
          trend="عبر جميع اللقاءات المسجّلة"
          trendTone="neutral"
          icon={<StudentsIcon className="h-4 w-4 text-sky" />}
          iconBg="#EAF6FF"
        />
        <StatCard
          label="الطلاب"
          value={overview ? overview.studentsCount.toLocaleString('ar') : '—'}
          trend="إجمالي الطلاب المسجّلين"
          trendTone="neutral"
          icon={<StudentsIcon className="h-4 w-4 text-indigo-light" />}
          iconBg="#F3EEFF"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="flex flex-col gap-3">
          <span className="text-sm font-bold text-ink">توزيع الأداء</span>
          <svg width="100%" height="140" viewBox="0 0 300 140">
            {[60, 90, 120, 100, 70, 50].map((h, i) => (
              <rect key={i} x={i * 48 + 10} y={140 - h} width={30} height={h} rx={4} fill="#4338F2" opacity={0.4 + i * 0.1} />
            ))}
          </svg>
        </Card>
        <Card className="flex flex-col gap-3">
          <span className="text-sm font-bold text-ink">رادار المهارات</span>
          <svg width="100%" height="140" viewBox="0 0 140 140">
            <polygon points="70,10 120,50 105,110 35,110 20,50" fill="none" stroke="#E2E8F0" />
            <polygon points="70,30 105,55 95,100 45,100 35,55" fill="#4338F2" fillOpacity="0.25" stroke="#4338F2" strokeWidth="2" />
          </svg>
        </Card>
        <Card className="flex flex-col gap-3">
          <span className="text-sm font-bold text-ink">الخط الزمني للتقدم</span>
          <svg width="100%" height="140" viewBox="0 0 300 140" preserveAspectRatio="none">
            <polyline points="0,110 60,100 120,80 180,55 240,65 300,30" fill="none" stroke="#3FA9F5" strokeWidth="3" />
            <polyline points="0,110 60,100 120,80 180,55 240,65 300,30 300,140 0,140" fill="url(#reportsProgressGradient)" stroke="none" />
            <defs>
              <linearGradient id="reportsProgressGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#3FA9F5" stopOpacity="0.2" />
                <stop offset="1" stopColor="#3FA9F5" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </Card>
      </div>

      {students === null ? (
        <div className="rounded-xl bg-surface-alt px-4 py-8 text-center text-sm text-ink-faint">جارٍ التحميل...</div>
      ) : students.length === 0 ? (
        <div className="rounded-xl bg-surface-alt px-4 py-8 text-center text-sm text-ink-faint">لا يوجد طلاب بعد</div>
      ) : (
        <Table
          columns={columns}
          rows={students}
          keyFn={(s) => s.id}
          onRowClick={(s) => navigate(`/reports/student/${s.id}`)}
        />
      )}
    </div>
  )
}
