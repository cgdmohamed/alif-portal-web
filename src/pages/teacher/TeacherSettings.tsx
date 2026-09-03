import { useState } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Switch from '../../components/ui/Switch'
import { Field } from '../../components/ui/Input'
import { useAuth } from '../../context/AuthContext'
import { useCurrentTeacher } from '../../context/CurrentTeacherContext'

export default function TeacherSettings() {
  const { user } = useAuth()
  const { teacher, loading } = useCurrentTeacher()
  const [notifyMeetings, setNotifyMeetings] = useState(true)
  const [notifyGrading, setNotifyGrading] = useState(true)
  const [saved, setSaved] = useState(false)

  if (loading) {
    return <div className="rounded-xl bg-surface-alt px-4 py-8 text-center text-sm text-ink-faint">جارٍ التحميل...</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="إعداداتي" subtitle={user?.name} />

      <Card className="flex flex-col gap-3.5">
        <span className="text-sm font-extrabold text-ink">المعلومات الشخصية</span>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="الاسم">
            <input defaultValue={user?.name} disabled className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-faint focus:outline-none" />
          </Field>
          <Field label="التخصص">
            <input defaultValue={teacher?.specialty ?? '—'} disabled className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-faint focus:outline-none" />
          </Field>
          <Field label="البريد الإلكتروني">
            <input defaultValue={user?.email ?? ''} disabled className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-faint focus:outline-none" />
          </Field>
          <Field label="رقم الجوال">
            <input defaultValue={teacher?.phone ?? '—'} disabled className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-faint focus:outline-none" />
          </Field>
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <span className="text-sm font-extrabold text-ink">الإشعارات</span>
        <div className="flex items-center justify-between rounded-xl bg-surface-alt px-4 py-3">
          <span className="text-xs text-ink-soft">إشعار قبل بدء لقاءاتي</span>
          <Switch checked={notifyMeetings} onChange={setNotifyMeetings} />
        </div>
        <div className="flex items-center justify-between rounded-xl bg-surface-alt px-4 py-3">
          <span className="text-xs text-ink-soft">إشعار عند وصول واجبات جديدة بحاجة تصحيح</span>
          <Switch checked={notifyGrading} onChange={setNotifyGrading} />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button size="sm" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }}>
          {saved ? 'تم الحفظ ✓' : 'حفظ التغييرات'}
        </Button>
      </div>
    </div>
  )
}
