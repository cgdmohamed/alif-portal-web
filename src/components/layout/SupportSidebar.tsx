import { NavLink } from 'react-router-dom'
import { MeetingsIcon } from '../ui/icons'

export default function SupportSidebar() {
  return (
    <aside className="flex h-screen w-[250px] flex-none flex-col bg-navy py-6">
      <div className="mb-4 flex items-center gap-2.5 border-b border-white/10 px-6 pb-6">
        <img src="/assets/logo-mark.png" className="h-8 w-8 brightness-0 invert" alt="ألف" />
        <div>
          <div className="font-sans text-sm font-extrabold text-white">ألف المستقبل</div>
          <div className="text-[10px] text-white/50">بوابة الدعم</div>
        </div>
      </div>
      <nav className="px-3.5">
        <NavLink
          to="/support"
          className="flex items-center gap-3 rounded-lg bg-indigo/35 px-3.5 py-3 text-[13px] font-bold text-white"
        >
          <MeetingsIcon className="h-[18px] w-[18px]" />
          المحادثات
        </NavLink>
      </nav>
    </aside>
  )
}
