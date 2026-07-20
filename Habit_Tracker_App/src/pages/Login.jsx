import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Flame, Calendar, Bot, BarChart2, Sparkles, Quote, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import SimpleFooter from '../components/SimpleFooter.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from || '/'

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]       = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }

    setSubmitting(true)
    try {
      await login({ email, password })
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-73px)]">
      <div className="mx-auto grid max-w-6xl grid-cols-1 lg:grid-cols-2 lg:gap-16 px-4 py-12 lg:py-20 items-center">

        {/* ── Left: branding / content panel (hidden on mobile) ─────────── */}
        <div className="hidden lg:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-pine/20 bg-pineSoft/60 px-4 py-1.5 text-xs font-mono uppercase tracking-widest text-pine mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-pine animate-pulse" />
            Welcome back
            <Sparkles className="h-3 w-3" />
          </div>

          <h2 className="font-display text-4xl font-bold text-ink leading-tight">
            Your streaks missed you.
          </h2>
          <p className="mt-4 max-w-md text-inkSoft leading-relaxed">
            Log back in to pick up exactly where you left off — your habits, streaks,
            calendar, and AI coach are all right where you saved them.
          </p>

          <div className="mt-10 space-y-5">
            {[
              { icon: Flame, title: 'Live streak tracking', desc: 'Every tick recalculates your streak instantly.' },
              { icon: Calendar, title: 'Full history at a glance', desc: 'Weekly and monthly views of every completed day.' },
              { icon: Bot, title: 'AI coaching on demand', desc: 'Get personalised motivation when you need it most.' },
              { icon: BarChart2, title: '30-day progress stats', desc: 'See exactly how consistent you have really been.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pineSoft text-pine">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-display text-sm font-semibold text-ink">{title}</p>
                  <p className="mt-0.5 text-sm text-inkSoft">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-paperLine bg-white/60 p-5">
            <Quote className="h-5 w-5 text-pine mb-2" aria-hidden="true" />
            <p className="text-sm text-inkSoft leading-relaxed italic">
              "The 7-day calendar strip is genius. One glance and I know exactly where I stand."
            </p>
            <p className="mt-3 text-xs font-semibold text-ink">— James K., an early user</p>
          </div>
        </div>

        {/* ── Right: the form (unchanged), just wider ───────────────────── */}
        <div className="w-full max-w-lg mx-auto">
          <div className="mb-6 text-center lg:text-left">
            <p className="font-mono text-xs uppercase tracking-widest text-pine">Welcome back</p>
            <h1 className="mt-1 font-display text-3xl font-bold text-ink">Log in</h1>
            <p className="mt-2 text-sm text-inkSoft">
              Pick up your streaks right where you left off.
            </p>
          </div>

          <div className="rounded-2xl border border-paperLine bg-white/70 p-8 shadow-sm">
            {error && (
              <div className="mb-4 rounded-lg border border-ember/30 bg-emberSoft px-3 py-2 text-sm text-ember">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-paperLine bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-pine"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <div className="mb-1 flex items-baseline justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-ink">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    state={{ email }}
                    className="text-xs font-semibold text-pine hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-paperLine bg-paper px-3 py-2.5 pr-10 text-sm text-ink outline-none focus:border-pine"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-inkSoft hover:text-ink"
                  >
                    {showPassword
                      ? <EyeOff className="h-4 w-4" aria-hidden="true" />
                      : <Eye className="h-4 w-4" aria-hidden="true" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-ember px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-ember/30 transition-colors hover:bg-ember/90 disabled:opacity-60"
              >
                {submitting ? 'Logging in…' : 'Log in'}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-inkSoft">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-pine hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
      <SimpleFooter />
    </div>
  )
}
