const rightColumn = ['الأسد', 'الشمس', 'الماء']
const leftColumn = ['يجري', 'يزأر', 'يسطع']
// rightColumn[i] connects to leftColumn[pairIndex[i]]
const pairIndex = [1, 2, 0]

const rowHeight = 60
const containerHeight = rowHeight * 3

function centerY(index: number) {
  return index * rowHeight + rowHeight / 2
}

export default function MatchingPreview() {
  return (
    <div className="rounded-xl2 bg-white p-5 shadow-card">
      <div className="mb-3 text-xs font-bold text-ink-soft">صِل كل كلمة بما يناسبها</div>
      <div className="relative flex justify-between" style={{ height: containerHeight }}>
        <div className="flex flex-col justify-between">
          {leftColumn.map((item) => (
            <div
              key={item}
              className="flex items-center rounded-lg bg-surface-alt px-4 text-sm font-semibold text-ink"
              style={{ height: rowHeight - 16 }}
            >
              {item}
            </div>
          ))}
        </div>

        <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 300 ${containerHeight}`} preserveAspectRatio="none">
          {rightColumn.map((_, i) => (
            <line
              key={i}
              x1={230}
              y1={centerY(i)}
              x2={70}
              y2={centerY(pairIndex[i])}
              stroke="#4338F2"
              strokeWidth={2}
              strokeDasharray="1 0"
              opacity={0.6}
            />
          ))}
        </svg>

        <div className="flex flex-col justify-between">
          {rightColumn.map((item) => (
            <div
              key={item}
              className="flex items-center rounded-lg bg-indigo-light/15 px-4 text-sm font-semibold text-navy"
              style={{ height: rowHeight - 16 }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
