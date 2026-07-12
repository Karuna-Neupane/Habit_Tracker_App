import { Link } from 'react-router-dom'
import { CheckCircle2, Flame, BarChart2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import Dashboard from './Dashboard.jsx'

export default function Home() {
  const { isAuthenticated, initializing } = useAuth()

  if (initializing) return null

  // ── Signed in: this IS the habit tracker app ──────────────────────────────
  if (isAuthenticated) {
    return <Dashboard />
  }

  // ── Signed out: landing page introducing the app ──────────────────────────
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-pine">Build better days</p>
      <h1 className="mt-2 font-display text-4xl font-bold text-ink sm:text-5xl">
        Track habits. Build streaks. <br className="hidden sm:block" />
        Actually stick with it.
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-base text-inkSoft">
        Habit Tracker helps you log daily and weekly habits, watch your streaks
        grow, and see your progress at a glance — no clutter, no noise.
      </p>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          to="/register"
          className="w-full max-w-xs rounded-xl bg-ember px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-ember/30 transition-colors hover:bg-ember/90 sm:w-auto"
        >
          Get started — it's free
        </Link>
        <Link
          to="/login"
          className="w-full max-w-xs rounded-xl border border-paperLine bg-white/70 px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-white sm:w-auto"
        >
          I already have an account
        </Link>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
        <Feature
          icon={CheckCircle2}
          title="Daily & weekly habits"
          description="Mark habits done with one tap and watch your streak count climb."
        />
        <Feature
          icon={Flame}
          title="Streak tracking"
          description="Automatic streak calculation keeps you honest and motivated."
        />
        <Feature
          icon={BarChart2}
          title="Progress at a glance"
          description="See how consistent you've been over time on the Stats page."
        />
      </div>
    </div>
  )
}

function Feature({ icon: Icon, title, description }) {
  return (
    <div className="rounded-2xl border border-paperLine bg-white/60 p-5">
      <Icon className="h-6 w-6 text-pine" aria-hidden="true" />
      <p className="mt-2 font-display font-semibold text-ink">{title}</p>
      <p className="mt-1 text-sm text-inkSoft">{description}</p>
    </div>
  )
}
