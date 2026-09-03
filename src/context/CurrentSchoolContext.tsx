import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { schoolsApi, statusLabel, type School } from '../lib/schoolsApi'

interface CurrentSchoolContextValue {
  school: School | null
  loading: boolean
  error: string | null
  refresh: () => void
}

const CurrentSchoolContext = createContext<CurrentSchoolContextValue | null>(null)

export function CurrentSchoolProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [school, setSchool] = useState<School | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function refresh() {
    if (!user?.schoolId) {
      setLoading(false)
      return
    }
    setLoading(true)
    schoolsApi
      .get(user.schoolId)
      .then(setSchool)
      .catch(() => setError('تعذر تحميل بيانات المدرسة'))
      .finally(() => setLoading(false))
  }

  useEffect(refresh, [user?.schoolId])

  return (
    <CurrentSchoolContext.Provider value={{ school, loading, error, refresh }}>
      {children}
    </CurrentSchoolContext.Provider>
  )
}

export function useCurrentSchool() {
  const ctx = useContext(CurrentSchoolContext)
  if (!ctx) throw new Error('useCurrentSchool must be used within CurrentSchoolProvider')
  return ctx
}

export { statusLabel as schoolStatusLabel }
