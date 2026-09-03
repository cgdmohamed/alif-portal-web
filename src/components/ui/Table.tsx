import type { ReactNode } from 'react'

export interface Column<T> {
  header: string
  width?: string
  render: (row: T) => ReactNode
}

export default function Table<T>({
  columns,
  rows,
  keyFn,
  onRowClick,
}: {
  columns: Column<T>[]
  rows: T[]
  keyFn: (row: T) => string
  onRowClick?: (row: T) => void
}) {
  return (
    <div className="overflow-hidden rounded-xl2 bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-right">
          <thead>
            <tr className="bg-[#F8F7FB]">
              {columns.map((col) => (
                <th
                  key={col.header}
                  className="px-4 py-3 text-[11px] font-bold text-ink-muted"
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={keyFn(row)}
                onClick={() => onRowClick?.(row)}
                className={`border-t border-line-soft ${
                  onRowClick ? 'cursor-pointer transition-colors hover:bg-surface-alt' : ''
                }`}
              >
                {columns.map((col) => (
                  <td key={col.header} className="px-4 py-3.5 align-middle">
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
