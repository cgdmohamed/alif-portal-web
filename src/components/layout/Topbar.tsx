import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SearchIcon, BellIcon } from '../ui/icons'
import Avatar from '../ui/Avatar'
import { useAuth } from '../../context/AuthContext'
import { notificationsApi, type ApiNotification } from '../../lib/notificationsApi'

const navigationByRole = {
  platform_admin: [
    ['لوحة التحكم', 'صفحة', '/'], ['المستخدمون', 'صفحة', '/users'], ['المدارس', 'صفحة', '/schools'],
    ['الفصول', 'صفحة', '/classes'], ['التقارير', 'صفحة', '/reports'], ['التسجيلات', 'صفحة', '/recordings'],
  ],
  school_admin: [
    ['لوحة المدرسة', 'صفحة', '/school/dashboard'], ['الفصول', 'صفحة', '/school/classes'],
    ['المعلمون', 'صفحة', '/school/teachers'], ['الطلاب', 'صفحة', '/school/students'],
  ],
  teacher: [
    ['لوحة المدرب', 'صفحة', '/teacher/dashboard'], ['فصولي', 'صفحة', '/teacher/classes'],
    ['التقويم', 'صفحة', '/calendar'], ['التصحيح', 'صفحة', '/grading'],
  ],
  support_agent: [['المحادثات', 'صفحة', '/support']],
  student: [],
  parent: [],
} as const

function notificationTime(value: string) {
  return new Date(value).toLocaleString('ar-SA', { dateStyle: 'short', timeStyle: 'short' })
}

export default function Topbar({
  name = 'د. فاطمة المقبل',
  role = 'مديرة المنصة',
  initials = 'ف.م',
  settingsPath = '/settings',
}: {
  name?: string
  role?: string
  initials?: string
  settingsPath?: string
}) {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [query, setQuery] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifications, setNotifications] = useState<ApiNotification[]>([])

  useEffect(() => {
    notificationsApi.list().then(setNotifications).catch(() => setNotifications([]))
  }, [])

  const searchIndex = useMemo(
    () => (user ? navigationByRole[user.role].map(([label, type, to]) => ({ label, type, to })) : []),
    [user],
  )
  const unread = notifications.filter((notification) => !notification.read).length

  const results = query.trim()
    ? searchIndex.filter((r) => r.label.includes(query) || r.type.includes(query))
    : []

  function closeAll() {
    setNotifOpen(false)
    setProfileOpen(false)
  }

  async function markAllRead() {
    await notificationsApi.markAllRead()
    setNotifications((rows) => rows.map((row) => ({ ...row, read: true })))
  }

  async function markRead(notification: ApiNotification) {
    if (notification.read) return
    await notificationsApi.markRead(notification.id)
    setNotifications((rows) => rows.map((row) => row.id === notification.id ? { ...row, read: true } : row))
  }

  return (
    <header className="relative flex h-[72px] flex-none items-center justify-between border-b border-line bg-white px-7">
      {(notifOpen || profileOpen || results.length > 0) && (
        <div className="fixed inset-0 z-40" onClick={closeAll} />
      )}

      <div className="relative z-50 w-[340px]">
        <div className="flex items-center gap-2.5 rounded-lg bg-surface px-4 py-2.5">
          <SearchIcon />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="انتقل إلى صفحة..."
            className="w-full bg-transparent text-[13px] text-ink placeholder:text-ink-faint focus:outline-none"
          />
        </div>
        {query.trim() && (
          <div className="absolute top-full right-0 z-50 mt-2 w-full overflow-hidden rounded-xl bg-white shadow-panel">
            {results.length === 0 ? (
              <div className="p-4 text-center text-xs text-ink-faint">لا توجد نتائج مطابقة</div>
            ) : (
              results.map((r) => (
                <button
                  key={r.label}
                  onClick={() => {
                    navigate(r.to)
                    setQuery('')
                  }}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-right text-xs hover:bg-surface-alt"
                >
                  <span className="font-semibold text-ink">{r.label}</span>
                  <span className="text-[10px] text-ink-faint">{r.type}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-5">
        <div className="relative z-50">
          <button
            aria-label="الإشعارات"
            onClick={() => {
              setNotifOpen((o) => !o)
              setProfileOpen(false)
            }}
            className="relative"
          >
            <BellIcon />
            {unread > 0 && (
              <span className="absolute -top-0.5 -left-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-danger-light text-[8px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute top-full left-0 z-50 mt-3 w-80 overflow-hidden rounded-xl bg-white shadow-panel">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <span className="text-xs font-extrabold text-ink">الإشعارات</span>
                <button
                  onClick={markAllRead}
                  className="text-[11px] font-semibold text-indigo"
                >
                  تعليم الكل كمقروء
                </button>
              </div>
              <div className="flex max-h-80 flex-col overflow-y-auto">
                {notifications.length === 0 && (
                  <div className="p-5 text-center text-xs text-ink-faint">لا توجد إشعارات</div>
                )}
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => markRead(n)}
                    className={`flex flex-col gap-1 border-b border-line-soft px-4 py-3 last:border-none ${
                      !n.read ? 'bg-surface-alt' : ''
                    }`}
                  >
                    <span className="text-xs font-semibold text-ink">{n.title}</span>
                    <span className="text-right text-[10px] text-ink-faint">{n.subtitle}</span>
                    <span className="text-[10px] text-ink-faint">{notificationTime(n.createdAt)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative z-50">
          <button
            onClick={() => {
              setProfileOpen((o) => !o)
              setNotifOpen(false)
            }}
            className="flex items-center gap-2.5"
          >
            <Avatar initials={initials} />
            <div className="text-right">
              <div className="text-xs font-bold text-ink">{name}</div>
              <div className="text-[11px] text-ink-faint">{role}</div>
            </div>
          </button>
          {profileOpen && (
            <div className="absolute top-full left-0 z-50 mt-3 w-52 overflow-hidden rounded-xl bg-white py-1.5 shadow-panel">
              <button
                onClick={() => { navigate(settingsPath); closeAll() }}
                className="flex w-full items-center px-4 py-2.5 text-right text-xs font-semibold text-ink hover:bg-surface-alt"
              >
                الملف الشخصي
              </button>
              <button
                onClick={() => { navigate(settingsPath); closeAll() }}
                className="flex w-full items-center px-4 py-2.5 text-right text-xs font-semibold text-ink hover:bg-surface-alt"
              >
                الإعدادات
              </button>
              <div className="my-1 border-t border-line-soft" />
              <button
                onClick={() => { logout(); navigate('/login'); closeAll() }}
                className="flex w-full items-center px-4 py-2.5 text-right text-xs font-semibold text-danger-light hover:bg-danger-bg-soft"
              >
                تسجيل الخروج
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
