import { Outlet } from 'react-router-dom'
import SchoolSidebar from './SchoolSidebar'
import Topbar from './Topbar'
import { useAuth } from '../../context/AuthContext'
import { CurrentSchoolProvider } from '../../context/CurrentSchoolContext'
import { SchoolClassesProvider } from '../../context/SchoolClassesContext'
import { SchoolStudentsProvider } from '../../context/SchoolStudentsContext'
import { SchoolTeachersProvider } from '../../context/SchoolTeachersContext'
import { SchoolEnrollmentCodesProvider } from '../../context/SchoolEnrollmentCodesContext'

export default function SchoolLayout() {
  const { user } = useAuth()

  return (
    <CurrentSchoolProvider>
      <SchoolClassesProvider>
        <SchoolStudentsProvider>
          <SchoolTeachersProvider>
            <SchoolEnrollmentCodesProvider>
              <div dir="rtl" className="flex h-screen bg-bg">
                <SchoolSidebar />
                <div className="flex min-w-0 flex-1 flex-col">
                  <Topbar
                    name={user?.name ?? ''}
                    role="مدير المدرسة"
                    initials={user?.name?.[0] ?? '؟'}
                    settingsPath="/school/settings"
                  />
                  <main className="flex-1 overflow-y-auto p-7">
                    <Outlet />
                  </main>
                </div>
              </div>
            </SchoolEnrollmentCodesProvider>
          </SchoolTeachersProvider>
        </SchoolStudentsProvider>
      </SchoolClassesProvider>
    </CurrentSchoolProvider>
  )
}
