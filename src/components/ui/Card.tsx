import type { HTMLAttributes } from 'react'

export default function Card({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl2 bg-white p-5 shadow-card ${className}`}
      {...rest}
    />
  )
}
