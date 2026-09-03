import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { Field } from '../components/ui/Input'
import ActivityPreviewModal from '../components/ActivityPreviewModal'
import { activityTypes, deliveryChannels } from '../data/programTree'
import { resourcesApi, type ApiResource } from '../lib/resourcesApi'
import {
  programsApi,
  type ProgramTree,
  type ApiContentBlock,
  type ExecutionMode,
  type DeliveryChannel,
  type CreateBlockInput,
} from '../lib/programsApi'
import { ApiError } from '../lib/api'

type Selection =
  | { level: 'day'; id: string }
  | { level: 'unit'; id: string }
  | { level: 'session'; id: string }
  | { level: 'block'; id: string }
  | null

const executionModes: ExecutionMode[] = ['فردي', 'ثنائي', 'جماعي']

function blankLecture(): CreateBlockInput {
  return { type: 'lecture', title: '', durationMinutes: 10 }
}

function blankActivity(): CreateBlockInput {
  return {
    type: 'activity',
    title: '',
    durationMinutes: 15,
    executionMode: 'فردي',
    deliveryChannel: 'shared_live_screen',
    activityType: activityTypes[0],
    instructionsText: '',
    materialsNeeded: '',
    trainerNotes: '',
  }
}

export default function QuestionBank() {
  const [resources, setResources] = useState<ApiResource[]>([])
  const [resourceId, setResourceId] = useState('')
  const [tree, setTree] = useState<ProgramTree | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [selection, setSelection] = useState<Selection>(null)
  const [creatingForSession, setCreatingForSession] = useState<string | null>(null)
  const [creatingType, setCreatingType] = useState<'lecture' | 'activity' | null>(null)
  const [draft, setDraft] = useState<CreateBlockInput | null>(null)
  const [previewActivity, setPreviewActivity] = useState<{ title: string; activityType: string } | null>(null)

  useEffect(() => {
    resourcesApi
      .list('published')
      .then((rows) => {
        setResources(rows)
        if (rows.length > 0) setResourceId(rows[0].id)
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'تعذر تحميل قائمة البرامج'))
  }, [])

  function loadTree(id: string) {
    programsApi
      .getTree(id)
      .then((t) => {
        setTree(t)
        setExpanded(new Set([t.days[0]?.id, t.units[0]?.id, t.sessions[0]?.id].filter(Boolean) as string[]))
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'تعذر تحميل شجرة البرنامج'))
  }

  useEffect(() => {
    if (resourceId) loadTree(resourceId)
  }, [resourceId])

  function refresh() {
    if (resourceId) loadTree(resourceId)
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function select(level: NonNullable<Selection>['level'], id: string) {
    setCreatingForSession(null)
    setSelection({ level, id } as Selection)
  }

  function startCreate(sessionId: string) {
    setSelection(null)
    setCreatingForSession(sessionId)
    setCreatingType(null)
    setDraft(null)
  }

  function cancelCreate() {
    setCreatingForSession(null)
    setCreatingType(null)
    setDraft(null)
  }

  function pickCreateType(type: 'lecture' | 'activity') {
    setCreatingType(type)
    setDraft(type === 'lecture' ? blankLecture() : blankActivity())
  }

  async function saveDraft() {
    if (!creatingForSession || !draft || !draft.title.trim()) return
    const created = await programsApi.addBlock(creatingForSession, draft)
    cancelCreate()
    refresh()
    select('block', created.id)
  }

  async function updateBlock(id: string, patch: Partial<CreateBlockInput>) {
    await programsApi.updateBlock(id, patch)
    refresh()
  }

  async function deleteBlock(id: string) {
    await programsApi.removeBlock(id)
    setSelection(null)
    refresh()
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="بناء البرنامج" />
        <div className="rounded-xl bg-danger-bg-soft px-4 py-6 text-center text-sm text-danger-light">{error}</div>
      </div>
    )
  }

  if (resources.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="بناء البرنامج" />
        <div className="rounded-xl bg-surface-alt px-4 py-8 text-center text-sm text-ink-faint">
          لا توجد برامج منشورة بعد — أضف برنامجًا من صفحة إدارة الكتالوج المركزي أولًا
        </div>
      </div>
    )
  }

  const selectedResource = resources.find((r) => r.id === resourceId)
  const days = tree?.days ?? []
  const units = tree?.units ?? []
  const sessions = tree?.sessions ?? []
  const blocks = tree?.blocks ?? []

  const selectedBlock = selection?.level === 'block' ? blocks.find((b) => b.id === selection.id) ?? null : null
  const selectedSession = selection?.level === 'session' ? sessions.find((s) => s.id === selection.id) ?? null : null
  const selectedUnit = selection?.level === 'unit' ? units.find((u) => u.id === selection.id) ?? null : null
  const selectedDay = selection?.level === 'day' ? days.find((d) => d.id === selection.id) ?? null : null

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="بناء البرنامج"
        subtitle={selectedResource?.name}
        actions={
          <select
            value={resourceId}
            onChange={(e) => { setResourceId(e.target.value); setSelection(null) }}
            className="rounded-lg border border-line bg-white px-3 py-2 text-xs font-semibold text-ink-soft focus:outline-none"
          >
            {resources.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="flex max-h-[calc(100vh-180px)] flex-col gap-1 overflow-y-auto p-3">
          <div className="mb-1 flex items-center gap-1.5 px-2 py-1.5 text-xs font-extrabold text-navy">
            📘 {selectedResource?.name}
          </div>
          {tree === null && <div className="px-2 text-xs text-ink-faint">جارٍ التحميل...</div>}
          {days.map((day) => (
            <div key={day.id}>
              <TreeRow
                label={day.title}
                depth={1}
                icon="🗓"
                hasChildren
                expanded={expanded.has(day.id)}
                onToggleExpand={() => toggleExpand(day.id)}
                active={selection?.level === 'day' && selection.id === day.id}
                onClick={() => select('day', day.id)}
              />
              {expanded.has(day.id) &&
                units.filter((u) => u.dayId === day.id).map((unit) => (
                  <div key={unit.id}>
                    <TreeRow
                      label={unit.title}
                      depth={2}
                      icon="📂"
                      hasChildren
                      expanded={expanded.has(unit.id)}
                      onToggleExpand={() => toggleExpand(unit.id)}
                      active={selection?.level === 'unit' && selection.id === unit.id}
                      onClick={() => select('unit', unit.id)}
                    />
                    {expanded.has(unit.id) &&
                      sessions.filter((s) => s.unitId === unit.id).map((session) => (
                        <div key={session.id}>
                          <TreeRow
                            label={session.title}
                            depth={3}
                            icon="🕘"
                            hasChildren
                            expanded={expanded.has(session.id)}
                            onToggleExpand={() => toggleExpand(session.id)}
                            active={selection?.level === 'session' && selection.id === session.id}
                            onClick={() => select('session', session.id)}
                          />
                          {expanded.has(session.id) &&
                            blocks.filter((b) => b.sessionId === session.id).map((block) => (
                              <TreeRow
                                key={block.id}
                                label={block.title || '(بدون عنوان)'}
                                depth={4}
                                icon={block.type === 'lecture' ? '📖' : '🎯'}
                                active={selection?.level === 'block' && selection.id === block.id}
                                onClick={() => select('block', block.id)}
                              />
                            ))}
                        </div>
                      ))}
                  </div>
                ))}
            </div>
          ))}
          <button
            onClick={async () => { await programsApi.addDay(resourceId, `اليوم ${days.length + 1}`); refresh() }}
            className="mt-2 rounded-lg px-3 py-2 text-right text-xs font-semibold text-indigo hover:bg-surface-alt"
          >
            + إضافة يوم
          </button>
        </Card>

        <Card className="flex min-h-[calc(100vh-180px)] flex-col gap-4">
          {creatingForSession ? (
            creatingType === null ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-ink">إضافة عنصر محتوى جديد</span>
                  <button onClick={cancelCreate} className="text-xl text-ink-faint">✕</button>
                </div>
                <p className="text-xs text-ink-faint">اختر نوع العنصر الذي تريد إضافته لهذه الجلسة</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    onClick={() => pickCreateType('lecture')}
                    className="flex flex-col items-center gap-2 rounded-xl border border-line bg-surface-alt p-6 text-center hover:border-indigo hover:bg-white"
                  >
                    <span className="text-2xl">📖</span>
                    <span className="text-sm font-bold text-ink">محاضرة</span>
                    <span className="text-[11px] text-ink-faint">شرح أو تقديم من المدرب</span>
                  </button>
                  <button
                    onClick={() => pickCreateType('activity')}
                    className="flex flex-col items-center gap-2 rounded-xl border border-line bg-surface-alt p-6 text-center hover:border-indigo hover:bg-white"
                  >
                    <span className="text-2xl">🎯</span>
                    <span className="text-sm font-bold text-ink">نشاط</span>
                    <span className="text-[11px] text-ink-faint">تمرين أو مهمة تفاعلية للطلاب</span>
                  </button>
                </div>
              </div>
            ) : creatingType === 'lecture' && draft ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-ink">محاضرة جديدة</span>
                  <button onClick={cancelCreate} className="text-xl text-ink-faint">✕</button>
                </div>
                <Field label="عنوان المحاضرة">
                  <input
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    className="rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:border-indigo focus:bg-white focus:outline-none"
                  />
                </Field>
                <Field label="المدة (دقيقة)">
                  <input
                    type="number"
                    value={draft.durationMinutes}
                    onChange={(e) => setDraft({ ...draft, durationMinutes: Number(e.target.value) })}
                    className="w-40 rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:border-indigo focus:bg-white focus:outline-none"
                  />
                </Field>
                <div className="flex justify-end gap-2.5">
                  <Button variant="secondary" size="sm" onClick={cancelCreate}>إلغاء</Button>
                  <Button size="sm" onClick={saveDraft}>حفظ المحاضرة</Button>
                </div>
              </div>
            ) : draft ? (
              <ActivityForm
                value={draft}
                onChange={(patch) => setDraft({ ...draft, ...patch })}
                onCancel={cancelCreate}
                onSave={saveDraft}
                saveLabel="حفظ النشاط"
              />
            ) : null
          ) : selectedBlock ? (
            selectedBlock.type === 'lecture' ? (
              <div key={selectedBlock.id} className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-ink">تعديل محاضرة</span>
                  <button onClick={() => deleteBlock(selectedBlock.id)} className="text-xs font-semibold text-danger-light hover:underline">حذف</button>
                </div>
                <Field label="عنوان المحاضرة">
                  <input
                    defaultValue={selectedBlock.title}
                    onBlur={(e) => updateBlock(selectedBlock.id, { title: e.target.value })}
                    className="rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:border-indigo focus:bg-white focus:outline-none"
                  />
                </Field>
                <Field label="المدة (دقيقة)">
                  <input
                    type="number"
                    defaultValue={selectedBlock.durationMinutes}
                    onBlur={(e) => updateBlock(selectedBlock.id, { durationMinutes: Number(e.target.value) })}
                    className="w-40 rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:border-indigo focus:bg-white focus:outline-none"
                  />
                </Field>
              </div>
            ) : (
              <EditingActivityForm
                key={selectedBlock.id}
                block={selectedBlock}
                onCommit={(patch) => updateBlock(selectedBlock.id, patch)}
                onDelete={() => deleteBlock(selectedBlock.id)}
                onPreview={() => setPreviewActivity({ title: selectedBlock.title, activityType: selectedBlock.activityType ?? '' })}
              />
            )
          ) : selectedSession ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-ink">تعديل الجلسة</span>
                <Button size="sm" onClick={() => startCreate(selectedSession.id)}>+ إضافة عنصر محتوى</Button>
              </div>
              <Field label="عنوان الجلسة">
                <input
                  defaultValue={selectedSession.title}
                  onBlur={(e) => programsApi.updateSession(selectedSession.id, e.target.value, selectedSession.durationMinutes).then(refresh)}
                  className="rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:border-indigo focus:bg-white focus:outline-none"
                />
              </Field>
              <Field label="مدة الجلسة (دقيقة)">
                <input
                  type="number"
                  defaultValue={selectedSession.durationMinutes}
                  onBlur={(e) => programsApi.updateSession(selectedSession.id, selectedSession.title, Number(e.target.value)).then(refresh)}
                  className="w-40 rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:border-indigo focus:bg-white focus:outline-none"
                />
              </Field>
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-ink-soft">عناصر المحتوى ({blocks.filter((b) => b.sessionId === selectedSession.id).length})</span>
                {blocks.filter((b) => b.sessionId === selectedSession.id).map((b) => (
                  <button
                    key={b.id}
                    onClick={() => select('block', b.id)}
                    className="flex items-center justify-between rounded-lg bg-surface-alt px-3.5 py-2.5 text-right hover:bg-surface"
                  >
                    <span className="text-xs font-semibold text-ink">{b.type === 'lecture' ? '📖' : '🎯'} {b.title}</span>
                    <span className="text-[11px] text-ink-faint">{b.durationMinutes} دقيقة</span>
                  </button>
                ))}
              </div>
            </div>
          ) : selectedUnit ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-ink">تعديل الوحدة</span>
                <Button
                  size="sm"
                  onClick={async () => { await programsApi.addSession(selectedUnit.id, `الجلسة ${sessions.filter((s) => s.unitId === selectedUnit.id).length + 1}`, 45); refresh() }}
                >
                  + إضافة جلسة
                </Button>
              </div>
              <Field label="عنوان الوحدة">
                <input
                  defaultValue={selectedUnit.title}
                  onBlur={(e) => programsApi.updateUnit(selectedUnit.id, e.target.value).then(refresh)}
                  className="rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:border-indigo focus:bg-white focus:outline-none"
                />
              </Field>
              <div className="text-xs text-ink-faint">
                {sessions.filter((s) => s.unitId === selectedUnit.id).length} جلسة ضمن هذه الوحدة
              </div>
            </div>
          ) : selectedDay ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-ink">تعديل اليوم</span>
                <Button
                  size="sm"
                  onClick={async () => { await programsApi.addUnit(selectedDay.id, `الوحدة ${units.filter((u) => u.dayId === selectedDay.id).length + 1}`); refresh() }}
                >
                  + إضافة وحدة
                </Button>
              </div>
              <Field label="عنوان اليوم">
                <input
                  defaultValue={selectedDay.title}
                  onBlur={(e) => programsApi.updateDay(selectedDay.id, e.target.value).then(refresh)}
                  className="rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:border-indigo focus:bg-white focus:outline-none"
                />
              </Field>
              <div className="text-xs text-ink-faint">
                {units.filter((u) => u.dayId === selectedDay.id).length} وحدة ضمن هذا اليوم
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
              <span className="text-3xl">🌳</span>
              <span className="text-sm font-bold text-ink">اختر عنصرًا من شجرة البرنامج</span>
              <p className="max-w-xs text-xs text-ink-faint">
                اختر يومًا أو وحدة أو جلسة أو عنصر محتوى من الشجرة على اليمين لعرض تفاصيله وتعديله هنا
              </p>
            </div>
          )}
        </Card>
      </div>

      <ActivityPreviewModal activity={previewActivity} onClose={() => setPreviewActivity(null)} />
    </div>
  )
}

function TreeRow({
  label,
  depth,
  icon,
  hasChildren,
  expanded,
  onToggleExpand,
  active,
  onClick,
}: {
  label: string
  depth: number
  icon: ReactNode
  hasChildren?: boolean
  expanded?: boolean
  onToggleExpand?: () => void
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-1.5 rounded-lg py-2 pl-2 text-right text-xs transition-colors ${
        active ? 'bg-indigo/10 font-bold text-indigo' : 'text-ink-soft hover:bg-surface-alt'
      }`}
      style={{ paddingRight: 6 + depth * 14 }}
    >
      <span className="text-[10px] text-ink-faint">⋮⋮</span>
      {hasChildren ? (
        <span
          onClick={(e) => {
            e.stopPropagation()
            onToggleExpand?.()
          }}
          className="w-3 flex-none text-[10px] text-ink-faint"
        >
          {expanded ? '▾' : '◂'}
        </span>
      ) : (
        <span className="w-3 flex-none" />
      )}
      <span>{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  )
}

/**
 * Wraps ActivityForm for the "edit an existing block" case with a local
 * draft, so typing doesn't fire a network request + full tree refetch per
 * keystroke — only on blur / discrete field changes.
 */
function EditingActivityForm({
  block,
  onCommit,
  onDelete,
  onPreview,
}: {
  block: ApiContentBlock
  onCommit: (patch: Partial<CreateBlockInput>) => void
  onDelete: () => void
  onPreview: () => void
}) {
  const [local, setLocal] = useState<ApiContentBlock>(block)

  return (
    <ActivityForm
      value={local}
      onChange={(patch) => {
        setLocal((prev) => ({ ...prev, ...patch }))
        // Only discrete select fields commit immediately — free-typed fields
        // (title, duration, instructions, materials, notes) commit on blur.
        if ('activityType' in patch || 'executionMode' in patch || 'deliveryChannel' in patch) {
          onCommit(patch)
        }
      }}
      onBlurCommit={() =>
        onCommit({
          title: local.title,
          durationMinutes: local.durationMinutes,
          executionMode: local.executionMode ?? undefined,
          deliveryChannel: local.deliveryChannel ?? undefined,
          activityType: local.activityType ?? undefined,
          instructionsText: local.instructionsText ?? undefined,
          materialsNeeded: local.materialsNeeded ?? undefined,
          trainerNotes: local.trainerNotes ?? undefined,
        })
      }
      onDelete={onDelete}
      onPreview={onPreview}
    />
  )
}

function ActivityForm({
  value,
  onChange,
  onCancel,
  onSave,
  onDelete,
  onPreview,
  onBlurCommit,
  saveLabel,
}: {
  value: CreateBlockInput | ApiContentBlock
  onChange: (patch: Partial<CreateBlockInput>) => void
  onCancel?: () => void
  onSave?: () => void
  onDelete?: () => void
  onPreview?: () => void
  onBlurCommit?: () => void
  saveLabel?: string
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-extrabold text-ink">{saveLabel ? 'نشاط جديد' : 'تعديل نشاط'}</span>
        <div className="flex items-center gap-3">
          {onPreview && (
            <button onClick={onPreview} className="text-xs font-semibold text-indigo hover:underline">معاينة</button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="text-xs font-semibold text-danger-light hover:underline">حذف</button>
          )}
          {onCancel && <button onClick={onCancel} className="text-xl text-ink-faint">✕</button>}
        </div>
      </div>

      <Field label="عنوان النشاط">
        <input
          value={value.title}
          onChange={(e) => onChange({ title: e.target.value })}
          onBlur={onBlurCommit}
          className="rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:border-indigo focus:bg-white focus:outline-none"
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="نوع النشاط">
          <select
            value={value.activityType ?? activityTypes[0]}
            onChange={(e) => onChange({ activityType: e.target.value })}
            className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-soft focus:outline-none"
          >
            {activityTypes.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="نمط التنفيذ">
          <select
            value={value.executionMode ?? executionModes[0]}
            onChange={(e) => onChange({ executionMode: e.target.value as ExecutionMode })}
            className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-soft focus:outline-none"
          >
            {executionModes.map((m) => <option key={m}>{m}</option>)}
          </select>
        </Field>
        <Field label="المدة (دقيقة)">
          <input
            type="number"
            value={value.durationMinutes}
            onChange={(e) => onChange({ durationMinutes: Number(e.target.value) })}
            onBlur={onBlurCommit}
            className="rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:border-indigo focus:bg-white focus:outline-none"
          />
        </Field>
      </div>

      <Field label="قناة التسليم">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {deliveryChannels.map((ch) => (
            <button
              key={ch.value}
              onClick={() => onChange({ deliveryChannel: ch.value as DeliveryChannel })}
              className={`flex flex-col items-start gap-1 rounded-xl border p-3.5 text-right transition-colors ${
                value.deliveryChannel === ch.value ? 'border-indigo bg-surface-alt' : 'border-line bg-white hover:bg-surface-alt'
              }`}
            >
              <span className="flex items-center gap-2 text-xs font-bold text-ink">
                {value.deliveryChannel === ch.value && <Badge tone="indigo">مختار</Badge>}
                {ch.label}
              </span>
              <span className="text-[11px] leading-relaxed text-ink-faint">{ch.description}</span>
            </button>
          ))}
        </div>
      </Field>

      <Field label="تعليمات التنفيذ">
        <textarea
          rows={2}
          value={value.instructionsText ?? ''}
          onChange={(e) => onChange({ instructionsText: e.target.value })}
          onBlur={onBlurCommit}
          className="rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:border-indigo focus:bg-white focus:outline-none"
        />
      </Field>

      <Field label="المواد المطلوبة">
        <input
          value={value.materialsNeeded ?? ''}
          onChange={(e) => onChange({ materialsNeeded: e.target.value })}
          onBlur={onBlurCommit}
          className="rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:border-indigo focus:bg-white focus:outline-none"
        />
      </Field>

      <Field label="ملاحظات للمدرب فقط">
        <textarea
          rows={2}
          value={value.trainerNotes ?? ''}
          onChange={(e) => onChange({ trainerNotes: e.target.value })}
          onBlur={onBlurCommit}
          className="rounded-xl border border-warning/40 bg-warning-bg px-4 py-3 text-sm text-navy-darker focus:outline-none"
        />
      </Field>

      {(onSave || onCancel) && (
        <div className="flex justify-end gap-2.5">
          {onCancel && <Button variant="secondary" size="sm" onClick={onCancel}>إلغاء</Button>}
          {onSave && <Button size="sm" onClick={onSave}>{saveLabel}</Button>}
        </div>
      )}
    </div>
  )
}
