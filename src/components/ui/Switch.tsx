export default function Switch({
  checked,
  onChange,
}: {
  checked: boolean
  onChange?: (value: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange?.(!checked)}
      className={`flex h-[22px] w-[38px] flex-none items-center rounded-full p-[2px] transition-colors ${
        checked ? 'bg-indigo justify-end' : 'bg-line justify-start'
      }`}
    >
      <span className="h-[18px] w-[18px] rounded-full bg-white shadow" />
    </button>
  )
}
