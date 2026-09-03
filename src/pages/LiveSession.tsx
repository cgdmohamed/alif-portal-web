import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import { Field } from '../components/ui/Input'
import ActivityPreviewModal from '../components/ActivityPreviewModal'
import { initialParticipants } from '../data/liveSessionParticipants'
import { meetingsApi, type MeetingSessionBlock } from '../lib/meetingsApi'

interface LiveSessionState {
  meetingId?: string
  title?: string
  trainer?: string
  className?: string
  count?: number
}

const channelLabels: Record<string, string> = {
  trainer_guide_only: 'دليل المدرب فقط',
  shared_live_screen: 'عرض على شاشة مشتركة',
  student_synchronous: 'تفاعل متزامن للطالب',
  student_async_homework: 'واجب لاحق',
}

const ratingOptions: { label: string; value: number }[] = [
  { label: 'ممتاز', value: 5 },
  { label: 'جيد', value: 3 },
  { label: 'يحتاج تحسين', value: 1 },
]
const completionChecklist = ['تم شرح الهدف من النشاط', 'شارك جميع الطلاب المتاحين', 'تم توثيق الملاحظات']

function formatDuration(minutes: number) {
  return `${String(minutes).padStart(2, '0')}:00`
}

/**
 * NOTE: participants/mute/kick/poll/whiteboard below are local UI-only —
 * there is no backend for live participant rosters or in-call collaboration
 * tools (the Zoom integration is stubbed, not a real video SDK). Session
 * plan / push-activity / completion ARE wired to the real API.
 */
export default function LiveSession() {
  const location = useLocation()
  const state = (location.state ?? {}) as LiveSessionState
  const sessionTitle = state.title ?? 'لقاء مباشر'
  const sessionTrainer = state.trainer ?? ''
  const isLiveNow = Boolean(state.title)

  const [sessionPlan, setSessionPlan] = useState<MeetingSessionBlock[]>([])
  const [planError, setPlanError] = useState<string | null>(null)

  const [pollOpen, setPollOpen] = useState(false)
  const [pollLaunched, setPollLaunched] = useState(false)
  const [whiteboard, setWhiteboard] = useState(false)
  const [muted, setMuted] = useState(false)
  const [ended, setEnded] = useState(false)
  const [participants, setParticipants] = useState(initialParticipants)
  const [menuFor, setMenuFor] = useState<string | null>(null)
  const [alertSent, setAlertSent] = useState<string | null>(null)

  const [leftTab, setLeftTab] = useState<'plan' | 'participants'>('plan')
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null)
  const activeBlock = sessionPlan.find((b) => b.id === activeBlockId) ?? null

  const [previewActivity, setPreviewActivity] = useState<{ title: string; activityType: string } | null>(null)
  const [pushOpen, setPushOpen] = useState(false)
  const [pushSent, setPushSent] = useState(false)
  const [completing, setCompleting] = useState<MeetingSessionBlock | null>(null)
  const [checklist, setChecklist] = useState<boolean[]>(completionChecklist.map(() => false))
  const [rating, setRating] = useState<number | null>(null)
  const [completionNote, setCompletionNote] = useState('')

  useEffect(() => {
    if (!state.meetingId) return
    meetingsApi
      .sessionPlan(state.meetingId)
      .then((blocks) => {
        setSessionPlan(blocks)
        setActiveBlockId(blocks[0]?.id ?? null)
      })
      .catch(() => setPlanError('تعذر تحميل خطة الجلسة'))
  }, [state.meetingId])

  function toggleMuteOne(name: string) {
    setParticipants((ps) => ps.map((p) => (p.name === name ? { ...p, muted: !p.muted } : p)))
    setMenuFor(null)
  }

  function toggleCohost(name: string) {
    setParticipants((ps) => ps.map((p) => (p.name === name ? { ...p, cohost: !p.cohost } : p)))
    setMenuFor(null)
  }

  function kick(name: string) {
    setParticipants((ps) => ps.filter((p) => p.name !== name))
    setMenuFor(null)
  }

  function alertStudent(name: string) {
    setMenuFor(null)
    setAlertSent(name)
    setTimeout(() => setAlertSent(null), 2000)
  }

  function openCompletion(block: MeetingSessionBlock) {
    setCompleting(block)
    setChecklist(completionChecklist.map(() => false))
    setRating(null)
    setCompletionNote('')
  }

  async function saveCompletion() {
    if (!completing || !state.meetingId || rating === null) return
    const checklistRecord = Object.fromEntries(completionChecklist.map((item, i) => [item, checklist[i]]))
    await meetingsApi.complete(state.meetingId, { checklist: checklistRecord, rating, note: completionNote || undefined })
    setCompleting(null)
  }

  async function pushToStudents() {
    if (!activeBlock || !state.meetingId) return
    await meetingsApi.pushActivity(state.meetingId, activeBlock.id)
    setPushSent(true)
  }

  function closePush() {
    setPushOpen(false)
    setPushSent(false)
  }

  return (
    <div dir="rtl" className="flex h-[calc(100vh-56px)] flex-col gap-4 lg:flex-row">
      <div className="flex flex-1 flex-col gap-3">
        {activeBlock && !ended && (
          <Card className="flex flex-col gap-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="text-sm font-extrabold text-ink">{activeBlock.title}</div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo">{formatDuration(activeBlock.durationMinutes)}</span>
                  {activeBlock.type === 'activity' && activeBlock.executionMode && <Badge tone="indigo">{activeBlock.executionMode}</Badge>}
                  <Badge tone="neutral">
                    {activeBlock.type === 'lecture' ? 'محاضرة' : channelLabels[activeBlock.deliveryChannel ?? ''] ?? '—'}
                  </Badge>
                </div>
              </div>

              {activeBlock.type === 'activity' && (
                <div>
                  {activeBlock.deliveryChannel === 'shared_live_screen' && (
                    <Button size="sm" onClick={() => setPreviewActivity({ title: activeBlock.title, activityType: activeBlock.activityType ?? '' })}>عرض للطلاب</Button>
                  )}
                  {activeBlock.deliveryChannel === 'student_synchronous' && (
                    <Button size="sm" className="shadow-cta" onClick={() => setPushOpen(true)}>🚀 أرسل للطلاب الآن</Button>
                  )}
                  {activeBlock.deliveryChannel === 'trainer_guide_only' && (
                    <Button variant="secondary" size="sm" onClick={() => openCompletion(activeBlock)}>تسجيل الإتمام</Button>
                  )}
                  {activeBlock.deliveryChannel === 'student_async_homework' && (
                    <Badge tone="neutral">سيُرسل كواجب تلقائيًا بعد اللقاء</Badge>
                  )}
                </div>
              )}
            </div>

            {activeBlock.type === 'activity' && (
              <>
                {activeBlock.instructionsText && <div className="text-xs leading-relaxed text-ink-soft">{activeBlock.instructionsText}</div>}
                {activeBlock.materialsNeeded && (
                  <div className="text-[11px] text-ink-faint">📎 المواد المطلوبة: {activeBlock.materialsNeeded}</div>
                )}
                {activeBlock.trainerNotes && (
                  <div className="rounded-lg bg-warning-bg px-3.5 py-2.5 text-[11px] text-navy-darker">
                    🔒 ملاحظات للمدرب فقط: {activeBlock.trainerNotes}
                  </div>
                )}
              </>
            )}
          </Card>
        )}

        <div
          className={`flex flex-1 items-center justify-center rounded-xl2 text-white transition-colors ${
            whiteboard ? 'bg-white text-navy' : 'bg-navy-darker'
          }`}
        >
          {ended ? (
            <div className="text-center">
              <div className="mb-2 font-sans text-lg font-extrabold">تم إنهاء اللقاء</div>
              <div className="text-xs text-white/60">تم حفظ الحضور والتسجيل بنجاح</div>
            </div>
          ) : whiteboard ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 border-4 border-dashed border-line">
              <span className="text-3xl">🖊</span>
              <div className="text-sm font-bold text-ink-soft">السبورة الذكية — جاهزة للرسم والمشاركة</div>
            </div>
          ) : (
            <div className="text-center">
              {isLiveNow && (
                <div className="mb-2 flex items-center justify-center gap-1.5 text-[11px] font-bold text-danger-light">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-danger-light" /> مباشر الآن
                </div>
              )}
              <div className="mb-2 font-sans text-lg font-extrabold">{sessionTitle}</div>
              <div className="text-xs text-white/60">{sessionTrainer} · {state.count ?? participants.length} مشارك</div>
              {muted && <Badge tone="warning" className="mt-3">تم كتم كل المشاركين</Badge>}
            </div>
          )}
        </div>
        <Card className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => setMuted((m) => !m)}>
              🎤 {muted ? 'إلغاء كتم الكل' : 'كتم الكل'}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setPollOpen(true)}>📊 استطلاع</Button>
            <Button
              variant={whiteboard ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setWhiteboard((w) => !w)}
            >
              🖊 السبورة الذكية
            </Button>
            <Button variant="secondary" size="sm">🖥 مشاركة الشاشة</Button>
          </div>
          <Button variant="danger" size="sm" onClick={() => setEnded(true)}>إنهاء اللقاء</Button>
        </Card>
      </div>

      <Card className="flex w-full flex-col gap-3 lg:w-[340px]">
        <div className="flex gap-1.5 rounded-lg bg-surface p-1">
          {(
            [
              ['plan', 'خطة الجلسة'],
              ['participants', `المشاركون (${participants.length})`],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setLeftTab(value)}
              className={`flex-1 rounded-md py-2 text-[11px] font-bold transition-colors ${
                leftTab === value ? 'bg-white text-indigo shadow-card' : 'text-ink-faint'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {leftTab === 'plan' ? (
          <div className="flex flex-col gap-1.5 overflow-y-auto">
            {planError && <div className="text-xs text-danger-light">{planError}</div>}
            {!planError && sessionPlan.length === 0 && (
              <div className="text-xs text-ink-faint">لم يتم تحديد خطة جلسة لهذا اللقاء بعد</div>
            )}
            {sessionPlan.map((b, i) => (
              <button
                key={b.id}
                onClick={() => setActiveBlockId(b.id)}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-right transition-colors ${
                  activeBlockId === b.id ? 'bg-indigo/10 ring-1 ring-indigo' : 'bg-surface-alt hover:bg-surface'
                }`}
              >
                <span className="flex h-6 w-6 flex-none items-center justify-center rounded-md bg-white text-[10px] font-bold text-ink-soft">
                  {i + 1}
                </span>
                <span className="flex-1 text-xs font-semibold text-ink">
                  {b.type === 'lecture' ? '📖' : '🎯'} {b.title}
                </span>
                <span className="text-[10px] text-ink-faint">{b.durationMinutes}د</span>
              </button>
            ))}
          </div>
        ) : (
          <>
            {alertSent && (
              <div className="rounded-lg bg-success-bg px-3 py-2 text-[11px] font-semibold text-success">
                تم إرسال تنبيه إلى {alertSent}
              </div>
            )}
            <div className="flex flex-col gap-2.5 overflow-y-auto">
              {participants.map((p) => (
                <div key={p.name} className="flex items-center gap-2.5">
                  <Avatar initials={p.name[0]} size={30} />
                  <div className="flex-1 min-w-0">
                    <span className="block truncate text-xs font-semibold text-ink">{p.name}</span>
                    {p.cohost && <span className="text-[10px] text-indigo">مضيف مساعد</span>}
                  </div>
                  <Badge tone={muted || p.muted ? 'neutral' : p.tone}>{muted || p.muted ? 'مكتوم' : p.status}</Badge>
                  <div className="relative">
                    <button
                      onClick={() => setMenuFor(menuFor === p.name ? null : p.name)}
                      className="rounded px-1.5 py-1 text-ink-faint hover:bg-surface"
                    >
                      ⋮
                    </button>
                    {menuFor === p.name && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setMenuFor(null)} />
                        <div className="absolute left-0 top-full z-50 mt-1 w-40 overflow-hidden rounded-lg bg-white py-1 shadow-panel">
                          <button onClick={() => alertStudent(p.name)} className="block w-full px-3.5 py-2 text-right text-[11px] font-semibold text-ink hover:bg-surface-alt">تنبيه للطالب</button>
                          <button onClick={() => toggleMuteOne(p.name)} className="block w-full px-3.5 py-2 text-right text-[11px] font-semibold text-ink hover:bg-surface-alt">{p.muted ? 'إلغاء الكتم' : 'كتم المايك'}</button>
                          <button onClick={() => toggleCohost(p.name)} className="block w-full px-3.5 py-2 text-right text-[11px] font-semibold text-indigo hover:bg-surface-alt">{p.cohost ? 'إزالة صلاحية مضيف' : 'مشاركة صلاحيات مضيف'}</button>
                          <button onClick={() => kick(p.name)} className="block w-full px-3.5 py-2 text-right text-[11px] font-semibold text-danger-light hover:bg-danger-bg-soft">طرد من اللقاء</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      <ActivityPreviewModal
        activity={previewActivity}
        onClose={() => setPreviewActivity(null)}
        framing="يُعرض هذا النشاط الآن على شاشة الاجتماع لجميع الطلاب"
      />

      <Modal open={pushOpen} onClose={closePush} width={480}>
        {activeBlock?.type === 'activity' && (
          pushSent ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success-bg text-2xl text-success">✓</span>
              <span className="font-sans text-lg font-extrabold text-navy">تم الإرسال للطلاب</span>
              <p className="text-xs text-ink-faint">سيظهر «{activeBlock.title}» الآن في تطبيق كل طالب متصل</p>
              <Button size="sm" className="mt-2" onClick={closePush}>تم</Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 text-center">
              <span className="font-sans text-lg font-extrabold text-navy">إرسال «{activeBlock.title}» للطلاب الآن؟</span>
              <p className="text-xs text-ink-faint">
                سيفتح هذا النشاط فورًا في تطبيق كل طالب متصل حاليًا باللقاء ({state.count ?? participants.length} طالب).
              </p>
              <div className="flex justify-center gap-2.5">
                <Button variant="secondary" size="sm" onClick={closePush}>إلغاء</Button>
                <Button size="sm" onClick={pushToStudents}>إرسال الآن</Button>
              </div>
            </div>
          )
        )}
      </Modal>

      <Modal open={completing !== null} onClose={() => setCompleting(null)} width={480}>
        {completing && (
          <div className="flex flex-col gap-4">
            <span className="font-sans text-lg font-extrabold text-navy">تسجيل إتمام: {completing.title}</span>
            <div className="flex flex-col gap-2">
              {completionChecklist.map((item, i) => (
                <label key={item} className="flex items-center gap-2.5 rounded-lg bg-surface-alt px-3.5 py-2.5">
                  <input
                    type="checkbox"
                    checked={checklist[i]}
                    onChange={() =>
                      setChecklist((cs) => cs.map((c, idx) => (idx === i ? !c : c)))
                    }
                    className="h-4 w-4 accent-indigo"
                  />
                  <span className="text-xs text-ink">{item}</span>
                </label>
              ))}
            </div>
            <Field label="تقييم المشاركة">
              <div className="flex gap-2">
                {ratingOptions.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setRating(r.value)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${
                      rating === r.value ? 'border-indigo bg-indigo/10 text-indigo' : 'border-line text-ink-soft hover:bg-surface-alt'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="ملاحظة (اختياري)">
              <textarea
                rows={2}
                value={completionNote}
                onChange={(e) => setCompletionNote(e.target.value)}
                className="rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:border-indigo focus:bg-white focus:outline-none"
              />
            </Field>
            <div className="flex justify-end gap-2.5">
              <Button variant="secondary" size="sm" onClick={() => setCompleting(null)}>إلغاء</Button>
              <Button size="sm" disabled={rating === null} onClick={saveCompletion}>حفظ الإتمام</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={pollOpen} onClose={() => { setPollOpen(false); setPollLaunched(false) }} width={520}>
        {pollLaunched ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success-bg text-2xl text-success">✓</span>
            <span className="font-sans text-lg font-extrabold text-navy">تم إطلاق الاستطلاع</span>
            <p className="text-xs text-ink-faint">سيظهر الاستطلاع لجميع الطلاب المتصلين الآن</p>
            <Button size="sm" className="mt-2" onClick={() => { setPollOpen(false); setPollLaunched(false) }}>تم</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-sans text-lg font-extrabold text-navy">استطلاع سريع</span>
              <button onClick={() => setPollOpen(false)} className="text-xl text-ink-faint">✕</button>
            </div>
            <Field label="سؤال الاستطلاع">
              <input
                defaultValue="ما مدى وضوح الشرح حتى الآن؟"
                className="rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:border-indigo focus:bg-white focus:outline-none"
              />
            </Field>
            <div className="flex flex-col gap-2">
              {['واضح جدًا', 'واضح إلى حد ما', 'بحاجة لإعادة الشرح'].map((opt, i) => (
                <input
                  key={i}
                  defaultValue={opt}
                  className="rounded-xl border border-line bg-surface px-4 py-2.5 text-xs focus:border-indigo focus:bg-white focus:outline-none"
                />
              ))}
            </div>
            <Button size="sm" onClick={() => setPollLaunched(true)}>إطلاق الاستطلاع</Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
