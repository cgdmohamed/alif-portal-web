import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { teachersApi, type ApiTeacher } from '../lib/teachersApi'
import { type ApiClass } from '../lib/classesApi'

interface CurrentTeacherContextValue {
  teacher: ApiTeacher | null
  classes: ApiClass[]
  loading: boolean
  refresh: () => void
}

const CurrentTeacherContext = createContext<CurrentTeacherContextValue | null>(null)

export function CurrentTeacherProvider({ children }: { children: ReactNode }) {
  const [teacher, setTeacher] = useState<ApiTeacher | null>(null)
  const [classes, setClasses] = useState<ApiClass[]>([])
  const [loading, setLoading] = useState(true)

  function refresh() {
    setLoading(true)
    Promise.all([teachersApi.me(), teachersApi.myClasses()])
      .then(([t, c]) => {
        setTeacher(t)
        setClasses(c)
      })
      .finally(() => setLoading(false))
  }

  useEffect(refresh, [])

  return (
    <CurrentTeacherContext.Provider value={{ teacher, classes, loading, refresh }}>
      {children}
    </CurrentTeacherContext.Provider>
  )
}

export function useCurrentTeacher() {
  const ctx = useContext(CurrentTeacherContext)
  if (!ctx) throw new Error('useCurrentTeacher must be used within CurrentTeacherProvider')
  return ctx
}
