import type { ReactNode } from 'react'
import Card from './Card'

export default function StatCard({
  label,
  value,
  trend,
  trendTone = 'success',
  icon,
  iconBg,
}: {
  label: string
  value: string
  trend?: string
  trendTone?: 'success' | 'neutral'
  icon: ReactNode
  iconBg: string
}) {
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-ink-muted">{label}</span>
        <span
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ background: iconBg }}
        >
          {icon}
        </span>
      </div>
      <div className="font-sans text-2xl font-black text-navy">{value}</div>
      {trend && (
        <div
          className={`text-[11px] font-semibold ${
            trendTone === 'success' ? 'text-success' : 'text-ink-muted'
          }`}
        >
          {trend}
        </div>
      )}
    </Card>
  )
}
