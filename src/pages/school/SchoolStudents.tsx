import { useState } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import { useCurrentSchool } from '../../context/CurrentSchoolContext'
import { useSchoolStudents } from '../../context/SchoolStudentsContext'
import AddStudentModal from '../../components/AddStudentModal'
import BulkImportStudentsModal from '../../components/BulkImportStudentsModal'

export default function SchoolStudents() {
  const { school } = useCurrentSchool()
  const { students, removeStudent } = useSchoolStudents()
  const [addOpen, setAddOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="طلاب المدرسة"
        subtitle={`${students.length} طالب مسجّل${school ? ` في ${school.name}` : ''}`}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setImportOpen(true)}>استيراد من CSV</Button>
            <Button size="sm" onClick={() => setAddOpen(true)}>+ إضافة طالب</Button>
          </>
        }
      />

      <Card className="flex flex-col gap-2">
        {students.map((s) => (
          <div key={s.id} className="flex items-center gap-3 rounded-lg bg-surface-alt px-3.5 py-2.5">
            <Avatar initials={s.name[0]} size={30} />
            <div className="flex-1">
              <div className="text-xs font-semibold text-ink">{s.name}</div>
              <div className="text-[10px] text-ink-faint">{s.className} · {s.stage}</div>
            </div>
            <Badge tone={s.source === 'CSV' ? 'indigo' : 'neutral'}>{s.source}</Badge>
            <button
              onClick={() => removeStudent(s.id)}
              className="rounded-lg px-2 py-1 text-xs text-danger-light hover:bg-danger-bg-soft"
            >
              حذف
            </button>
          </div>
        ))}
      </Card>

      <AddStudentModal open={addOpen} onClose={() => setAddOpen(false)} />
      <BulkImportStudentsModal open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  )
}
