import type { InputHTMLAttributes, ReactNode } from 'react'

export function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-ink">{label}</span>
      {children}
    </label>
  )
}

export default function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-indigo focus:bg-white focus:outline-none"
      {...props}
    />
  )
}
