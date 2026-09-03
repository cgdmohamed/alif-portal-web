import type { ReactNode } from 'react'

type BadgeTone = 'success' | 'warning' | 'danger' | 'indigo' | 'blue' | 'purple' | 'neutral'

const toneClasses: Record<BadgeTone, string> = {
  success: 'text-success bg-success-bg',
  warning: 'text-warning bg-warning-bg',
  danger: 'text-danger bg-danger-bg',
  indigo: 'text-indigo bg-accent-indigo-bg',
  blue: 'text-sky bg-accent-blue-bg',
  purple: 'text-accent-purple bg-accent-purple-bg',
  neutral: 'text-ink-soft bg-surface',
}

export default function Badge({
  tone = 'neutral',
  children,
  className = '',
}: {
  tone?: BadgeTone
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-md px-2 py-1 text-[10px] font-bold ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
