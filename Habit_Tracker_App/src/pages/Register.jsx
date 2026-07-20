import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, Shield, Zap, Star, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import SimpleFooter from '../components/SimpleFooter.jsx'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in every field.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      register({ name, email, password })
      navigate('/', { replace: true })
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
            Join for free
            <Sparkles className="h-3 w-3" />
          </div>

          <h2 className="font-display text-4xl font-bold text-ink leading-tight">
            Start your first streak today.
          </h2>
          <p className="mt-4 max-w-md text-inkSoft leading-relaxed">
            Creating an account takes about 30 seconds. From the moment you log in you get
            full habit tracking, live streaks, and an AI coach in your corner.
          </p>

          <ul className="mt-10 space-y-4">
            {[
              'Unlimited daily and weekly habits',
              'Streaks that recompute the instant you tick a habit',
              'A 7-day calendar strip and 30-day completion stats',
              'AI coaching tailored to your actual habit data',
              'Private by default — your data is tied to your account',
            ].map((text) => (
              <li key={text} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-pineSoft text-pine">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
                <span className="text-sm text-inkSoft leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-paperLine bg-white/60 p-5">
              <Shield className="h-5 w-5 text-pine mb-2" aria-hidden="true" />
              <p className="font-display text-sm font-semibold text-ink">Private first</p>
              <p className="mt-1 text-xs text-inkSoft leading-relaxed">Your habits are yours — no third-party sharing.</p>
            </div>
            <div className="rounded-2xl border border-paperLine bg-white/60 p-5">
              <Zap className="h-5 w-5 text-ember mb-2" aria-hidden="true" />
              <p className="font-display text-sm font-semibold text-ink">Instant updates</p>
              <p className="mt-1 text-xs text-inkSoft leading-relaxed">No reloads — everything updates live.</p>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-ember text-ember" />
            ))}
            <span className="text-xs text-inkSoft">Loved by people building better routines</span>
          </div>
        </div>

        {/* ── Right: the form (unchanged), just wider ───────────────────── */}
        <div className="w-full max-w-lg mx-auto">
          <div className="mb-6 text-center lg:text-left">
            <p className="font-mono text-xs uppercase tracking-widest text-pine">Get started</p>
            <h1 className="mt-1 font-display text-3xl font-bold text-ink">Create your account</h1>
            <p className="mt-2 text-sm text-inkSoft">
              Start tracking habits and building streaks today.
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
                <label htmlFor="name" className="mb-1 block text-sm font-medium text-ink">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-paperLine bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-pine"
                  placeholder="Your name"
                />
              </div>

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
                <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-paperLine bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-pine"
                  placeholder="At least 6 characters"
                />
              </div>

              <div>
                <label htmlFor="confirm" className="mb-1 block text-sm font-medium text-ink">
                  Confirm password
                </label>
                <input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full rounded-xl border border-paperLine bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-pine"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-ember px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-ember/30 transition-colors hover:bg-ember/90 disabled:opacity-60"
              >
                {submitting ? 'Creating account…' : 'Register'}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-inkSoft">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-pine hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
      <SimpleFooter />
    </div>
  )
}
