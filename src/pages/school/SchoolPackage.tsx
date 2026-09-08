import { useEffect, useState } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import ProgressBar from '../../components/ui/ProgressBar'
import Modal from '../../components/ui/Modal'
import { useCurrentSchool, schoolStatusLabel } from '../../context/CurrentSchoolContext'
import { useSchoolStudents } from '../../context/SchoolStudentsContext'
import { useSchoolClasses } from '../../context/SchoolClassesContext'
import { packagesApi, schoolsApi, type PackageWithSubscribers, type SchoolInvoice } from '../../lib/schoolsApi'

export default function SchoolPackage() {
  const { school, loading: schoolLoading, refresh } = useCurrentSchool()
  const { students } = useSchoolStudents()
  const { classes } = useSchoolClasses()
  const [packages, setPackages] = useState<PackageWithSubscribers[]>([])
  const [invoices, setInvoices] = useState<SchoolInvoice[]>([])
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [pendingPackage, setPendingPackage] = useState<PackageWithSubscribers | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const schoolId = school?.id

  useEffect(() => {
    packagesApi.list().then(setPackages).catch(() => setPackages([]))
  }, [])

  useEffect(() => {
    if (schoolId) schoolsApi.invoices(schoolId).then(setInvoices).catch(() => setInvoices([]))
  }, [schoolId])

  if (schoolLoading || !school) {
    return <div className="rounded-xl bg-surface-alt px-4 py-8 text-center text-sm text-ink-faint">جارٍ التحميل...</div>
  }

  const current = school.package

  async function confirmUpgrade() {
    if (!pendingPackage) return
    await schoolsApi.subscribe(school!.id, pendingPackage.id)
    setPendingPackage(null)
    setUpgradeOpen(false)
    setConfirmed(true)
    refresh()
    setTimeout(() => setConfirmed(false), 3000)
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="الباقة والاشتراك"
        subtitle={`إدارة اشتراك ${school.name}`}
        actions={<Button size="sm" onClick={() => setUpgradeOpen(true)}>ترقية الباقة</Button>}
      />

      {confirmed && current && (
        <div className="rounded-xl bg-success-bg px-4 py-3 text-xs font-semibold text-success">
          تم تحديث الاشتراك إلى «{current.name}» بنجاح ✓
        </div>
      )}

      {!current ? (
        <Card className="text-center text-sm text-ink-faint">لا توجد باقة مرتبطة بهذه المدرسة حاليًا</Card>
      ) : (
        <Card className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl font-sans text-lg font-extrabold text-white"
                style={{ background: current.color }}
              >
                {current.name[0]}
              </span>
              <div>
                <div className="text-base font-extrabold text-ink">{current.name}</div>
                <div className="text-xs text-ink-faint">
                  {current.price === 0 ? 'مجانية' : `${current.price.toLocaleString('ar')} ريال`} · {current.cycle}
                </div>
              </div>
            </div>
            <Badge tone={schoolStatusLabel[school.status].tone}>{schoolStatusLabel[school.status].label}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-3">
            <div className="rounded-xl bg-surface-alt py-3">
              <div className="text-sm font-extrabold text-navy">{current.maxStudents}</div>
              <div className="text-[10px] text-ink-faint">الحد الأقصى للطلاب</div>
            </div>
            <div className="rounded-xl bg-surface-alt py-3">
              <div className="text-sm font-extrabold text-navy">{current.maxClasses}</div>
              <div className="text-[10px] text-ink-faint">الحد الأقصى للفصول</div>
            </div>
            <div className="rounded-xl bg-surface-alt py-3">
              <div className="text-sm font-extrabold text-navy">{current.storageGB} GB</div>
              <div className="text-[10px] text-ink-faint">المساحة التخزينية</div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <div className="mb-1 flex justify-between text-[11px] text-ink-faint">
                <span>استخدام الطلاب</span><span>{students.length} / {current.maxStudents}</span>
              </div>
              <ProgressBar value={(students.length / current.maxStudents) * 100} color={current.color} />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-[11px] text-ink-faint">
                <span>استخدام الفصول</span><span>{classes.length} / {current.maxClasses}</span>
              </div>
              <ProgressBar value={(classes.length / current.maxClasses) * 100} color={current.color} />
            </div>
          </div>

          <div>
            <div className="mb-2 text-xs font-bold text-ink-soft">الميزات المضمنة</div>
            <div className="flex flex-wrap gap-2">
              {current.features.map((f) => (
                <Badge key={f} tone="indigo">✓ {f}</Badge>
              ))}
            </div>
          </div>
        </Card>
      )}

      <Card className="flex flex-col gap-3">
        <span className="text-sm font-extrabold text-ink">سجل الفواتير</span>
        <div className="flex flex-col gap-2">
          {invoices.length === 0 ? (
            <div className="text-xs text-ink-faint">لا توجد فواتير بعد</div>
          ) : (
            invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between rounded-lg bg-surface-alt px-3.5 py-2.5">
                <div>
                  <div className="text-xs font-bold text-ink">فاتورة</div>
                  <div className="text-[10px] text-ink-faint">{new Date(inv.issuedAt).toLocaleDateString('ar-SA')}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-indigo">{inv.amount.toLocaleString('ar')} ريال</span>
                  <Badge tone={inv.status === 'paid' ? 'success' : inv.status === 'overdue' ? 'danger' : 'warning'}>
                    {inv.status === 'paid' ? 'مدفوعة' : inv.status === 'overdue' ? 'متأخرة' : 'قيد الانتظار'}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Modal open={upgradeOpen} onClose={() => { setUpgradeOpen(false); setPendingPackage(null) }} width={720}>
        {pendingPackage ? (
          <div className="flex flex-col gap-4 text-center">
            <span className="font-sans text-lg font-extrabold text-navy">تأكيد الترقية</span>
            <p className="text-xs text-ink-faint">
              سيتم تغيير الاشتراك من «{current?.name ?? '—'}» إلى «{pendingPackage.name}» بسعر{' '}
              {pendingPackage.price === 0 ? 'مجاني' : `${pendingPackage.price.toLocaleString('ar')} ريال`} / {pendingPackage.cycle}.
            </p>
            <div className="flex justify-center gap-2.5">
              <Button variant="secondary" size="sm" onClick={() => setPendingPackage(null)}>رجوع</Button>
              <Button size="sm" onClick={confirmUpgrade}>تأكيد الترقية</Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-sans text-lg font-extrabold text-navy">اختر باقة جديدة</span>
              <button onClick={() => setUpgradeOpen(false)} className="text-xl text-ink-faint">✕</button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {packages.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPendingPackage(p)}
                  disabled={p.id === current?.id}
                  className={`flex flex-col gap-2 rounded-xl border p-4 text-right transition-colors disabled:opacity-40 ${
                    p.id === current?.id ? 'border-indigo bg-surface-alt' : 'border-line bg-white hover:bg-surface-alt'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-ink">{p.name}</span>
                    {p.id === current?.id && <Badge tone="indigo">الحالية</Badge>}
                  </div>
                  <span className="text-xs text-ink-faint">
                    {p.price === 0 ? 'مجانية' : `${p.price.toLocaleString('ar')} ريال`} · {p.cycle}
                  </span>
                  <span className="text-[11px] text-ink-soft">
                    حتى {p.maxStudents} طالب · {p.maxClasses} فصل · {p.storageGB} GB
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
