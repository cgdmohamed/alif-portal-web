import { useEffect, useState } from 'react'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Switch from '../components/ui/Switch'
import Button from '../components/ui/Button'
import { Field } from '../components/ui/Input'
import { autoMessagesApi, type ApiAutoMessageTemplate } from '../lib/autoMessagesApi'
import { ApiError } from '../lib/api'

export default function AutoMessages() {
  const [templates, setTemplates] = useState<ApiAutoMessageTemplate[] | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [body, setBody] = useState('')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function load() {
    autoMessagesApi
      .list()
      .then((rows) => {
        setTemplates(rows)
        if (rows.length > 0) {
          setSelectedId((id) => id ?? rows[0].id)
          setBody((prev) => (prev ? prev : rows[0].body))
        }
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'تعذر تحميل القوالب'))
  }

  useEffect(load, [])

  const selected = templates?.find((t) => t.id === selectedId) ?? null

  function selectTemplate(t: ApiAutoMessageTemplate) {
    setSelectedId(t.id)
    setBody(t.body)
    setSaved(false)
  }

  async function toggle(t: ApiAutoMessageTemplate) {
    await autoMessagesApi.update(t.id, { enabled: !t.enabled })
    load()
  }

  async function saveBody() {
    if (!selected) return
    await autoMessagesApi.update(selected.id, { body })
    setSaved(true)
    load()
    setTimeout(() => setSaved(false), 1500)
  }

  if (error) {
    return <div className="rounded-xl bg-danger-bg-soft px-4 py-6 text-center text-sm text-danger-light">{error}</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="قوالب الرسائل التلقائية" subtitle="إدارة الرسائل التلقائية للطلاب وأولياء الأمور" />

      {templates === null ? (
        <div className="rounded-xl bg-surface-alt px-4 py-8 text-center text-sm text-ink-faint">جارٍ التحميل...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.2fr]">
          <div className="flex flex-col gap-2.5">
            {templates.map((t) => (
              <Card
                key={t.id}
                onClick={() => selectTemplate(t)}
                className={`flex cursor-pointer items-center justify-between ${
                  selectedId === t.id ? 'ring-2 ring-indigo' : ''
                }`}
              >
                <div>
                  <div className="text-[13px] font-bold text-ink">{t.name}</div>
                  <div className="mt-0.5 text-[11px] text-ink-faint">
                    {t.channel} · آخر تعديل {new Date(t.updatedAt).toLocaleDateString('ar-SA')}
                  </div>
                </div>
                <Switch checked={t.enabled} onChange={() => toggle(t)} />
              </Card>
            ))}
          </div>

          {selected && (
            <Card className="flex flex-col gap-3.5">
              <span className="text-sm font-extrabold text-ink">محرر القالب — {selected.name}</span>
              <Field label="نص الرسالة">
                <textarea
                  rows={4}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:border-indigo focus:bg-white focus:outline-none"
                />
              </Field>
              <div className="flex flex-wrap gap-2">
                {['{اسم_الطالب}', '{الدرجة}', '{اسم_الفصل}'].map((v) => (
                  <Badge key={v} tone="indigo">{v}</Badge>
                ))}
              </div>
              <Button size="sm" className="w-fit" onClick={saveBody}>
                {saved ? 'تم الحفظ ✓' : 'حفظ القالب'}
              </Button>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
