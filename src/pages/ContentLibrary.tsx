import { useEffect, useMemo, useRef, useState } from 'react'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Tabs from '../components/ui/Tabs'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import {
  contentLibraryApi,
  typeLabel,
  formatBytes,
  type ApiContentItem,
  type ContentItemType,
} from '../lib/contentLibraryApi'
import { ApiError } from '../lib/api'
import { apiAssetUrl } from '../lib/api'

const tabs = ['الكل', 'الفيديوهات', 'الملفات (PDF)', 'الصور', 'الأنشطة التفاعلية']
const tabToType: Record<string, ContentItemType> = {
  'الفيديوهات': 'video',
  'الملفات (PDF)': 'pdf',
  'الصور': 'image',
  'الأنشطة التفاعلية': 'activity',
}
const folders = ['كل الملفات', 'فيديوهات الرياضيات', 'ورش العمل', 'وسائل التقييم', 'صور وملصقات']
const colors = ['#4338F2', '#3FA9F5', '#807FF9', '#FF9F4A', '#22B07D']

export default function ContentLibrary() {
  const [tab, setTab] = useState(tabs[0])
  const [folder, setFolder] = useState(folders[0])
  const [items, setItems] = useState<ApiContentItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<ApiContentItem | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<ApiContentItem | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function load() {
    contentLibraryApi
      .list()
      .then(setItems)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'تعذر تحميل مكتبة المحتوى'))
  }

  useEffect(load, [])

  async function handleFile(file: File) {
    setUploading(true)
    try {
      const type: ContentItemType = file.type.startsWith('video')
        ? 'video'
        : file.type.startsWith('image')
          ? 'image'
          : file.type === 'application/pdf'
            ? 'pdf'
            : 'activity'
      await contentLibraryApi.upload(file, {
        title: file.name,
        type,
        color: colors[Math.floor(Math.random() * colors.length)],
        folder: folder === 'كل الملفات' ? folders[1] : folder,
        tags: [],
      })
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'تعذر رفع الملف')
    } finally {
      setUploading(false)
    }
  }

  async function remove() {
    if (!confirmDelete) return
    await contentLibraryApi.remove(confirmDelete.id)
    setConfirmDelete(null)
    load()
  }

  const filtered = useMemo(() => {
    let list = items ?? []
    if (tab !== 'الكل') list = list.filter((i) => i.type === tabToType[tab])
    if (folder !== 'كل الملفات') list = list.filter((i) => i.folder === folder)
    return list
  }, [items, tab, folder])

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="مكتبة المحتوى" subtitle="إدارة الفيديوهات والملفات والوسائط" />

      {error && <div className="rounded-xl bg-danger-bg-soft px-4 py-3 text-xs font-semibold text-danger-light">{error}</div>}

      <Tabs items={tabs} active={tab} onChange={setTab} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[200px_1fr]">
        <Card className="flex h-fit flex-col gap-4">
          <div>
            <div className="mb-2 text-xs font-bold text-ink-soft">المجلدات</div>
            <div className="flex flex-col gap-1">
              {folders.map((f) => (
                <button
                  key={f}
                  onClick={() => setFolder(f)}
                  className={`rounded-lg px-3 py-2 text-right text-xs font-semibold transition-colors ${
                    folder === f ? 'bg-indigo text-white' : 'text-ink-soft hover:bg-surface-alt'
                  }`}
                >
                  📁 {f}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
              e.target.value = ''
            }}
          />
          <Card
            onClick={() => !uploading && fileRef.current?.click()}
            className="flex cursor-pointer flex-col items-center gap-2 border-2 border-dashed border-line-checkbox bg-surface-alt py-10 text-center transition-colors hover:bg-surface"
          >
            {uploading ? (
              <span className="text-sm font-bold text-ink">جارٍ الرفع...</span>
            ) : (
              <>
                <span className="text-sm font-bold text-ink">اضغط لرفع ملف</span>
                <span className="text-xs text-ink-faint">يدعم MP4، PDF، JPG، PNG</span>
              </>
            )}
          </Card>

          {items === null ? (
            <Card className="py-10 text-center text-xs text-ink-faint">جارٍ التحميل...</Card>
          ) : filtered.length === 0 ? (
            <Card className="py-10 text-center text-xs text-ink-faint">لا توجد ملفات مطابقة</Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((item) => (
                <Card key={item.id} className="group flex flex-col gap-2.5 overflow-hidden p-0">
                  <div
                    className="relative flex h-32 items-center justify-center"
                    style={{ background: `${item.color}1A` }}
                  >
                    <span className="h-10 w-10 rounded-full" style={{ background: item.color }} />
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-navy-darker/60 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => setPreview(item)}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
                        title="معاينة"
                      >
                        👁
                      </button>
                      <button
                        onClick={() => setConfirmDelete(item)}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white hover:bg-danger-light/70"
                        title="حذف"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 px-4 pb-4">
                    <span className="text-[13px] font-bold text-ink">{item.title}</span>
                    <div className="flex items-center justify-between">
                      <Badge tone="indigo">{typeLabel[item.type]}</Badge>
                      <span className="text-[11px] text-ink-faint">{formatBytes(item.sizeBytes)}</span>
                    </div>
                    <span className="text-[10px] text-ink-faint">{new Date(item.createdAt).toLocaleDateString('ar-SA')}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal open={preview !== null} onClose={() => setPreview(null)} width={560}>
        {preview && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-sans text-lg font-extrabold text-navy">{preview.title}</span>
              <button onClick={() => setPreview(null)} className="text-xl text-ink-faint">✕</button>
            </div>
            {preview.type === 'image' && (
              <img src={apiAssetUrl(preview.storageUrl)} alt={preview.title} className="max-h-96 w-full rounded-xl object-contain" />
            )}
            {preview.type === 'video' && (
              <video src={apiAssetUrl(preview.storageUrl)} controls className="max-h-96 w-full rounded-xl bg-navy-darker" />
            )}
            {preview.type === 'pdf' && (
              <iframe src={apiAssetUrl(preview.storageUrl)} title={preview.title} className="h-96 w-full rounded-xl border border-line" />
            )}
            {preview.type === 'activity' && (
              <a href={apiAssetUrl(preview.storageUrl)} target="_blank" rel="noreferrer" className="rounded-xl bg-surface-alt p-6 text-center text-sm font-bold text-indigo">
                فتح ملف النشاط
              </a>
            )}
            <div className="flex justify-between text-xs text-ink-faint">
              <span>{typeLabel[preview.type]} · {formatBytes(preview.sizeBytes)}</span>
              <span>{new Date(preview.createdAt).toLocaleDateString('ar-SA')}</span>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={confirmDelete !== null} onClose={() => setConfirmDelete(null)} width={420}>
        {confirmDelete && (
          <div className="flex flex-col gap-4 text-center">
            <span className="font-sans text-lg font-extrabold text-navy">حذف الملف؟</span>
            <p className="text-xs text-ink-faint">سيتم حذف «{confirmDelete.title}» نهائيًا من المكتبة.</p>
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
