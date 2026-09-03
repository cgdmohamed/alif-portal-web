import Badge from '../ui/Badge'

const items = [
  { label: 'حل المشكلات بطرق إبداعية', checked: true },
  { label: 'العمل ضمن فريق', checked: true },
  { label: 'التواصل الفعّال', checked: true },
  { label: 'التفكير النقدي', checked: false },
  { label: 'إدارة الوقت', checked: true },
  { label: 'المرونة والتكيّف', checked: false },
  { label: 'القيادة', checked: true },
  { label: 'الفضول المعرفي', checked: true },
]

const justifyAfterIndex = 2

export default function RankingSelectionPreview() {
  return (
    <div className="rounded-xl2 bg-white p-5 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-bold text-ink-soft">اختر المهارات الأهم من وجهة نظرك</span>
        <Badge tone="indigo">7 / 10 محدد</Badge>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <div key={item.label} className="flex flex-col gap-2">
            <label className="flex items-center gap-2.5 rounded-lg bg-surface-alt px-3.5 py-2.5">
              <span
                className={`flex h-4 w-4 flex-none items-center justify-center rounded ${
                  item.checked ? 'bg-indigo' : 'border border-line-checkbox bg-white'
                }`}
              >
                {item.checked && <span className="text-[10px] font-bold text-white">✓</span>}
              </span>
              <span className="text-xs font-semibold text-ink">{item.label}</span>
            </label>
            {i === justifyAfterIndex && (
              <input
                disabled
                placeholder="لماذا اخترت هذا؟"
                className="mx-1 rounded-lg border border-dashed border-line-checkbox bg-surface px-3 py-2 text-[11px] text-ink-faint"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
