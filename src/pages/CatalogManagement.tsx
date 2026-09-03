import { useEffect, useState } from 'react'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Table, { type Column } from '../components/ui/Table'
import { resourcesApi, type ApiResource, type ResourceStatus } from '../lib/resourcesApi'
import CatalogResourceFormModal from '../components/CatalogResourceFormModal'
import { ApiError } from '../lib/api'

const statusLabels: Record<ResourceStatus, { label: string; tone: 'success' | 'warning' | 'neutral' }> = {
  draft: { label: 'مسودة', tone: 'neutral' },
  published: { label: 'منشور', tone: 'success' },
  archived: { label: 'مؤرشف', tone: 'warning' },
}

export default function CatalogManagement() {
  const [resources, setResources] = useState<ApiResource[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [versionTarget, setVersionTarget] = useState<ApiResource | null>(null)

  function load() {
    resourcesApi
      .list()
      .then(setResources)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'تعذر تحميل الكتالوج'))
  }

  useEffect(load, [])

  async function uploadNewVersion() {
    if (!versionTarget) return
    await resourcesApi.update(versionTarget.id, { versionNumber: versionTarget.versionNumber + 1 })
    setVersionTarget(null)
    load()
  }

  const columns: Column<ApiResource>[] = [
    {
      header: 'البرنامج',
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 flex-none items-center justify-center rounded-lg text-xs font-extrabold text-white"
            style={{ background: r.color }}
          >
            {r.subject[0]}
          </span>
          <span className="text-xs font-bold text-ink">{r.name}</span>
        </div>
      ),
    },
    { header: 'الموضوع', render: (r) => <span className="text-[11px] text-ink-muted">{r.subject}</span> },
    { header: 'المرحلة', render: (r) => <span className="text-[11px] text-ink-muted">{r.stage}</span> },
    { header: 'الحالة', render: (r) => <Badge tone={statusLabels[r.status].tone}>{statusLabels[r.status].label}</Badge> },
    { header: 'الإصدار', render: (r) => <span className="font-mono text-xs font-bold text-indigo">v{r.versionNumber}</span> },
    { header: 'المدارس المستخدمة', render: (r) => <span className="text-xs text-ink-soft">{r.schoolsUsingCount}</span> },
    { header: 'إجمالي الطلاب', render: (r) => <span className="text-xs text-ink-soft">{r.totalStudentsCount.toLocaleString('ar')}</span> },
    {
      header: '',
      render: (r) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Button variant="secondary" size="sm" onClick={() => setVersionTarget(r)}>رفع إصدار جديد</Button>
        </div>
      ),
    },
  ]

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="إدارة الكتالوج المركزي" />
        <div className="rounded-xl bg-danger-bg-soft px-4 py-6 text-center text-sm text-danger-light">{error}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="إدارة الكتالوج المركزي"
        subtitle="البرامج التعليمية المملوكة لمنصة ألف والمتاحة للمدارس حسب باقتها"
        actions={<Button size="sm" onClick={() => setCreateOpen(true)}>+ نشر برنامج جديد</Button>}
      />

      {resources === null ? (
        <div className="rounded-xl bg-surface-alt px-4 py-8 text-center text-sm text-ink-faint">جارٍ التحميل...</div>
      ) : (
        <Table columns={columns} rows={resources} keyFn={(r) => r.id} />
      )}

      <CatalogResourceFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => { setCreateOpen(false); load() }}
      />

      <Modal open={versionTarget !== null} onClose={() => setVersionTarget(null)} width={480}>
        {versionTarget && (
          <div className="flex flex-col gap-4">
            <span className="font-sans text-lg font-extrabold text-navy">رفع إصدار جديد</span>
            <p className="text-xs leading-relaxed text-ink-soft">
              سيتم إنشاء <span className="font-bold text-ink">إصدار جديد (v{versionTarget.versionNumber + 1})</span> من
              برنامج «{versionTarget.name}». المدارس التي ولّدت فصولًا من الإصدار الحالي (v{versionTarget.versionNumber})
              ستستمر بالعمل عليه دون أي تأثير، وسيظهر لها تنبيه اختياري بتوفر إصدار أحدث يمكنها التبديل إليه لاحقًا.
            </p>
            <div className="flex justify-end gap-2.5">
              <Button variant="secondary" size="sm" onClick={() => setVersionTarget(null)}>إلغاء</Button>
              <Button size="sm" onClick={uploadNewVersion}>تأكيد رفع الإصدار</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
