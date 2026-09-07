import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { classesApi, type ApiClass, type ClassStatus as ApiClassStatus } from '../lib/classesApi'

export interface ClassMeeting {
  id: string
  title: string
  date: string
  time: string
}

export type ClassStatus = 'قيد الإعداد' | 'نشط' | 'مكتمل' | 'ملغى'

const statusToArabic: Record<ApiClassStatus, ClassStatus> = {
  preparing: 'قيد الإعداد',
  active: 'نشط',
  completed: 'مكتمل',
  cancelled: 'ملغى',
}

export interface GeneratedClass {
  id: string
  name: string
  resourceId: string | null
  resourceName: string | null
  resourceVersionAtGeneration: number | null
  trainer: string
  studentsCount: number
  color: string
  meetings: ClassMeeting[]
  performance: number
  status: ClassStatus
  autoAgora: boolean
}

interface SchoolClassesContextValue {
  classes: GeneratedClass[]
  loading: boolean
  addClass: (
    input: Omit<GeneratedClass, 'id' | 'meetings' | 'status'> & { teacherId?: string | null },
    initialMeetings?: { title: string; date: string; time: string }[],
  ) => Promise<void>
  addMeeting: (classId: string, meeting: { title: string; date: string; time: string }) => Promise<void>
}

function toGeneratedClass(c: ApiClass): GeneratedClass {
  return {
    id: c.id,
    name: c.name,
    resourceId: c.resourceId,
    resourceName: c.resource?.name ?? null,
    resourceVersionAtGeneration: c.resourceVersionAtGeneration,
    trainer: c.teacher?.name ?? '— بحاجة لتعيين لاحقًا —',
    studentsCount: c.studentsCount,
    color: c.color,
    meetings: c.meetings ?? [],
    performance: c.performance,
    status: statusToArabic[c.status],
    autoAgora: c.autoAgora,
  }
}

const SchoolClassesContext = createContext<SchoolClassesContextValue | null>(null)

export function SchoolClassesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [classes, setClasses] = useState<GeneratedClass[]>([])
  const [loading, setLoading] = useState(true)

  function load() {
    if (!user?.schoolId) {
      setLoading(false)
      return
    }
    classesApi
      .listForSchool(user.schoolId)
      .then((rows) => setClasses(rows.map(toGeneratedClass)))
      .finally(() => setLoading(false))
  }

  useEffect(load, [user?.schoolId])

  async function addClass(
    input: Omit<GeneratedClass, 'id' | 'meetings' | 'status'> & { teacherId?: string | null },
    initialMeetings?: { title: string; date: string; time: string }[],
  ) {
    if (!user?.schoolId) return
    const created = await classesApi.create(user.schoolId, {
      name: input.name,
      resourceId: input.resourceId ?? undefined,
      teacherId: input.teacherId ?? undefined,
      color: input.color,
      autoAgora: input.autoAgora,
    })
    // initialMeetings are scheduled as separate meeting requests once the class exists.
    for (const m of initialMeetings ?? []) {
      await classesApi.addMeeting(created.id, m)
    }
    load()
  }

  async function addMeeting(classId: string, meeting: { title: string; date: string; time: string }) {
    await classesApi.addMeeting(classId, meeting)
    load()
  }

  return (
    <SchoolClassesContext.Provider value={{ classes, loading, addClass, addMeeting }}>
      {children}
    </SchoolClassesContext.Provider>
  )
}

export function useSchoolClasses() {
  const ctx = useContext(SchoolClassesContext)
  if (!ctx) throw new Error('useSchoolClasses must be used within SchoolClassesProvider')
  return ctx
}
