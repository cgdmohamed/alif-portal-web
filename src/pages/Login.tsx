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
  support_agent: '/support',
} as const

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [otpOpen, setOtpOpen] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { login, requestOtp, loginWithOtp } = useAuth()

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

  function closeOtp() {
    setOtpOpen(false)
    setOtpSent(false)
    setOtpCode('')
    setError(null)
  }

  function goToUserHome(role: string) {
    const destination = roleRoutes[role as keyof typeof roleRoutes]
    if (!destination) throw new ApiError(403, 'هذا الحساب غير مخوّل بالدخول إلى لوحة التحكم هذه')
    navigate(destination)
  }

  async function sendOtp() {
    setError(null)
    try {
      await requestOtp(email)
      setOtpSent(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'تعذر إرسال رمز الدخول')
    }
  }

  async function verifyOtp() {
    setError(null)
    try {
      const user = await loginWithOtp(email, otpCode)
      closeOtp()
      goToUserHome(user.role)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'تعذر التحقق من الرمز')
    }
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
              onClick={() => setOtpOpen(true)}
              className="text-xs font-medium text-indigo"
            >
              الدخول برمز البريد
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-2xl bg-indigo py-4 text-sm font-bold text-white shadow-cta transition-colors hover:bg-navy disabled:opacity-60"
          >
            {submitting ? 'جارٍ الدخول...' : 'تسجيل الدخول'}
          </button>

        </form>
      </div>

      <Modal open={otpOpen} onClose={closeOtp} width={420}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-sans text-lg font-extrabold text-navy">الدخول برمز البريد</span>
              <button onClick={closeOtp} className="text-xl text-ink-faint">
                ✕
              </button>
            </div>
            <p className="text-xs text-ink-muted">
              {otpSent ? 'أدخل رمز التحقق المرسل إلى بريدك' : 'أدخل بريد حسابك وسنرسل رمز دخول صالحًا لخمس دقائق'}
            </p>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-ink">البريد الإلكتروني</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={otpSent}
                className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink focus:border-indigo focus:bg-white focus:outline-none"
              />
            </label>
            {otpSent && (
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-ink">رمز التحقق</span>
                <input value={otpCode} onChange={(event) => setOtpCode(event.target.value)} inputMode="numeric" maxLength={8} className="rounded-xl border border-line bg-surface px-4 py-3 text-center font-mono text-lg tracking-widest focus:border-indigo focus:outline-none" />
              </label>
            )}
            {error && <div className="rounded-lg bg-danger-bg-soft p-3 text-xs text-danger-light">{error}</div>}
            <Button size="sm" disabled={!email || (otpSent && otpCode.length < 4)} onClick={otpSent ? verifyOtp : sendOtp}>
              {otpSent ? 'تحقق وسجل الدخول' : 'إرسال الرمز'}
            </Button>
          </div>
      </Modal>
    </div>
  )
}
