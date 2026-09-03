import Modal from './ui/Modal'
import { getActivityPreview } from './activity-previews'

export default function ActivityPreviewModal({
  activity,
  onClose,
  framing,
}: {
  activity: { title: string; activityType: string } | null
  onClose: () => void
  framing?: string
}) {
  const Preview = activity ? getActivityPreview(activity.activityType) : null

  return (
    <Modal open={activity !== null} onClose={onClose} width={680}>
      {activity && (
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-sans text-lg font-extrabold text-navy">معاينة: {activity.title}</span>
              {framing && <p className="mt-1 text-[11px] text-ink-faint">{framing}</p>}
            </div>
            <button onClick={onClose} className="text-xl text-ink-faint">✕</button>
          </div>
          {Preview ? (
            <Preview />
          ) : (
            <div className="rounded-xl bg-surface-alt p-8 text-center text-xs text-ink-faint">
              لا تتوفر معاينة مرئية لهذا النوع من الأنشطة بعد — «{activity.activityType}»
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
