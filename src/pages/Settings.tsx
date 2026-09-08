import { useEffect, useState } from 'react'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { Field } from '../components/ui/Input'
import { settingsApi, type PlatformSettings, type ApiPdfTemplate } from '../lib/settingsApi'
import { recordingsApi, formatBytes, type StorageUsage } from '../lib/recordingsApi'
import { ApiError } from '../lib/api'

type ConnState = 'idle' | 'testing' | 'success' | 'not-configured'

export default function Settings() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null)
  const [pdfTemplates, setPdfTemplates] = useState<ApiPdfTemplate[]>([])
  const [usage, setUsage] = useState<StorageUsage | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [platformName, setPlatformName] = useState('')
  const [officialEmail, setOfficialEmail] = useState('')
  const [agoraAppId, setAgoraAppId] = useState('')
  const [smtpHost, setSmtpHost] = useState('')
  const [smtpPort, setSmtpPort] = useState('')
  const [smsGateway, setSmsGateway] = useState('')
  const [smsSenderName, setSmsSenderName] = useState('')

  const [agoraState, setAgoraState] = useState<ConnState>('idle')
  const [mailState, setMailState] = useState<ConnState>('idle')
  const [smsState, setSmsState] = useState<ConnState>('idle')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    settingsApi
      .get()
      .then((s) => {
        setSettings(s)
        setPlatformName(s.platformName)
        setOfficialEmail(s.officialEmail ?? '')
        setAgoraAppId(s.agora.appId ?? '')
        setSmtpHost(s.smtp.host ?? '')
        setSmtpPort(s.smtp.port ? String(s.smtp.port) : '')
        setSmsGateway(s.sms.gateway ?? '')
        setSmsSenderName(s.sms.senderName ?? '')
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'تعذر تحميل الإعدادات'))
    settingsApi.pdfTemplates().then(setPdfTemplates).catch(() => setPdfTemplates([]))
    recordingsApi.storageUsage().then(setUsage).catch(() => setUsage(null))
  }, [])

  async function testConnection(target: 'agora' | 'smtp' | 'sms', setter: (s: ConnState) => void) {
    setter('testing')
    const result = await settingsApi.testConnection(target)
    setter(result.success ? 'success' : 'not-configured')
  }

  async function saveAll() {
    await settingsApi.update({
      platformName,
      officialEmail: officialEmail || undefined,
      agora: { appId: agoraAppId || null },
      smtp: { host: smtpHost || null, port: smtpPort ? Number(smtpPort) : null, encryption: null },
      sms: { gateway: smsGateway || null, senderName: smsSenderName || null },
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (error) {
    return <div className="rounded-xl bg-danger-bg-soft px-4 py-6 text-center text-sm text-danger-light">{error}</div>
  }
  if (!settings) {
    return <div className="rounded-xl bg-surface-alt px-4 py-8 text-center text-sm text-ink-faint">جارٍ التحميل...</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="إعدادات النظام" subtitle="الإعدادات العامة للمنصة" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="flex flex-col gap-3.5">
          <span className="text-sm font-extrabold text-ink">الشركة</span>
          <Field label="اسم المنصة">
            <input value={platformName} onChange={(e) => setPlatformName(e.target.value)} className="rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:border-indigo focus:bg-white focus:outline-none" />
          </Field>
          <Field label="البريد الرسمي">
            <input value={officialEmail} onChange={(e) => setOfficialEmail(e.target.value)} className="rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:border-indigo focus:bg-white focus:outline-none" />
          </Field>
        </Card>

        <Card className="flex flex-col gap-3.5">
          <span className="text-sm font-extrabold text-ink">Agora</span>
          <Field label="App ID (مرجعي فقط)">
            <input value={agoraAppId} onChange={(e) => setAgoraAppId(e.target.value)} className="rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:outline-none" />
          </Field>
          <p className="text-[11px] text-ink-faint">
            بيانات الاتصال الفعلية (App ID/Certificate) تُضبط من متغيرات البيئة على الخادم — هذا الحقل للتوثيق فقط.
          </p>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" className="w-fit" disabled={agoraState === 'testing'} onClick={() => testConnection('agora', setAgoraState)}>
              {agoraState === 'testing' ? 'جارٍ الاختبار…' : 'اختبار الاتصال'}
            </Button>
            {agoraState === 'success' && <Badge tone="success">مُهيأ على الخادم ✓</Badge>}
            {agoraState === 'not-configured' && <Badge tone="warning">غير مُهيأ على الخادم</Badge>}
          </div>
        </Card>

        <Card className="flex flex-col gap-3.5">
          <span className="text-sm font-extrabold text-ink">البريد</span>
          <Field label="SMTP Host">
            <input value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} className="rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:outline-none" />
          </Field>
          <Field label="Port">
            <input value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} className="rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:outline-none" />
          </Field>
          <p className="text-[11px] text-ink-faint">بيانات SMTP الفعلية تُضبط من متغيرات البيئة على الخادم؛ الحقول هنا للتوثيق.</p>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" className="w-fit" disabled={mailState === 'testing'} onClick={() => testConnection('smtp', setMailState)}>
              {mailState === 'testing' ? 'جارٍ الإرسال…' : 'إرسال بريد اختباري'}
            </Button>
            {mailState === 'success' && <Badge tone="success">تم الإرسال ✓</Badge>}
          </div>
        </Card>

        <Card className="flex flex-col gap-3.5 lg:col-span-2">
          <span className="text-sm font-extrabold text-ink">التخزين</span>
          {usage && (
            <>
              <div className="flex items-center justify-between text-xs text-ink-soft">
                <span>استخدام التخزين — {formatBytes(usage.usedBytes)} من {formatBytes(usage.totalBytes)}</span>
                <span className="font-bold text-indigo">{usage.usedPercent}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-line">
                <div className="h-full rounded-full bg-indigo" style={{ width: `${usage.usedPercent}%` }} />
              </div>
            </>
          )}
        </Card>

        <Card className="flex flex-col gap-3.5">
          <span className="text-sm font-extrabold text-ink">SMS</span>
          <Field label="بوابة SMS">
            <input value={smsGateway} onChange={(e) => setSmsGateway(e.target.value)} placeholder="Unifonic" className="rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:outline-none" />
          </Field>
          <Field label="اسم المرسل">
            <input value={smsSenderName} onChange={(e) => setSmsSenderName(e.target.value)} className="rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:outline-none" />
          </Field>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" className="w-fit" disabled={smsState === 'testing'} onClick={() => testConnection('sms', setSmsState)}>
              {smsState === 'testing' ? 'جارٍ الإرسال…' : 'إرسال رسالة اختبار'}
            </Button>
            {smsState === 'success' && <Badge tone="success">تم الإرسال ✓</Badge>}
            {smsState === 'not-configured' && <Badge tone="warning">لا توجد بوابة SMS فعلية</Badge>}
          </div>
        </Card>

        <Card className="flex flex-col gap-3.5">
          <span className="text-sm font-extrabold text-ink">قوالب PDF</span>
          <div className="flex flex-col gap-2">
            {pdfTemplates.length === 0 && <div className="text-xs text-ink-faint">لا توجد قوالب</div>}
            {pdfTemplates.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-xl border border-line bg-white px-4 py-3">
                <span className="text-xs font-semibold text-ink">{t.name}</span>
                <span className="text-[10px] text-ink-faint">آخر تعديل {new Date(t.updatedAt).toLocaleDateString('ar-SA')}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button size="sm" onClick={saveAll}>{saved ? 'تم الحفظ ✓' : 'حفظ كل الإعدادات'}</Button>
      </div>
    </div>
  )
}
