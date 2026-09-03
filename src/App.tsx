import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import SchoolLayout from './components/layout/SchoolLayout'
import TeacherLayout from './components/layout/TeacherLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import UsersRoles from './pages/UsersRoles'
import Schools from './pages/Schools'
import Packages from './pages/Packages'
import Classes from './pages/Classes'
import CatalogManagement from './pages/CatalogManagement'
import QuestionBank from './pages/QuestionBank'
import ContentLibrary from './pages/ContentLibrary'
import CalendarPage from './pages/CalendarPage'
import LiveSession from './pages/LiveSession'
import Recordings from './pages/Recordings'
import MarketingClip from './pages/MarketingClip'
import Assignments from './pages/Assignments'
import Grading from './pages/Grading'
import Reports from './pages/Reports'
import StudentReport from './pages/StudentReport'
import AutoMessages from './pages/AutoMessages'
import SupportChat from './pages/SupportChat'
import Settings from './pages/Settings'
import ActivityLog from './pages/ActivityLog'
import NotFound from './pages/NotFound'
import SchoolDashboard from './pages/school/SchoolDashboard'
import SchoolResources from './pages/school/SchoolResources'
import SchoolClasses from './pages/school/SchoolClasses'
import SchoolTeachers from './pages/school/SchoolTeachers'
import SchoolStudents from './pages/school/SchoolStudents'
import SchoolEnrollmentCodes from './pages/school/SchoolEnrollmentCodes'
import SchoolPackage from './pages/school/SchoolPackage'
import SchoolSettings from './pages/school/SchoolSettings'
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import TeacherClasses from './pages/teacher/TeacherClasses'
import TeacherSettings from './pages/teacher/TeacherSettings'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute allow={['platform_admin']} />}>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<UsersRoles />} />
        <Route path="/schools" element={<Schools />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/catalog" element={<CatalogManagement />} />
        <Route path="/question-bank" element={<QuestionBank />} />
        <Route path="/content-library" element={<ContentLibrary />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/live-session" element={<LiveSession />} />
        <Route path="/recordings" element={<Recordings />} />
        <Route path="/marketing-clip" element={<MarketingClip />} />
        <Route path="/assignments" element={<Assignments />} />
        <Route path="/grading" element={<Grading />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/student/:id" element={<StudentReport />} />
        <Route path="/messages" element={<AutoMessages />} />
        <Route path="/support" element={<SupportChat />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/activity-log" element={<ActivityLog />} />
      </Route>
      </Route>

      <Route element={<ProtectedRoute allow={['school_admin']} />}>
      <Route element={<SchoolLayout />}>
        <Route path="/school/dashboard" element={<SchoolDashboard />} />
        <Route path="/school/resources" element={<SchoolResources />} />
        <Route path="/school/classes" element={<SchoolClasses />} />
        <Route path="/school/teachers" element={<SchoolTeachers />} />
        <Route path="/school/students" element={<SchoolStudents />} />
        <Route path="/school/enrollment-codes" element={<SchoolEnrollmentCodes />} />
        <Route path="/school/package" element={<SchoolPackage />} />
        <Route path="/school/settings" element={<SchoolSettings />} />
      </Route>
      </Route>

      <Route element={<ProtectedRoute allow={['teacher']} />}>
      <Route element={<TeacherLayout />}>
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/classes" element={<TeacherClasses />} />
        <Route path="/teacher/settings" element={<TeacherSettings />} />
      </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
