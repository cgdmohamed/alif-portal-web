import { Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import SupportSidebar from './SupportSidebar'
import Topbar from './Topbar'

export default function SupportLayout() {
  const { user } = useAuth()
  return (
    <div dir="rtl" className="flex h-screen bg-bg">
      <SupportSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar name={user?.name ?? ''} role="فريق الدعم" initials={user?.name?.[0] ?? '؟'} settingsPath="/support" />
        <main className="flex-1 overflow-y-auto p-7"><Outlet /></main>
      </div>
    </div>
  )
}
