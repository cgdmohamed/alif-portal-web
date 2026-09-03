export default function ProgressBar({
  value,
  color = '#4338F2',
}: {
  value: number
  color?: string
}) {
  return (
    <div className="h-1.5 w-full rounded-full bg-line">
      <div
        className="h-full rounded-full"
        style={{ width: `${value}%`, background: color }}
      />
    </div>
  )
}
