import { NavLink } from 'react-router-dom'
import { DashboardIcon, ClassesIcon, StudentsIcon, TrainersIcon, SchoolsIcon, ContentIcon, KeyIcon, SettingsIcon } from '../ui/icons'

const items = [
  { label: 'لوحة تحكم المدرسة', to: '/school/dashboard', icon: DashboardIcon, end: true },
  { label: 'مكتبة موارد ألف', to: '/school/resources', icon: ContentIcon },
  { label: 'الفصول', to: '/school/classes', icon: ClassesIcon },
  { label: 'المعلمون', to: '/school/teachers', icon: TrainersIcon },
  { label: 'الطلاب', to: '/school/students', icon: StudentsIcon },
  { label: 'أكواد الالتحاق', to: '/school/enrollment-codes', icon: KeyIcon },
  { label: 'الباقة والاشتراك', to: '/school/package', icon: SchoolsIcon },
  { label: 'الإعدادات', to: '/school/settings', icon: SettingsIcon },
]

export default function SchoolSidebar() {
  return (
    <aside className="flex h-screen w-[250px] flex-none flex-col overflow-y-auto bg-navy py-6">
      <div className="mb-4 flex items-center gap-2.5 border-b border-white/10 px-6 pb-6">
        <img src="/assets/logo-mark.png" className="h-8 w-8 brightness-0 invert" alt="ألف" />
        <div>
          <div className="font-sans text-sm font-extrabold text-white">ألف المستقبل</div>
          <div className="text-[10px] text-white/50">بوابة المدرسة</div>
        </div>
      </div>
      <nav className="flex flex-col gap-1 px-3.5">
        {items.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3.5 py-3 text-[13px] transition-colors ${
                isActive
                  ? 'bg-indigo/35 font-bold text-white'
                  : 'font-medium text-[#B9B8E8] hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon className="h-[18px] w-[18px] flex-none" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
