import type { ReactNode } from 'react'

export default function Modal({
  open,
  onClose,
  children,
  width = 820,
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
  width?: number
}) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/55 p-6"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full overflow-y-auto rounded-xl4 bg-white p-9 shadow-modal"
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
