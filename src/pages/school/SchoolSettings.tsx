import { useEffect, useState } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Switch from '../../components/ui/Switch'
import { Field } from '../../components/ui/Input'
import { useCurrentSchool } from '../../context/CurrentSchoolContext'
import { schoolsApi } from '../../lib/schoolsApi'

export default function SchoolSettings() {
  const { school, loading, refresh } = useCurrentSchool()
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [principal, setPrincipal] = useState('')
  const [notifyMeetings, setNotifyMeetings] = useState(true)
  const [notifyReports, setNotifyReports] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (school) {
      setName(school.name)
      setCity(school.city)
      setPrincipal(school.principal)
    }
  }, [school])

  async function save() {
    if (!school) return
    await schoolsApi.update(school.id, { name, city, principal })
    refresh()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading || !school) {
    return <div className="rounded-xl bg-surface-alt px-4 py-8 text-center text-sm text-ink-faint">جارٍ التحميل...</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="إعدادات المدرسة" subtitle={school.name} />

      <Card className="flex flex-col gap-3.5">
        <span className="text-sm font-extrabold text-ink">معلومات المدرسة</span>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="اسم المدرسة">
            <input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:border-indigo focus:bg-white focus:outline-none" />
          </Field>
          <Field label="المدينة">
            <input value={city} onChange={(e) => setCity(e.target.value)} className="rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:border-indigo focus:bg-white focus:outline-none" />
          </Field>
          <Field label="مدير المدرسة">
            <input value={principal} onChange={(e) => setPrincipal(e.target.value)} className="rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:border-indigo focus:bg-white focus:outline-none" />
          </Field>
          <Field label="بريد التواصل">
            <input defaultValue={school.contacts[0]?.email} disabled className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-faint focus:outline-none" />
          </Field>
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <span className="text-sm font-extrabold text-ink">الإشعارات</span>
        <div className="flex items-center justify-between rounded-xl bg-surface-alt px-4 py-3">
          <span className="text-xs text-ink-soft">إشعار قبل بدء اللقاءات</span>
          <Switch checked={notifyMeetings} onChange={setNotifyMeetings} />
        </div>
        <div className="flex items-center justify-between rounded-xl bg-surface-alt px-4 py-3">
          <span className="text-xs text-ink-soft">إشعار عند إصدار تقارير جديدة</span>
          <Switch checked={notifyReports} onChange={setNotifyReports} />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button size="sm" onClick={save}>{saved ? 'تم الحفظ ✓' : 'حفظ التغييرات'}</Button>
      </div>
    </div>
  )
}
