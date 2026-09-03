import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { useCurrentSchool } from '../../context/CurrentSchoolContext'
import { useSchoolClasses } from '../../context/SchoolClassesContext'
import { resourcesApi, type ApiResource } from '../../lib/resourcesApi'
import GenerateClassModal from '../../components/GenerateClassModal'

function isUnlocked(features: string[], resource: ApiResource) {
  return features.includes(resource.requiredFeature)
}

export default function SchoolResources() {
  const navigate = useNavigate()
  const { school, loading: schoolLoading } = useCurrentSchool()
  const { classes } = useSchoolClasses()
  const [resources, setResources] = useState<ApiResource[] | null>(null)
  const [selected, setSelected] = useState<ApiResource | null>(null)

  useEffect(() => {
    resourcesApi.list('published').then(setResources).catch(() => setResources([]))
  }, [])

  function hasOutdatedClass(resource: ApiResource) {
    return classes.some(
      (c) => c.resourceId === resource.id && c.resourceVersionAtGeneration !== null && c.resourceVersionAtGeneration < resource.versionNumber,
    )
  }

  if (schoolLoading || resources === null) {
    return <div className="rounded-xl bg-surface-alt px-4 py-8 text-center text-sm text-ink-faint">جارٍ التحميل...</div>
  }

  const pkg = school?.package
  const features = pkg?.features ?? []
  const unlockedCount = resources.filter((r) => isUnlocked(features, r)).length

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="مكتبة موارد ألف"
        subtitle={pkg ? `${unlockedCount} من ${resources.length} برامج متاحة ضمن باقتكم الحالية — ${pkg.name}` : undefined}
        actions={<Button variant="secondary" size="sm" onClick={() => navigate('/school/package')}>ترقية الباقة</Button>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {resources.map((r) => {
          const unlocked = isUnlocked(features, r)
          return (
            <Card key={r.id} className="relative flex flex-col gap-3 overflow-hidden">
              {!unlocked && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-white/85 text-center backdrop-blur-sm">
                  <span className="text-2xl">🔒</span>
                  <span className="px-4 text-[11px] font-semibold text-ink-soft">
                    يتطلب ميزة «{r.requiredFeature}» — غير متوفرة في باقتكم الحالية
                  </span>
                  <Button size="sm" onClick={() => navigate('/school/package')}>ترقية الباقة</Button>
                </div>
              )}
              <div className="flex items-center gap-3">
                <span
                  className="flex h-11 w-11 flex-none items-center justify-center rounded-xl font-sans text-sm font-extrabold text-white"
                  style={{ background: r.color }}
                >
                  {r.subject[0]}
                </span>
                <div className="flex-1">
                  <div className="text-sm font-bold text-ink">{r.name}</div>
                  <div className="text-[11px] text-ink-faint">{r.subject} · {r.stage}</div>
                </div>
                {hasOutdatedClass(r) && (
                  <span
                    title="لديك فصل مولّد من إصدار أقدم لهذا البرنامج"
                    className="rounded-md bg-warning-bg px-2 py-1 text-[10px] font-bold text-warning"
                  >
                    🔔 نسخة أحدث متاحة
                  </span>
                )}
              </div>
              <p className="text-xs leading-relaxed text-ink-soft">{r.description}</p>
              <div className="flex flex-wrap gap-1.5">
                <Badge tone="indigo">{r.program}</Badge>
                <Badge tone="neutral">{r.sessionsCount} لقاء</Badge>
                <Badge tone="neutral">{r.questionsIncluded} سؤال</Badge>
                <Badge tone="neutral">{r.contentItemsIncluded} عنصر محتوى</Badge>
              </div>
              <Button size="sm" disabled={!unlocked} onClick={() => setSelected(r)}>
                توليد فصل من هذا البرنامج
              </Button>
            </Card>
          )
        })}
      </div>

      <GenerateClassModal resource={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
