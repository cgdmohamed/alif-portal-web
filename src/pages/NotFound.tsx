import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div dir="rtl" className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
      <img src="/assets/logo-mark.png" className="h-14 w-14" alt="ألف" />
      <div className="font-sans text-6xl font-black text-navy">404</div>
      <div className="text-lg font-extrabold text-ink">الصفحة غير موجودة</div>
      <p className="max-w-sm text-sm text-ink-muted">
        الرابط الذي حاولت الوصول إليه غير موجود أو تم نقله.
      </p>
      <Link
        to="/"
        className="rounded-xl bg-indigo px-6 py-3 text-sm font-bold text-white shadow-cta transition-colors hover:bg-navy"
      >
        العودة إلى لوحة التحكم
      </Link>
    </div>
  )
}
