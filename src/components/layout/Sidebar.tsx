import { NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'
import {
  DashboardIcon,
  ClassesIcon,
  StudentsIcon,
  TrainersIcon,
  SchoolsIcon,
  ContentIcon,
  MeetingsIcon,
  ReportsIcon,
  SettingsIcon,
} from '../ui/icons'

interface NavItem {
  label: string
  to: string
  icon: (p: { className?: string }) => ReactNode
  end?: boolean
}

interface NavGroup {
  title?: string
  items: NavItem[]
}

const groups: NavGroup[] = [
  {
    items: [{ label: 'لوحة التحكم', to: '/', icon: DashboardIcon, end: true }],
  },
  {
    title: 'الفصول والمحتوى',
    items: [
      { label: 'الفصول والحصص', to: '/classes', icon: ClassesIcon },
      { label: 'إدارة الكتالوج المركزي', to: '/catalog', icon: ContentIcon },
      { label: 'بناء البرنامج', to: '/question-bank', icon: ContentIcon },
      { label: 'مكتبة المحتوى', to: '/content-library', icon: ContentIcon },
    ],
  },
  {
    title: 'المستخدمون والمدارس',
    items: [
      { label: 'المستخدمون والأدوار', to: '/users', icon: StudentsIcon },
      { label: 'المدربون', to: '/users?role=trainer', icon: TrainersIcon },
      { label: 'المدارس', to: '/schools', icon: SchoolsIcon },
      { label: 'الباقات', to: '/packages', icon: SchoolsIcon },
    ],
  },
  {
    title: 'اللقاءات والتسجيلات',
    items: [
      { label: 'التقويم والجدولة', to: '/calendar', icon: MeetingsIcon },
      { label: 'مكتبة التسجيلات', to: '/recordings', icon: MeetingsIcon },
    ],
  },
  {
    title: 'الواجبات والتقييم',
    items: [
      { label: 'الواجبات والاختبارات', to: '/assignments', icon: ReportsIcon },
      { label: 'التصحيح اليدوي', to: '/grading', icon: ReportsIcon },
    ],
  },
  {
    title: 'التقارير والتواصل',
    items: [
      { label: 'التقارير والتحليلات', to: '/reports', icon: ReportsIcon },
      { label: 'قوالب الرسائل', to: '/messages', icon: MeetingsIcon },
      { label: 'الدردشة مع المستخدمين', to: '/support', icon: MeetingsIcon },
    ],
  },
  {
    title: 'النظام',
    items: [
      { label: 'إعدادات النظام', to: '/settings', icon: SettingsIcon },
      { label: 'سجل النشاط', to: '/activity-log', icon: SettingsIcon },
    ],
  },
]

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-[250px] flex-none flex-col overflow-y-auto bg-navy py-6">
      <div className="mb-4 flex items-center gap-2.5 border-b border-white/10 px-6 pb-6">
        <img src="/assets/logo-mark.png" className="h-8 w-8 brightness-0 invert" alt="ألف" />
        <span className="font-sans text-base font-extrabold text-white">ألف المستقبل</span>
      </div>
      <nav className="flex flex-col gap-4 px-3.5">
        {groups.map((group, i) => (
          <div key={i} className="flex flex-col gap-1">
            {group.title && (
              <div className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wide text-white/35">
                {group.title}
              </div>
            )}
            {group.items.map((item) => (
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
          </div>
        ))}
      </nav>
    </aside>
  )
}
