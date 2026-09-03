import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import ProgressBar from '../components/ui/ProgressBar'
import Modal from '../components/ui/Modal'
import Switch from '../components/ui/Switch'
import { Field } from '../components/ui/Input'
import { SearchIcon, PlayIcon } from '../components/ui/icons'
import {
  recordingsApi,
  formatDuration,
  formatBytes,
  type ApiRecording,
  type StorageUsage,
} from '../lib/recordingsApi'
import { ApiError } from '../lib/api'

export default function Recordings() {
  const navigate = useNavigate()
  const [recordings, setRecordings] = useState<ApiRecording[] | null>(null)
  const [usage, setUsage] = useState<StorageUsage | null>(null)
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [playing, setPlaying] = useState<ApiRecording | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<ApiRecording | null>(null)
  const [settingsFor, setSettingsFor] = useState<ApiRecording | null>(null)
  const [renameValue, setRenameValue] = useState('')

  function load() {
    recordingsApi
      .list(search || undefined)
      .then(setRecordings)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'تعذر تحميل التسجيلات'))
  }

  useEffect(load, [search])
  useEffect(() => {
    recordingsApi.storageUsage().then(setUsage).catch(() => setUsage(null))
  }, [])

  function openSettings(r: ApiRecording) {
    setSettingsFor(r)
    setRenameValue(r.title)
  }

  async function saveSettings() {
    if (!settingsFor) return
    await recordingsApi.update(settingsFor.id, { title: renameValue })
    setSettingsFor(null)
    load()
  }

  async function togglePublic() {
    if (!settingsFor) return
    const updated = await recordingsApi.update(settingsFor.id, { isPublic: !settingsFor.isPublic })
    setSettingsFor(updated)
    load()
  }

  async function remove() {
    if (!confirmDelete) return
    await recordingsApi.remove(confirmDelete.id)
    setConfirmDelete(null)
    load()
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="مكتبة التسجيلات" />
        <div className="rounded-xl bg-danger-bg-soft px-4 py-6 text-center text-sm text-danger-light">{error}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="مكتبة التسجيلات" subtitle={recordings ? `${recordings.length} تسجيل محفوظ` : undefined} />

      {usage && (
        <Card className="flex items-center justify-between">
          <span className="text-xs font-semibold text-ink-soft">
            استخدام التخزين — {formatBytes(usage.usedBytes)} من {formatBytes(usage.totalBytes)}
          </span>
          <div className="w-56">
            <ProgressBar value={usage.usedPercent} />
          </div>
        </Card>
      )}

      <div className="flex gap-2.5">
        <div className="flex flex-1 items-center gap-2.5 rounded-lg border border-line bg-white px-3.5 py-2.5">
          <SearchIcon />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث في التسجيلات..."
            className="w-full bg-transparent text-xs focus:outline-none"
          />
        </div>
      </div>

      {recordings === null ? (
        <div className="rounded-xl bg-surface-alt px-4 py-8 text-center text-sm text-ink-faint">جارٍ التحميل...</div>
      ) : recordings.length === 0 ? (
        <div className="rounded-xl bg-surface-alt px-4 py-8 text-center text-sm text-ink-faint">لا توجد تسجيلات مطابقة</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recordings.map((r) => (
            <Card key={r.id} className="group flex flex-col gap-2.5 overflow-hidden p-0">
              <div className="relative flex h-32 items-center justify-center bg-navy-darker">
                <button
                  onClick={() => setPlaying(r)}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo transition-transform hover:scale-105"
                >
                  <PlayIcon />
                </button>
                <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white">
                  {formatDuration(r.durationSeconds)}
                </span>
                <span className="absolute top-2 right-2 text-sm">{r.isPublic ? '🌐' : '🔒'}</span>

                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-navy-darker/80 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => setPlaying(r)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
                    title="تشغيل"
                  >
                    ▶
                  </button>
                  <button
                    onClick={() => navigate('/marketing-clip')}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
                    title="قص مقطع"
                  >
                    ✂
                  </button>
                  <button
                    onClick={() => openSettings(r)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
                    title="إعدادات"
                  >
                    ⚙
                  </button>
                  <button
                    onClick={() => setConfirmDelete(r)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white hover:bg-danger-light/70"
                    title="حذف"
                  >
                    🗑
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1 px-4 pb-4">
                <span className="text-[13px] font-bold text-ink">{r.title}</span>
                <span className="text-[11px] text-ink-faint">
                  {r.meeting.classEntity.teacher?.name ?? 'بدون مدرب'} · {new Date(r.createdAt).toLocaleDateString('ar-SA')}
                </span>
                <span className="text-[11px] text-ink-faint">{r.views} مشاهدة · {formatBytes(r.sizeBytes)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={playing !== null} onClose={() => setPlaying(null)} width={640}>
        {playing && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-sans text-lg font-extrabold text-navy">{playing.title}</span>
              <button onClick={() => setPlaying(null)} className="text-xl text-ink-faint">✕</button>
            </div>
            <div className="flex h-64 items-center justify-center rounded-xl bg-navy-darker">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo">
                <PlayIcon />
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={settingsFor !== null} onClose={() => setSettingsFor(null)} width={480}>
        {settingsFor && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-sans text-lg font-extrabold text-navy">إعدادات التسجيل</span>
              <button onClick={() => setSettingsFor(null)} className="text-xl text-ink-faint">✕</button>
            </div>
            <Field label="اسم التسجيل">
              <input
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:border-indigo focus:bg-white focus:outline-none"
              />
            </Field>
            <div className="flex items-center justify-between rounded-xl border border-line-accent bg-surface-alt px-4 py-3">
              <span className="text-xs text-navy-darker">إتاحة عامة (🌐 بدلًا من 🔒 خاص)</span>
              <Switch checked={settingsFor.isPublic} onChange={togglePublic} />
            </div>
            <div className="flex justify-end gap-2.5">
              <Button variant="secondary" size="sm" onClick={() => setSettingsFor(null)}>إلغاء</Button>
              <Button size="sm" onClick={saveSettings}>حفظ</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={confirmDelete !== null} onClose={() => setConfirmDelete(null)} width={420}>
        {confirmDelete && (
          <div className="flex flex-col gap-4 text-center">
            <span className="font-sans text-lg font-extrabold text-navy">حذف التسجيل؟</span>
            <p className="text-xs text-ink-faint">
              سيتم حذف «{confirmDelete.title}» نهائيًا من الخوادم. لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex justify-center gap-2.5">
              <Button variant="secondary" size="sm" onClick={() => setConfirmDelete(null)}>إلغاء</Button>
              <Button variant="danger" size="sm" onClick={remove}>حذف نهائيًا</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
