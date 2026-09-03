import { useState } from 'react'
import Avatar from './ui/Avatar'
import Badge from './ui/Badge'
import Tabs from './ui/Tabs'
import Button from './ui/Button'
import { usersApi, roleLabel, statusLabel, type ApiUser } from '../lib/usersApi'

const tabs = ['الملف الشخصي', 'الصلاحيات', 'النشاط']

export default function UserDetailPanel({
  user,
  onClose,
  onChanged,
  schoolName,
}: {
  user: ApiUser | null
  onClose: () => void
  onChanged: () => void
  schoolName: string
}) {
  const [tab, setTab] = useState(tabs[0])
  const [saving, setSaving] = useState(false)

  if (!user) return null

  async function toggleStatus() {
    if (!user) return
    setSaving(true)
    try {
      await usersApi.update(user.id, { status: user.status === 'active' ? 'disabled' : 'active' })
      onChanged()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-start" onClick={onClose}>
      <div className="absolute inset-0 bg-navy/40" />
      <div
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-full w-full max-w-[440px] flex-col overflow-y-auto bg-white shadow-modal"
      >
        <div className="flex items-start justify-between border-b border-line p-6">
          <div className="flex items-center gap-3">
            <Avatar initials={user.name[0]} size={48} />
            <div>
              <div className="text-sm font-extrabold text-ink">{user.name}</div>
              <div className="text-xs text-ink-faint">{roleLabel[user.role]} · {schoolName}</div>
              <Badge tone={statusLabel[user.status].tone} className="mt-1.5">
                {statusLabel[user.status].label}
              </Badge>
            </div>
          </div>
          <button onClick={onClose} className="text-xl text-ink-faint">✕</button>
        </div>

        <div className="px-6 pt-4">
          <Tabs items={tabs} active={tab} onChange={setTab} />
        </div>

        <div className="flex-1 p-6">
          {tab === 'الملف الشخصي' && (
            <div className="flex flex-col gap-3.5 text-xs">
              <div>
                <div className="mb-1 text-ink-faint">البريد الإلكتروني</div>
                <div className="font-semibold text-ink">{user.email ?? '—'}</div>
              </div>
              <div>
                <div className="mb-1 text-ink-faint">رقم الجوال</div>
                <div className="font-semibold text-ink">{user.phone ?? '—'}</div>
              </div>
              <div>
                <div className="mb-1 text-ink-faint">المدرسة</div>
                <div className="font-semibold text-ink">{schoolName}</div>
              </div>
              <div>
                <div className="mb-1 text-ink-faint">آخر دخول</div>
                <div className="font-semibold text-ink">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('ar-SA') : '—'}
                </div>
              </div>
              <div>
                <div className="mb-1 text-ink-faint">تاريخ الانضمام</div>
                <div className="font-semibold text-ink">{new Date(user.createdAt).toLocaleDateString('ar-SA')}</div>
              </div>
            </div>
          )}

          {tab === 'الصلاحيات' && (
            <div className="rounded-lg bg-surface-alt p-4 text-center text-xs text-ink-faint">
              إدارة الصلاحيات التفصيلية غير متاحة بعد لهذا الدور — الصلاحيات محددة حاليًا حسب الدور العام للمستخدم.
            </div>
          )}

          {tab === 'النشاط' && (
            <div className="rounded-lg bg-surface-alt p-4 text-center text-xs text-ink-faint">
              سجل نشاط خاص بكل مستخدم غير متاح بعد — راجع سجل النشاط العام للمنصة من صفحة «سجل النشاط».
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2.5 border-t border-line p-6">
          <Button variant="danger" size="sm" disabled={saving} onClick={toggleStatus}>
            {user.status === 'active' ? 'تعطيل الحساب' : 'تفعيل الحساب'}
          </Button>
          <Button size="sm" onClick={onClose}>إغلاق</Button>
        </div>
      </div>
    </div>
  )
}
