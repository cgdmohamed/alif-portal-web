import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Tabs from '../components/ui/Tabs'
import Table, { type Column } from '../components/ui/Table'
import Badge from '../components/ui/Badge'
import { SearchIcon } from '../components/ui/icons'
import AddUserModal from '../components/AddUserModal'
import UserDetailPanel from '../components/UserDetailPanel'
import { usersApi, roleLabel, roleColor, statusLabel, type ApiUser, type BackendRole } from '../lib/usersApi'
import { schoolsApi, type School } from '../lib/schoolsApi'
import { ApiError } from '../lib/api'

const tabs = ['الكل', 'ألف المستقبل', 'أخصائي الموهبة', 'إدارة المدرسة', 'ولي أمر', 'طالب']
const roleParamToTab: Record<string, string> = {
  trainer: 'أخصائي الموهبة',
  staff: 'ألف المستقبل',
  school: 'إدارة المدرسة',
  parent: 'ولي أمر',
  student: 'طالب',
}
const tabToRole: Record<string, BackendRole> = {
  'ألف المستقبل': 'platform_admin',
  'أخصائي الموهبة': 'teacher',
  'إدارة المدرسة': 'school_admin',
  'ولي أمر': 'parent',
  'طالب': 'student',
}

const PAGE_SIZE = 5

export default function UsersRoles() {
  const [searchParams] = useSearchParams()
  const roleParam = searchParams.get('role')
  const [active, setActive] = useState(roleParam ? roleParamToTab[roleParam] ?? tabs[0] : tabs[0])
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [users, setUsers] = useState<ApiUser[] | null>(null)
  const [schools, setSchools] = useState<School[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null)
  const [panelUser, setPanelUser] = useState<ApiUser | null>(null)
  const [page, setPage] = useState(1)

  function load() {
    usersApi
      .list()
      .then(setUsers)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'تعذر تحميل المستخدمين'))
  }

  useEffect(load, [])
  useEffect(() => {
    schoolsApi.list().then(setSchools).catch(() => setSchools([]))
  }, [])

  const schoolName = (id: string | null) => schools.find((s) => s.id === id)?.name ?? '—'

  const filtered = useMemo(() => {
    let list = users ?? []
    if (active !== 'الكل') list = list.filter((u) => u.role === tabToRole[active])
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (u) => u.name.toLowerCase().includes(q) || (u.email ?? '').toLowerCase().includes(q),
      )
    }
    return list
  }, [users, active, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function changeTab(t: string) {
    setActive(t)
    setPage(1)
    setSelected(new Set())
  }

  function toggleSelect(id: string) {
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    setSelected((s) => (s.size === paged.length ? new Set() : new Set(paged.map((u) => u.id))))
  }

  async function bulkDisable() {
    await Promise.all([...selected].map((id) => usersApi.update(id, { status: 'disabled' })))
    setSelected(new Set())
    load()
  }

  async function bulkDelete() {
    await Promise.all([...selected].map((id) => usersApi.remove(id)))
    setSelected(new Set())
    load()
  }

  async function rowAction(user: ApiUser, action: 'edit' | 'reset' | 'disable' | 'delete') {
    setMenuOpenFor(null)
    if (action === 'edit') {
      setPanelUser(user)
    } else if (action === 'disable') {
      await usersApi.update(user.id, { status: user.status === 'active' ? 'disabled' : 'active' })
      load()
    } else if (action === 'delete') {
      await usersApi.remove(user.id)
      load()
    }
  }

  const columns: Column<ApiUser>[] = [
    {
      header: '',
      width: '30px',
      render: (u) => (
        <input
          type="checkbox"
          checked={selected.has(u.id)}
          onClick={(e) => e.stopPropagation()}
          onChange={() => toggleSelect(u.id)}
          className="h-3.5 w-3.5 rounded accent-indigo"
        />
      ),
    },
    {
      header: 'الاسم',
      render: (u) => (
        <span className="flex items-center gap-2 text-xs font-semibold text-ink">
          <span className="h-[26px] w-[26px] rounded-full" style={{ background: roleColor[u.role] }} />
          {u.name}
        </span>
      ),
    },
    { header: 'الدور', render: (u) => <span className="text-xs text-ink-soft">{roleLabel[u.role]}</span> },
    { header: 'البريد', render: (u) => <span className="text-[11px] text-ink-faint">{u.email ?? u.phone ?? '—'}</span> },
    { header: 'المدرسة', render: (u) => <span className="text-[11px] text-ink-faint">{schoolName(u.schoolId)}</span> },
    {
      header: 'آخر دخول',
      render: (u) => (
        <span className="text-[11px] text-ink-faint">
          {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('ar-SA') : '—'}
        </span>
      ),
    },
    {
      header: 'الحالة',
      render: (u) => <Badge tone={statusLabel[u.status].tone}>{statusLabel[u.status].label}</Badge>,
    },
    {
      header: '',
      width: '40px',
      render: (u) => (
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpenFor(menuOpenFor === u.id ? null : u.id)}
            className="rounded px-2 py-1 text-ink-faint hover:bg-surface"
          >
            ⋮
          </button>
          {menuOpenFor === u.id && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpenFor(null)} />
              <div className="absolute left-0 top-full z-50 mt-1 w-40 overflow-hidden rounded-lg bg-white py-1 shadow-panel">
                <button onClick={() => rowAction(u, 'edit')} className="block w-full px-3.5 py-2 text-right text-[11px] font-semibold text-ink hover:bg-surface-alt">تعديل</button>
                <button onClick={() => rowAction(u, 'disable')} className="block w-full px-3.5 py-2 text-right text-[11px] font-semibold text-warning hover:bg-surface-alt">{u.status === 'active' ? 'تعطيل' : 'تفعيل'}</button>
                <button onClick={() => rowAction(u, 'delete')} className="block w-full px-3.5 py-2 text-right text-[11px] font-semibold text-danger-light hover:bg-danger-bg-soft">حذف</button>
              </div>
            </>
          )}
        </div>
      ),
    },
  ]

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="المستخدمون والأدوار" />
        <div className="rounded-xl bg-danger-bg-soft px-4 py-6 text-center text-sm text-danger-light">{error}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="المستخدمون والأدوار"
        actions={<Button size="sm" onClick={() => setModalOpen(true)}>+ إضافة مستخدم</Button>}
      />

      <Tabs items={tabs} active={active} onChange={changeTab} />

      <div className="flex items-center gap-2.5">
        <div className="flex flex-1 items-center gap-2.5 rounded-lg border border-line bg-white px-3.5 py-2.5">
          <SearchIcon />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="بحث بالاسم أو البريد..."
            className="w-full bg-transparent text-xs text-ink placeholder:text-ink-faint focus:outline-none"
          />
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-indigo/10 px-4 py-3">
          <span className="text-xs font-bold text-indigo">تم تحديد {selected.size} مستخدم</span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setSelected(new Set())}>إلغاء التحديد</Button>
            <Button variant="secondary" size="sm" onClick={bulkDisable}>تعطيل المحدد</Button>
            <Button variant="danger" size="sm" onClick={bulkDelete}>حذف المحدد</Button>
          </div>
        </div>
      )}

      {users === null ? (
        <div className="rounded-xl bg-surface-alt px-4 py-8 text-center text-sm text-ink-faint">جارٍ التحميل...</div>
      ) : (
        <>
          {paged.length > 0 && (
            <label className="flex w-fit items-center gap-2 text-[11px] text-ink-faint">
              <input
                type="checkbox"
                checked={selected.size === paged.length}
                onChange={toggleSelectAll}
                className="h-3.5 w-3.5 rounded accent-indigo"
              />
              تحديد الكل في هذه الصفحة
            </label>
          )}

          <Table columns={columns} rows={paged} keyFn={(u) => u.id} onRowClick={(u) => setPanelUser(u)} />

          <div className="flex items-center justify-between text-[11px] text-ink-faint">
            <span>
              عرض {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, filtered.length)} من {filtered.length}
            </span>
            <div className="flex gap-1.5">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-line bg-white px-3 py-1.5 disabled:opacity-40"
              >
                السابق
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`rounded-lg px-3 py-1.5 ${p === page ? 'bg-indigo text-white' : 'border border-line bg-white'}`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-line bg-white px-3 py-1.5 disabled:opacity-40"
              >
                التالي
              </button>
            </div>
          </div>
        </>
      )}

      <AddUserModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={() => { setModalOpen(false); load() }} schools={schools} />
      <UserDetailPanel user={panelUser} onClose={() => setPanelUser(null)} onChanged={load} schoolName={panelUser ? schoolName(panelUser.schoolId) : '—'} />
    </div>
  )
}
