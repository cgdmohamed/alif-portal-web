import { useState } from 'react'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Field } from '../components/ui/Input'
import { PlayIcon } from '../components/ui/icons'

export default function MarketingClip() {
  const [range, setRange] = useState([20, 65])

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="أداة قص مقاطع التسويق" subtitle="استخراج جزء من تسجيل لعرضه للجمهور" />

      <Card className="flex h-72 items-center justify-center bg-navy-darker">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo">
          <PlayIcon />
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <div className="relative h-2.5 rounded-full bg-line">
          <div
            className="absolute h-full rounded-full bg-indigo"
            style={{ left: `${range[0]}%`, width: `${range[1] - range[0]}%` }}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={range[0]}
            onChange={(e) => setRange([Number(e.target.value), range[1]])}
            className="absolute inset-0 w-full appearance-none bg-transparent"
          />
          <input
            type="range"
            min={0}
            max={100}
            value={range[1]}
            onChange={(e) => setRange([range[0], Number(e.target.value)])}
            className="absolute inset-0 w-full appearance-none bg-transparent"
          />
        </div>
        <div className="flex justify-between text-[11px] text-ink-faint">
          <span>البداية: {(range[0] * 0.48).toFixed(1)} ث</span>
          <span>المدة: {((range[1] - range[0]) * 0.48).toFixed(1)} ث</span>
          <span>النهاية: {(range[1] * 0.48).toFixed(1)} ث</span>
        </div>
        <Button variant="secondary" size="sm" className="w-fit">▶ معاينة المقطع</Button>
      </Card>

      <Card className="flex flex-col gap-3.5">
        <Field label="عنوان المقطع">
          <input className="rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:border-indigo focus:bg-white focus:outline-none" placeholder="عنوان جذاب للمقطع" />
        </Field>
        <Field label="الوصف">
          <textarea rows={2} className="rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:border-indigo focus:bg-white focus:outline-none" placeholder="وصف مختصر للنشر" />
        </Field>
        <div className="flex flex-wrap gap-4 text-xs text-ink-soft">
          {['الصفحة الرئيسية', 'سوشل ميديا', 'تنزيل عام'].map((o) => (
            <label key={o} className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4 accent-indigo" defaultChecked />
              {o}
            </label>
          ))}
        </div>
        <label className="flex items-center gap-2 rounded-xl bg-warning-bg px-4 py-3 text-xs text-warning">
          <input type="checkbox" className="h-4 w-4 accent-indigo" />
          إزالة العلامة المائية للنشر العام (لا يمكن التراجع)
        </label>
        <Button size="sm" className="w-fit">حفظ ونشر المقطع</Button>
      </Card>
    </div>
  )
}
