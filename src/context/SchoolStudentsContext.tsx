import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { studentsApi, type ApiStudentWithClass } from '../lib/studentsApi'

export interface SchoolStudentRecord {
  id: string
  name: string
  stage: string
  className: string
  parentName: string
  parentEmail: string
  studentEmail: string
  source: 'يدوي' | 'CSV'
}

interface SchoolStudentsContextValue {
  students: SchoolStudentRecord[]
  loading: boolean
  addStudent: (input: Omit<SchoolStudentRecord, 'id' | 'source'>) => Promise<void>
  addStudentsBulk: (inputs: Omit<SchoolStudentRecord, 'id' | 'source'>[]) => Promise<void>
  removeStudent: (id: string) => Promise<void>
}

function toRecord(s: ApiStudentWithClass): SchoolStudentRecord {
  return {
    id: s.id,
    name: s.name,
    stage: s.stage,
    className: s.className ?? '—',
    parentName: s.parentName,
    parentEmail: s.parentEmail,
    studentEmail: s.studentEmail,
    source: s.source === 'csv' ? 'CSV' : 'يدوي',
  }
}

const SchoolStudentsContext = createContext<SchoolStudentsContextValue | null>(null)

export function SchoolStudentsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [students, setStudents] = useState<SchoolStudentRecord[]>([])
  const [loading, setLoading] = useState(true)

  function load() {
    if (!user?.schoolId) {
      setLoading(false)
      return
    }
    studentsApi
      .listForSchool(user.schoolId)
      .then((rows) => setStudents(rows.map(toRecord)))
      .finally(() => setLoading(false))
  }

  useEffect(load, [user?.schoolId])

  async function addStudent(input: Omit<SchoolStudentRecord, 'id' | 'source'>) {
    if (!user?.schoolId) return
    await studentsApi.create(user.schoolId, {
      name: input.name,
      stage: input.stage,
      className: input.className,
      parentName: input.parentName,
      parentEmail: input.parentEmail,
      studentEmail: input.studentEmail,
    })
    load()
  }

  async function addStudentsBulk(inputs: Omit<SchoolStudentRecord, 'id' | 'source'>[]) {
    if (!user?.schoolId) return
    await studentsApi.createBulk(
      user.schoolId,
      inputs.map((i) => ({
        name: i.name,
        stage: i.stage,
        className: i.className,
        parentName: i.parentName,
        parentEmail: i.parentEmail,
        studentEmail: i.studentEmail,
      })),
    )
    load()
  }

  async function removeStudent(id: string) {
    await studentsApi.remove(id)
    load()
  }

  return (
    <SchoolStudentsContext.Provider value={{ students, loading, addStudent, addStudentsBulk, removeStudent }}>
      {children}
    </SchoolStudentsContext.Provider>
  )
}

export function useSchoolStudents() {
  const ctx = useContext(SchoolStudentsContext)
  if (!ctx) throw new Error('useSchoolStudents must be used within SchoolStudentsProvider')
  return ctx
}
