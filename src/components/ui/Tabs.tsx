export default function Tabs({
  items,
  active,
  onChange,
}: {
  items: string[]
  active: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex gap-1 border-b-2 border-line overflow-x-auto">
      {items.map((item) => (
        <button
          key={item}
          onClick={() => onChange(item)}
          className={`whitespace-nowrap px-4 py-2.5 text-[13px] transition-colors ${
            active === item
              ? 'border-b-[3px] border-indigo font-bold text-indigo'
              : 'font-medium text-ink-faint hover:text-ink-soft'
          }`}
          style={{ marginBottom: '-2px' }}
        >
          {item}
        </button>
      ))}
    </div>
  )
}
