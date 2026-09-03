import { NavLink } from 'react-router-dom'
import { DashboardIcon, ClassesIcon, ReportsIcon, MeetingsIcon, SettingsIcon } from '../ui/icons'

const items = [
  { label: 'لوحة تحكم المدرب', to: '/teacher/dashboard', icon: DashboardIcon, end: true },
  { label: 'فصولي', to: '/teacher/classes', icon: ClassesIcon },
  { label: 'التقويم واللقاءات', to: '/calendar', icon: MeetingsIcon },
  { label: 'التصحيح اليدوي', to: '/grading', icon: ReportsIcon },
  { label: 'الإعدادات', to: '/teacher/settings', icon: SettingsIcon },
]

export default function TeacherSidebar() {
  return (
    <aside className="flex h-screen w-[250px] flex-none flex-col overflow-y-auto bg-navy py-6">
      <div className="mb-4 flex items-center gap-2.5 border-b border-white/10 px-6 pb-6">
        <img src="/assets/logo-mark.png" className="h-8 w-8 brightness-0 invert" alt="ألف" />
        <div>
          <div className="font-sans text-sm font-extrabold text-white">ألف المستقبل</div>
          <div className="text-[10px] text-white/50">بوابة المدرب</div>
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
