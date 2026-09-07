import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import ProgressBar from '../../components/ui/ProgressBar'
import { useAuth } from '../../context/AuthContext'
import { useCurrentTeacher } from '../../context/CurrentTeacherContext'
import { meetingsApi } from '../../lib/meetingsApi'

export default function TeacherClasses() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { classes, loading } = useCurrentTeacher()

  async function startNow(classId: string, name: string, studentsCount: number) {
    const meeting = await meetingsApi.create({
      classId,
      title: `لقاء مباشر — ${name}`,
      scheduledAt: new Date().toISOString(),
      durationMinutes: 60,
    })
    navigate('/teacher/live-session', {
      state: {
        meetingId: meeting.id,
        title: meeting.title,
        trainer: user?.name,
        className: name,
        count: studentsCount,
      },
    })
  }

  if (loading) {
    return <div className="rounded-xl bg-surface-alt px-4 py-8 text-center text-sm text-ink-faint">جارٍ التحميل...</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="فصولي" subtitle={`${classes.length} فصل مسند إليك حاليًا`} />

      {classes.length === 0 ? (
        <div className="rounded-xl bg-surface-alt px-4 py-8 text-center text-sm text-ink-faint">لا توجد فصول مسندة إليك بعد</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {classes.map((c) => (
            <Card key={c.id} className="flex flex-col gap-2.5">
              <span className="text-sm font-bold text-ink">{c.name}</span>
              <div className="flex justify-between text-[11px] text-ink-muted">
                <span>{c.studentsCount} طالب</span>
                <span>{c.resource ? `برنامج: ${c.resource.name}` : 'بدون برنامج مرتبط'}</span>
              </div>
              <ProgressBar value={c.performance} color={c.color} />
              <div className="text-[10px] text-ink-faint">أداء عام الفصل: {c.performance}%</div>
              <Button size="sm" className="mt-1" onClick={() => startNow(c.id, c.name, c.studentsCount)}>
                🔴 بدء لقاء مباشر
              </Button>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => navigate('/calendar')}>
                  جدولة لقاء
                </Button>
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => navigate('/grading')}>
                  تصحيح الواجبات
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
