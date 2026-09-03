import { Outlet } from 'react-router-dom'
import TeacherSidebar from './TeacherSidebar'
import Topbar from './Topbar'
import { useAuth } from '../../context/AuthContext'
import { CurrentTeacherProvider, useCurrentTeacher } from '../../context/CurrentTeacherContext'

function TeacherLayoutInner() {
  const { user } = useAuth()
  const { teacher } = useCurrentTeacher()

  return (
    <div dir="rtl" className="flex h-screen bg-bg">
      <TeacherSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          name={user?.name ?? ''}
          role={teacher?.specialty ?? 'أخصائي موهبة'}
          initials={user?.name?.[0] ?? '؟'}
          settingsPath="/teacher/settings"
        />
        <main className="flex-1 overflow-y-auto p-7">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default function TeacherLayout() {
  return (
    <CurrentTeacherProvider>
      <TeacherLayoutInner />
    </CurrentTeacherProvider>
  )
}
