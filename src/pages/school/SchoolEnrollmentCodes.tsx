import { useState } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Table, { type Column } from '../../components/ui/Table'
import { useSchoolClasses } from '../../context/SchoolClassesContext'
import { useSchoolEnrollmentCodes, type EnrollmentCode } from '../../context/SchoolEnrollmentCodesContext'
import GenerateCodeModal from '../../components/GenerateCodeModal'

const typeLabels: Record<EnrollmentCode['codeType'], string> = {
  single: 'استخدام واحد',
  multi: 'استخدامات متعددة',
  batch: 'دفعة طلاب',
}

const statusLabels: Record<EnrollmentCode['status'], { label: string; tone: 'success' | 'warning' | 'neutral' }> = {
  active: { label: 'نشط', tone: 'success' },
  expired: { label: 'منتهي', tone: 'warning' },
  disabled: { label: 'معطل', tone: 'neutral' },
}

export default function SchoolEnrollmentCodes() {
  const { classes } = useSchoolClasses()
  const { codes, disableCode } = useSchoolEnrollmentCodes()
  const [generateOpen, setGenerateOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [confirmDisable, setConfirmDisable] = useState<EnrollmentCode | null>(null)

  function className(classId: string) {
    return classes.find((c) => c.id === classId)?.name ?? '—'
  }

  function copy(code: EnrollmentCode) {
    navigator.clipboard?.writeText(code.code)
    setCopiedId(code.id)
    setTimeout(() => setCopiedId(null), 1800)
  }

  const columns: Column<EnrollmentCode>[] = [
    {
      header: 'الكود',
      render: (c) => <span className="font-mono text-xs font-bold text-indigo">{c.code}</span>,
    },
    { header: 'الفصل المرتبط', render: (c) => <span className="text-xs text-ink">{className(c.classId)}</span> },
    { header: 'النوع', render: (c) => <span className="text-[11px] text-ink-faint">{typeLabels[c.codeType]}</span> },
    {
      header: 'الاستخدام',
      render: (c) => (
        <span className="text-xs font-semibold text-ink-soft">
          {c.currentUses} / {c.maxUses}
        </span>
      ),
    },
    {
      header: 'الحالة',
      render: (c) => <Badge tone={statusLabels[c.status].tone}>{statusLabels[c.status].label}</Badge>,
    },
    { header: 'تاريخ الإنشاء', render: (c) => <span className="text-[11px] text-ink-faint">{c.createdAt}</span> },
    {
      header: '',
      render: (c) => (
        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => copy(c)}
            className="rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-indigo hover:bg-surface-alt"
          >
            {copiedId === c.id ? 'تم النسخ ✓' : 'نسخ'}
          </button>
          <button
            onClick={() => setConfirmDisable(c)}
            disabled={c.status === 'disabled'}
            className="rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-danger-light hover:bg-danger-bg-soft disabled:opacity-30"
          >
            تعطيل
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="أكواد الالتحاق"
        subtitle={`${codes.length} كود مُنشأ لمدرستك`}
        actions={<Button size="sm" onClick={() => setGenerateOpen(true)}>+ توليد كود جديد</Button>}
      />

      {codes.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-14 text-center">
          <span className="text-2xl">🔑</span>
          <span className="text-sm font-bold text-ink">لا توجد أكواد التحاق بعد</span>
          <p className="max-w-sm text-xs text-ink-faint">
            وّلد كودًا لأحد فصولك ليتمكن الطلاب أو أولياء الأمور من الالتحاق مباشرة بدون إضافة يدوية
          </p>
          <Button size="sm" className="mt-2" onClick={() => setGenerateOpen(true)}>+ توليد كود جديد</Button>
        </Card>
      ) : (
        <Table columns={columns} rows={codes} keyFn={(c) => c.id} />
      )}

      <GenerateCodeModal open={generateOpen} onClose={() => setGenerateOpen(false)} />

      <Modal open={confirmDisable !== null} onClose={() => setConfirmDisable(null)} width={420}>
        {confirmDisable && (
          <div className="flex flex-col gap-4 text-center">
            <span className="font-sans text-lg font-extrabold text-navy">تعطيل الكود؟</span>
            <p className="text-xs text-ink-faint">
              لن يتمكن أي طالب جديد من استخدام «{confirmDisable.code}» للالتحاق بعد التعطيل.
            </p>
            <div className="flex justify-center gap-2.5">
              <Button variant="secondary" size="sm" onClick={() => setConfirmDisable(null)}>إلغاء</Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  disableCode(confirmDisable.id)
                  setConfirmDisable(null)
                }}
              >
                تعطيل الكود
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
