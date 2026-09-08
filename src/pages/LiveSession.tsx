import { useEffect, useRef, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import AgoraRTC, {
  type IAgoraRTCClient,
  type IAgoraRTCRemoteUser,
  type ICameraVideoTrack,
  type ILocalVideoTrack,
  type IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import { Field } from '../components/ui/Input'
import ActivityPreviewModal from '../components/ActivityPreviewModal'
import { meetingsApi, type ApiMeeting, type MeetingSessionBlock } from '../lib/meetingsApi'
import AttendanceModal from '../components/AttendanceModal'

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

type VideoState = 'idle' | 'connecting' | 'connected' | 'error'

/**
 * Video (camera/mic/screen share, local + remote tiles) is real Agora RTC.
 * Per-participant moderation (force-mute someone else, kick, co-host) isn't
 * implemented because it needs a signaling channel or server-side
 * moderation API that doesn't exist yet — rather than fake it, the
 * participants panel only shows real, observable state (who's connected,
 * whether they've published audio/video).
 */
export default function LiveSession() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const state = (location.state ?? {}) as LiveSessionState
  // A bare ?meetingId= link (no router state) works too — makes a live
  // session bookmarkable/shareable instead of only reachable by clicking
  // through from the dashboard's "today's meetings" list.
  const meetingId = state.meetingId ?? searchParams.get('meetingId') ?? undefined

  const [fetchedMeeting, setFetchedMeeting] = useState<ApiMeeting | null>(null)
  useEffect(() => {
    if (state.meetingId || !meetingId) return
    meetingsApi.get(meetingId).then(setFetchedMeeting).catch(() => {})
  }, [meetingId, state.meetingId])

  const sessionTitle = state.title ?? fetchedMeeting?.title ?? 'لقاء مباشر'
  const sessionTrainer = state.trainer ?? fetchedMeeting?.classEntity.teacher?.name ?? ''
  const sessionCount = state.count ?? fetchedMeeting?.classEntity.studentsCount ?? 0
  const isLiveNow = Boolean(state.title || fetchedMeeting)

  const [sessionPlan, setSessionPlan] = useState<MeetingSessionBlock[]>([])
  const [planError, setPlanError] = useState<string | null>(null)

  const [ended, setEnded] = useState(false)
  const [attendanceOpen, setAttendanceOpen] = useState(false)
  const [endOpen, setEndOpen] = useState(false)
  const [endRating, setEndRating] = useState<number | null>(null)
  const [endNote, setEndNote] = useState('')

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

  // ---------- Agora RTC ----------
  const clientRef = useRef<IAgoraRTCClient | null>(null)
  const localTracksRef = useRef<{ mic: IMicrophoneAudioTrack; cam: ICameraVideoTrack } | null>(null)
  const screenTrackRef = useRef<ILocalVideoTrack | null>(null)
  const localVideoRef = useRef<HTMLDivElement>(null)

  const [videoState, setVideoState] = useState<VideoState>('idle')
  const [videoError, setVideoError] = useState<string | null>(null)
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([])
  const [selfMicOn, setSelfMicOn] = useState(true)
  const [selfCamOn, setSelfCamOn] = useState(true)
  const [screenSharing, setScreenSharing] = useState(false)

  useEffect(() => {
    if (!meetingId) return
    meetingsApi
      .sessionPlan(meetingId)
      .then((blocks) => {
        setSessionPlan(blocks)
        setActiveBlockId(blocks[0]?.id ?? null)
      })
      .catch(() => setPlanError('تعذر تحميل خطة الجلسة'))
  }, [meetingId])

  useEffect(() => {
    if (!meetingId) return
    let cancelled = false
    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
    clientRef.current = client

    client.on('user-published', async (user, mediaType) => {
      await client.subscribe(user, mediaType)
      if (mediaType === 'video') {
        setRemoteUsers((prev) => [...prev.filter((u) => u.uid !== user.uid), user])
      } else {
        user.audioTrack?.play()
      }
    })
    client.on('user-unpublished', (user, mediaType) => {
      if (mediaType === 'video') setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid))
    })
    client.on('user-left', (user) => {
      setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid))
    })

    async function connect() {
      try {
        setVideoState('connecting')
        const creds = await meetingsApi.join(meetingId!)
        if (cancelled) return
        await client.join(creds.appId, creds.channelName, creds.token, null)
        const [micTrack, camTrack] = await AgoraRTC.createMicrophoneAndCameraTracks()
        if (cancelled) {
          micTrack.close()
          camTrack.close()
          return
        }
        localTracksRef.current = { mic: micTrack, cam: camTrack }
        await client.publish([micTrack, camTrack])
        if (localVideoRef.current) camTrack.play(localVideoRef.current)
        setVideoState('connected')
      } catch (err) {
        if (!cancelled) {
          setVideoState('error')
          setVideoError(err instanceof Error ? err.message : 'تعذر الاتصال باللقاء — تحقّق من صلاحيات الكاميرا والمايك')
        }
      }
    }
    connect()

    return () => {
      cancelled = true
      localTracksRef.current?.mic.close()
      localTracksRef.current?.cam.close()
      localTracksRef.current = null
      screenTrackRef.current?.close()
      screenTrackRef.current = null
      client.leave().catch(() => {})
      clientRef.current = null
    }
  }, [meetingId])

  async function toggleSelfMic() {
    const tracks = localTracksRef.current
    if (!tracks) return
    await tracks.mic.setEnabled(!selfMicOn)
    setSelfMicOn((v) => !v)
  }

  async function toggleSelfCam() {
    const tracks = localTracksRef.current
    if (!tracks) return
    await tracks.cam.setEnabled(!selfCamOn)
    setSelfCamOn((v) => !v)
  }

  async function stopScreenShare() {
    const client = clientRef.current
    const tracks = localTracksRef.current
    const screenTrack = screenTrackRef.current
    if (screenTrack) {
      await client?.unpublish(screenTrack).catch(() => {})
      screenTrack.close()
      screenTrackRef.current = null
    }
    if (tracks && client) {
      await client.publish(tracks.cam).catch(() => {})
      if (localVideoRef.current) tracks.cam.play(localVideoRef.current)
    }
    setScreenSharing(false)
  }

  async function toggleScreenShare() {
    if (screenSharing) {
      await stopScreenShare()
      return
    }
    const client = clientRef.current
    const tracks = localTracksRef.current
    if (!client) return
    try {
      const created = await AgoraRTC.createScreenVideoTrack({ encoderConfig: '1080p_1' }, 'auto')
      const track = Array.isArray(created) ? created[0] : created
      screenTrackRef.current = track
      if (tracks) await client.unpublish(tracks.cam)
      await client.publish(track)
      if (localVideoRef.current) track.play(localVideoRef.current)
      track.on('track-ended', () => {
        // Fired when the user stops sharing via the browser's own picker UI.
        stopScreenShare()
      })
      setScreenSharing(true)
    } catch {
      // User cancelled the screen picker — nothing to clean up.
    }
  }

  async function endMeeting() {
    if (meetingId && endRating !== null) {
      await meetingsApi.complete(meetingId, { checklist: {}, rating: endRating, note: endNote || undefined })
    }
    localTracksRef.current?.mic.close()
    localTracksRef.current?.cam.close()
    screenTrackRef.current?.close()
    await clientRef.current?.leave().catch(() => {})
    setEndOpen(false)
    setEnded(true)
  }

  function openCompletion(block: MeetingSessionBlock) {
    setCompleting(block)
    setChecklist(completionChecklist.map(() => false))
    setRating(null)
    setCompletionNote('')
  }

  async function saveCompletion() {
    if (!completing || !meetingId || rating === null) return
    const checklistRecord = Object.fromEntries(completionChecklist.map((item, i) => [item, checklist[i]]))
    await meetingsApi.complete(meetingId, { checklist: checklistRecord, rating, note: completionNote || undefined })
    setCompleting(null)
  }

  async function pushToStudents() {
    if (!activeBlock || !meetingId) return
    await meetingsApi.pushActivity(meetingId, activeBlock.id)
    setPushSent(true)
  }

  function closePush() {
    setPushOpen(false)
    setPushSent(false)
  }

  const liveCount = videoState === 'connected' ? remoteUsers.length + 1 : sessionCount ?? 0

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
          className="relative flex flex-1 items-center justify-center overflow-hidden rounded-xl2 bg-navy-darker text-white"
        >
          {ended ? (
            <div className="text-center">
              <div className="mb-2 font-sans text-lg font-extrabold">تم إنهاء اللقاء</div>
              <div className="text-xs text-white/60">تم حفظ تقييم اللقاء وإنهاؤه</div>
            </div>
          ) : !meetingId ? (
            // Preview/no-video context (e.g. opened without a real meeting id).
            <div className="text-center">
              <div className="mb-2 font-sans text-lg font-extrabold">{sessionTitle}</div>
              <div className="text-xs text-white/60">{sessionTrainer} · {sessionCount ?? 0} مشارك</div>
            </div>
          ) : videoState === 'error' ? (
            <div className="text-center">
              <div className="mb-2 font-sans text-sm font-bold text-danger-light">{videoError}</div>
            </div>
          ) : videoState !== 'connected' ? (
            <div className="text-center">
              <div className="mb-2 font-sans text-lg font-extrabold">جارٍ الاتصال باللقاء…</div>
              <div className="text-xs text-white/60">{sessionTrainer}</div>
            </div>
          ) : (
            <>
              {isLiveNow && (
                <div className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-[11px] font-bold text-danger-light">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-danger-light" /> مباشر الآن
                </div>
              )}
              <div className="absolute left-4 top-4 z-10 rounded-full bg-black/40 px-3 py-1.5 text-[11px] font-bold text-white/80">
                {liveCount} مشارك
              </div>
              <div
                className={`grid h-full w-full gap-1.5 p-1.5 ${
                  remoteUsers.length === 0 ? 'grid-cols-1' : remoteUsers.length === 1 ? 'grid-cols-2' : 'grid-cols-2 grid-rows-2'
                }`}
              >
                <div ref={localVideoRef} className="relative overflow-hidden rounded-lg bg-black">
                  <span className="absolute bottom-2 right-2 rounded bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white">أنت</span>
                  {!selfCamOn && (
                    <div className="absolute inset-0 flex items-center justify-center bg-navy-darker">
                      <Avatar initials="أ" size={44} />
                    </div>
                  )}
                </div>
                {remoteUsers.map((user) => (
                  <div
                    key={user.uid}
                    ref={(el) => {
                      if (el && user.videoTrack) user.videoTrack.play(el)
                    }}
                    className="relative overflow-hidden rounded-lg bg-black"
                  >
                    <span className="absolute bottom-2 right-2 rounded bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white">
                      مشارك #{user.uid}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <Card className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selfMicOn ? 'secondary' : 'danger'}
              size="sm"
              disabled={videoState !== 'connected'}
              onClick={toggleSelfMic}
            >
              🎤 {selfMicOn ? 'كتم المايك' : 'إلغاء الكتم'}
            </Button>
            <Button
              variant={selfCamOn ? 'secondary' : 'danger'}
              size="sm"
              disabled={videoState !== 'connected'}
              onClick={toggleSelfCam}
            >
              📷 {selfCamOn ? 'إيقاف الكاميرا' : 'تشغيل الكاميرا'}
            </Button>
            <Button variant="secondary" size="sm" disabled={!meetingId} onClick={() => setAttendanceOpen(true)}>✓ الحضور</Button>
            <Button
              variant={screenSharing ? 'primary' : 'secondary'}
              size="sm"
              disabled={videoState !== 'connected'}
              onClick={toggleScreenShare}
            >
              🖥 {screenSharing ? 'إيقاف مشاركة الشاشة' : 'مشاركة الشاشة'}
            </Button>
          </div>
          <Button variant="danger" size="sm" disabled={!meetingId} onClick={() => setEndOpen(true)}>إنهاء اللقاء</Button>
        </Card>
      </div>

      <Card className="flex w-full flex-col gap-3 lg:w-[340px]">
        <div className="flex gap-1.5 rounded-lg bg-surface p-1">
          {(
            [
              ['plan', 'خطة الجلسة'],
              ['participants', `المشاركون (${liveCount || 1})`],
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
          <div className="flex flex-col gap-2.5 overflow-y-auto">
            <div className="flex items-center gap-2.5">
              <Avatar initials="أ" size={30} />
              <div className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-ink">أنت</span>
              </div>
              <Badge tone={selfMicOn ? 'success' : 'neutral'}>{selfMicOn ? 'الصوت مفعّل' : 'مكتوم'}</Badge>
            </div>
            {remoteUsers.map((user) => (
              <div key={user.uid} className="flex items-center gap-2.5">
                <Avatar initials="؟" size={30} />
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold text-ink">مشارك #{user.uid}</span>
                </div>
                <Badge tone={user.hasAudio ? 'success' : 'neutral'}>{user.hasAudio ? 'الصوت مفعّل' : 'بدون صوت'}</Badge>
              </div>
            ))}
            {remoteUsers.length === 0 && (
              <div className="text-xs text-ink-faint">لا يوجد مشاركون آخرون متصلون بعد</div>
            )}
          </div>
        )}
      </Card>

      <ActivityPreviewModal
        activity={previewActivity}
        onClose={() => setPreviewActivity(null)}
        framing="يُعرض هذا النشاط الآن على شاشة الاجتماع لجميع الطلاب"
      />

      <AttendanceModal meetingId={meetingId} open={attendanceOpen} onClose={() => setAttendanceOpen(false)} />

      <Modal open={endOpen} onClose={() => setEndOpen(false)} width={440}>
        <div className="flex flex-col gap-4">
          <span className="font-sans text-lg font-extrabold text-navy">إنهاء اللقاء</span>
          <Field label="تقييم اللقاء">
            <div className="flex gap-2">
              {ratingOptions.map((option) => (
                <button key={option.value} onClick={() => setEndRating(option.value)} className={`flex-1 rounded-lg border px-2 py-2 text-xs font-bold ${endRating === option.value ? 'border-indigo bg-indigo/10 text-indigo' : 'border-line text-ink-soft'}`}>
                  {option.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="ملاحظة (اختياري)">
            <textarea rows={2} value={endNote} onChange={(event) => setEndNote(event.target.value)} className="rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:border-indigo focus:outline-none" />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEndOpen(false)}>إلغاء</Button>
            <Button variant="danger" size="sm" disabled={endRating === null} onClick={endMeeting}>حفظ وإنهاء</Button>
          </div>
        </div>
      </Modal>

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
                سيفتح هذا النشاط فورًا في تطبيق كل طالب متصل حاليًا باللقاء ({liveCount || sessionCount || 0} طالب).
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

    </div>
  )
}
