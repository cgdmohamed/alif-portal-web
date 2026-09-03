import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { teachersApi, type ApiTeacher } from '../lib/teachersApi'

export interface SchoolTeacherRecord {
  id: string
  name: string
  specialty: string
  email: string
  phone: string
  status: 'نشط' | 'معطل'
  source: 'يدوي' | 'CSV'
}

interface SchoolTeachersContextValue {
  teachers: SchoolTeacherRecord[]
  loading: boolean
  addTeacher: (input: Omit<SchoolTeacherRecord, 'id' | 'source' | 'status'>) => Promise<void>
  addTeachersBulk: (inputs: Omit<SchoolTeacherRecord, 'id' | 'source' | 'status'>[]) => Promise<void>
  toggleStatus: (id: string) => Promise<void>
  removeTeacher: (id: string) => Promise<void>
}

function toRecord(t: ApiTeacher): SchoolTeacherRecord {
  return {
    id: t.id,
    name: t.name,
    specialty: t.specialty,
    email: t.email,
    phone: t.phone,
    status: t.status === 'active' ? 'نشط' : 'معطل',
    source: t.source === 'csv' ? 'CSV' : 'يدوي',
  }
}

const SchoolTeachersContext = createContext<SchoolTeachersContextValue | null>(null)

export function SchoolTeachersProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [teachers, setTeachers] = useState<SchoolTeacherRecord[]>([])
  const [loading, setLoading] = useState(true)

  function load() {
    if (!user?.schoolId) {
      setLoading(false)
      return
    }
    teachersApi
      .listForSchool(user.schoolId)
      .then((rows) => setTeachers(rows.map(toRecord)))
      .finally(() => setLoading(false))
  }

  useEffect(load, [user?.schoolId])

  async function addTeacher(input: Omit<SchoolTeacherRecord, 'id' | 'source' | 'status'>) {
    if (!user?.schoolId) return
    await teachersApi.create(user.schoolId, input)
    load()
  }

  async function addTeachersBulk(inputs: Omit<SchoolTeacherRecord, 'id' | 'source' | 'status'>[]) {
    if (!user?.schoolId) return
    await teachersApi.createBulk(user.schoolId, inputs)
    load()
  }

  async function toggleStatus(id: string) {
    await teachersApi.toggleStatus(id)
    load()
  }

  async function removeTeacher(id: string) {
    await teachersApi.remove(id)
    load()
  }

  return (
    <SchoolTeachersContext.Provider
      value={{ teachers, loading, addTeacher, addTeachersBulk, toggleStatus, removeTeacher }}
    >
      {children}
    </SchoolTeachersContext.Provider>
  )
}

export function useSchoolTeachers() {
  const ctx = useContext(SchoolTeachersContext)
  if (!ctx) throw new Error('useSchoolTeachers must be used within SchoolTeachersProvider')
  return ctx
}
