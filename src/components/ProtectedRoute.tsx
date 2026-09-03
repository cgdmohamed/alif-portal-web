import { Navigate, Outlet } from 'react-router-dom'
import { useAuth, type UserRole } from '../context/AuthContext'

export default function ProtectedRoute({ allow }: { allow: UserRole[] }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-sm text-ink-faint">جارٍ التحميل...</div>
  }
  if (!user) return <Navigate to="/login" replace />
  if (!allow.includes(user.role)) return <Navigate to="/login" replace />

  return <Outlet />
}
