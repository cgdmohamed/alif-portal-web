import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { enrollmentCodesApi, type ApiEnrollmentCode } from '../lib/enrollmentCodesApi'

export type EnrollmentCode = ApiEnrollmentCode

interface SchoolEnrollmentCodesContextValue {
  codes: EnrollmentCode[]
  loading: boolean
  addCode: (input: {
    classId: string
    codeType: EnrollmentCode['codeType']
    maxUses: number
    expiresAt: string
  }) => Promise<EnrollmentCode>
  disableCode: (id: string) => Promise<void>
}

const SchoolEnrollmentCodesContext = createContext<SchoolEnrollmentCodesContextValue | null>(null)

export function SchoolEnrollmentCodesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [codes, setCodes] = useState<EnrollmentCode[]>([])
  const [loading, setLoading] = useState(true)

  function load() {
    if (!user?.schoolId) {
      setLoading(false)
      return
    }
    enrollmentCodesApi
      .listForSchool(user.schoolId)
      .then(setCodes)
      .finally(() => setLoading(false))
  }

  useEffect(load, [user?.schoolId])

  async function addCode(input: {
    classId: string
    codeType: EnrollmentCode['codeType']
    maxUses: number
    expiresAt: string
  }) {
    if (!user?.schoolId) throw new Error('No school context')
    const created = await enrollmentCodesApi.create(user.schoolId, input)
    load()
    return created
  }

  async function disableCode(id: string) {
    await enrollmentCodesApi.disable(id)
    load()
  }

  return (
    <SchoolEnrollmentCodesContext.Provider value={{ codes, loading, addCode, disableCode }}>
      {children}
    </SchoolEnrollmentCodesContext.Provider>
  )
}

export function useSchoolEnrollmentCodes() {
  const ctx = useContext(SchoolEnrollmentCodesContext)
  if (!ctx) throw new Error('useSchoolEnrollmentCodes must be used within SchoolEnrollmentCodesProvider')
  return ctx
}
