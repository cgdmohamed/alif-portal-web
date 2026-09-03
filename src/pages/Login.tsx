import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../lib/api'

const roleRoutes = {
  platform_admin: '/',
  school_admin: '/school/dashboard',
  teacher: '/teacher/dashboard',
} as const

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const user = await login(email, password)
      const destination = roleRoutes[user.role as keyof typeof roleRoutes]
      if (!destination) {
        setError('هذا الحساب غير مخوّل بالدخول إلى لوحة التحكم هذه')
        return
      }
      navigate(destination)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'حدث خطأ غير متوقع')
    } finally {
      setSubmitting(false)
    }
  }

  function closeForgot() {
    setForgotOpen(false)
    setResetSent(false)
  }

  return (
    <div dir="rtl" className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col items-center justify-center gap-7 overflow-hidden bg-gradient-to-br from-navy via-navy-light to-indigo p-14 md:flex">
        <span className="absolute -left-24 -top-24 h-[340px] w-[340px] rounded-full bg-indigo-light/25" />
        <span className="absolute -right-16 -bottom-20 h-[260px] w-[260px] rounded-full bg-sky/20" />
        <img
          src="/assets/logo-lockup.png"
          className="z-10 h-24 w-auto brightness-0 invert"
          alt="Alef Future"
        />
        <p className="z-10 max-w-md text-center text-lg font-bold leading-loose text-[#DCDBFA]">
          منصّة إدارة متكاملة للمدربين والمدارس لمتابعة أداء الطلاب الموهوبين وإدارة اللقاءات
          والتقارير من مكان واحد
        </p>
        <div className="z-10 mt-2 flex gap-8">
          {[
            ['4,280', 'طالب'],
            ['86', 'مدرسة'],
            ['312', 'مدرب'],
          ].map(([value, label]) => (
            <div key={label} className="text-center">
              <div className="font-sans text-2xl font-black text-white">{value}</div>
              <div className="text-xs text-[#B9B8E8]">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex w-full flex-col justify-center px-10 md:w-1/2 md:px-24">
        <img src="/assets/logo-lockup.png" className="mb-8 h-10 w-auto md:hidden" alt="Alef" />
        <h1 className="mb-2 font-sans text-3xl font-extrabold text-navy">تسجيل الدخول</h1>
        <p className="mb-8 text-sm text-ink-muted">للمدربين، الإدارة، والمدارس المشتركة</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="rounded-xl bg-danger-bg-soft px-4 py-3 text-xs font-semibold text-danger-light">
              {error}
            </div>
          )}
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-ink">البريد الإلكتروني</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-xl border border-line bg-surface px-4 py-[15px] text-sm text-ink focus:border-indigo focus:bg-white focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-ink">كلمة السر</span>
            <div className="flex items-center justify-between rounded-xl border border-line bg-surface px-4 py-[15px] focus-within:border-indigo focus-within:bg-white">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-transparent text-sm text-ink focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="whitespace-nowrap text-xs font-medium text-indigo"
              >
                {showPassword ? 'إخفاء' : 'إظهار'}
              </button>
            </div>
          </label>

          <div className="my-1 flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-ink-muted">
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-indigo" />
              تذكرني
            </label>
            <button
              type="button"
              onClick={() => setForgotOpen(true)}
              className="text-xs font-medium text-indigo"
            >
              نسيت كلمة السر؟
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-2xl bg-indigo py-4 text-sm font-bold text-white shadow-cta transition-colors hover:bg-navy disabled:opacity-60"
          >
            {submitting ? 'جارٍ الدخول...' : 'تسجيل الدخول'}
          </button>

          <div className="mt-8 flex justify-center gap-4 text-xs text-ink-faint">
            <a href="#">الشروط والأحكام</a>
            <a href="#">سياسة الخصوصية</a>
          </div>
        </form>
      </div>

      <Modal open={forgotOpen} onClose={closeForgot} width={420}>
        {resetSent ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success-bg text-2xl text-success">
              ✓
            </span>
            <span className="font-sans text-lg font-extrabold text-navy">تم إرسال الرابط</span>
            <p className="text-xs text-ink-faint">
              تحقق من بريدك الإلكتروني للحصول على رابط إعادة تعيين كلمة السر
            </p>
            <Button size="sm" className="mt-2" onClick={closeForgot}>
              تم
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-sans text-lg font-extrabold text-navy">إعادة تعيين كلمة السر</span>
              <button onClick={closeForgot} className="text-xl text-ink-faint">
                ✕
              </button>
            </div>
            <p className="text-xs text-ink-muted">
              أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة السر
            </p>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-ink">البريد الإلكتروني</span>
              <input
                type="email"
                defaultValue="m.alqahtani@alef.edu.sa"
                className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink focus:border-indigo focus:bg-white focus:outline-none"
              />
            </label>
            <Button size="sm" onClick={() => setResetSent(true)}>
              إرسال رابط إعادة التعيين
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
