import { useEffect, useState } from 'react'
import PageHeader from '../components/ui/PageHeader'
import Table, { type Column } from '../components/ui/Table'
import Badge from '../components/ui/Badge'
import { activityLogApi, type ApiActivityLogEntry } from '../lib/activityLogApi'
import { ApiError } from '../lib/api'

const columns: Column<ApiActivityLogEntry>[] = [
  {
    header: 'التاريخ والوقت',
    render: (l) => <span className="text-[11px] text-ink-faint">{new Date(l.createdAt).toLocaleString('ar-SA')}</span>,
  },
  { header: 'المستخدم', render: (l) => <span className="text-xs font-semibold text-ink">{l.actorName}</span> },
  { header: 'الإجراء', render: (l) => <Badge tone={l.tone}>{l.action}</Badge> },
  { header: 'الجهة المتأثرة', render: (l) => <span className="text-[11px] text-ink-soft">{l.target}</span> },
  { header: 'عنوان IP', render: (l) => <span className="text-[11px] text-ink-faint">{l.ip ?? '—'}</span> },
]

export default function ActivityLog() {
  const [entries, setEntries] = useState<ApiActivityLogEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    activityLogApi
      .list()
      .then(setEntries)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'تعذر تحميل سجل النشاط'))
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="سجل النشاط"
        subtitle="سجل كل الإجراءات التي تمت على المنصة"
      />

      {error && <div className="rounded-xl bg-danger-bg-soft px-4 py-6 text-center text-sm text-danger-light">{error}</div>}
      {!error && entries === null && (
        <div className="rounded-xl bg-surface-alt px-4 py-8 text-center text-sm text-ink-faint">جارٍ التحميل...</div>
      )}
      {entries?.length === 0 && (
        <div className="rounded-xl bg-surface-alt px-4 py-8 text-center text-sm text-ink-faint">لا يوجد نشاط مسجّل بعد</div>
      )}
      {entries && entries.length > 0 && (
        <Table columns={columns} rows={entries} keyFn={(l) => l.id} />
      )}
    </div>
  )
}
