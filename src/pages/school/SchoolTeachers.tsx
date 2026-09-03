import { useState } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import { useCurrentSchool } from '../../context/CurrentSchoolContext'
import { useSchoolTeachers } from '../../context/SchoolTeachersContext'
import { useSchoolClasses } from '../../context/SchoolClassesContext'
import AddTeacherModal from '../../components/AddTeacherModal'
import BulkImportTeachersModal from '../../components/BulkImportTeachersModal'

export default function SchoolTeachers() {
  const { school } = useCurrentSchool()
  const { teachers, toggleStatus, removeTeacher } = useSchoolTeachers()
  const { classes } = useSchoolClasses()
  const [addOpen, setAddOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="معلمو المدرسة"
        subtitle={`${teachers.length} معلم${school ? ` في ${school.name}` : ''}`}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setImportOpen(true)}>استيراد من CSV</Button>
            <Button size="sm" onClick={() => setAddOpen(true)}>+ إضافة معلم</Button>
          </>
        }
      />

      <Card className="flex flex-col gap-2">
        {teachers.map((t) => {
          const assignedClasses = classes.filter((c) => c.trainer === t.name)
          return (
            <div key={t.id} className="flex flex-wrap items-center gap-3 rounded-lg bg-surface-alt px-3.5 py-3">
              <Avatar initials={t.name[0]} size={34} />
              <div className="min-w-[160px] flex-1">
                <div className="text-xs font-semibold text-ink">{t.name}</div>
                <div className="text-[10px] text-ink-faint">{t.specialty}</div>
              </div>
              <div className="min-w-[140px] text-[11px] text-ink-faint">
                <div>{t.email}</div>
                <div>{t.phone}</div>
              </div>
              <Badge tone="neutral">
                {assignedClasses.length > 0 ? `${assignedClasses.length} فصل مسند` : 'بلا فصول'}
              </Badge>
              <Badge tone={t.source === 'CSV' ? 'indigo' : 'neutral'}>{t.source}</Badge>
              <Badge tone={t.status === 'نشط' ? 'success' : 'warning'}>{t.status}</Badge>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleStatus(t.id)}
                  className="rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-indigo hover:bg-surface"
                >
                  {t.status === 'نشط' ? 'تعطيل' : 'تفعيل'}
                </button>
                <button
                  onClick={() => removeTeacher(t.id)}
                  className="rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-danger-light hover:bg-danger-bg-soft"
                >
                  حذف
                </button>
              </div>
            </div>
          )
        })}
      </Card>

      <AddTeacherModal open={addOpen} onClose={() => setAddOpen(false)} />
      <BulkImportTeachersModal open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  )
}
