import { useEffect, useState } from 'react'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import { packagesApi, type PackageWithSubscribers } from '../lib/schoolsApi'
import { allFeatures } from '../data/packages'
import { ApiError } from '../lib/api'
import PackageFormModal from '../components/PackageFormModal'

const cycleLabel: Record<string, string> = { monthly: 'شهري', quarterly: 'فصلي', annual: 'سنوي' }

export default function Packages() {
  const [packages, setPackages] = useState<PackageWithSubscribers[] | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<PackageWithSubscribers | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<PackageWithSubscribers | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  function load() {
    packagesApi
      .list()
      .then(setPackages)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'تعذر تحميل الباقات'))
  }

  useEffect(load, [])

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(pkg: PackageWithSubscribers) {
    setEditing(pkg)
    setFormOpen(true)
  }

  async function remove(pkg: PackageWithSubscribers) {
    setDeleteError(null)
    try {
      await packagesApi.remove(pkg.id)
      setConfirmDelete(null)
      load()
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : 'تعذر حذف الباقة')
    }
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="إدارة الباقات" />
        <Card className="text-center text-sm text-danger-light">{error}</Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="إدارة الباقات"
        subtitle="الباقات المتاحة للاشتراك للمدارس"
        actions={<Button size="sm" onClick={openCreate}>+ إنشاء باقة</Button>}
      />

      {packages === null ? (
        <Card className="text-center text-sm text-ink-faint">جارٍ التحميل...</Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {packages.map((p) => (
            <Card key={p.id} className="flex flex-col gap-3.5">
              <div className="flex items-center justify-between">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-xl font-sans text-sm font-extrabold text-white"
                  style={{ background: p.color }}
                >
                  {p.name[0]}
                </span>
                <Badge tone="neutral">{p.subscribedSchools} مدرسة مشتركة</Badge>
              </div>
              <div>
                <div className="text-sm font-extrabold text-ink">{p.name}</div>
                <div className="mt-1 text-xs text-ink-faint">
                  {p.price === 0 ? 'مجانية' : `${p.price.toLocaleString('ar')} ريال`} · {cycleLabel[p.cycle]}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-ink-soft">
                <div className="rounded-lg bg-surface-alt py-2">
                  <div className="font-bold text-ink">{p.maxStudents}</div>
                  طالب
                </div>
                <div className="rounded-lg bg-surface-alt py-2">
                  <div className="font-bold text-ink">{p.maxClasses}</div>
                  فصل
                </div>
                <div className="rounded-lg bg-surface-alt py-2">
                  <div className="font-bold text-ink">{p.storageGB} GB</div>
                  تخزين
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {p.features.slice(0, 3).map((f) => (
                  <span key={f} className="rounded-full bg-surface-alt px-2.5 py-1 text-[10px] text-ink-soft">
                    {f}
                  </span>
                ))}
                {p.features.length > 3 && (
                  <span className="rounded-full bg-surface-alt px-2.5 py-1 text-[10px] text-ink-faint">
                    +{p.features.length - 3} أخرى
                  </span>
                )}
              </div>
              <div className="mt-1 flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => openEdit(p)}>تعديل</Button>
                <Button variant="danger" size="sm" onClick={() => { setDeleteError(null); setConfirmDelete(p) }}>حذف</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <PackageFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={() => { setFormOpen(false); load() }}
        initial={editing}
        allFeatures={allFeatures}
      />

      <Modal open={confirmDelete !== null} onClose={() => setConfirmDelete(null)} width={420}>
        {confirmDelete && (
          <div className="flex flex-col gap-4 text-center">
            <span className="font-sans text-lg font-extrabold text-navy">حذف الباقة؟</span>
            <p className="text-xs text-ink-faint">
              «{confirmDelete.name}» مرتبطة بـ {confirmDelete.subscribedSchools} مدرسة حاليًا. لا يمكن التراجع عن الحذف.
            </p>
            {deleteError && <p className="text-xs font-semibold text-danger-light">{deleteError}</p>}
            <div className="flex justify-center gap-2.5">
              <Button variant="secondary" size="sm" onClick={() => setConfirmDelete(null)}>إلغاء</Button>
              <Button variant="danger" size="sm" onClick={() => remove(confirmDelete)}>حذف نهائيًا</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
