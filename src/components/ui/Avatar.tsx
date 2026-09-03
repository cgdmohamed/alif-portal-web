export default function Avatar({
  initials,
  size = 34,
  gradient = 'from-indigo to-indigo-light',
  className = '',
}: {
  initials: string
  size?: number
  gradient?: string
  className?: string
}) {
  return (
    <div
      className={`flex flex-none items-center justify-center rounded-full bg-gradient-to-br font-bold text-white ${gradient} ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  )
}
