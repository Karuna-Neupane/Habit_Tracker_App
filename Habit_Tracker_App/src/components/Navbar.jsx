import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useHabits } from '../context/HabitsContext.jsx'

export default function Navbar() {
  const { user, isAuthenticated } = useAuth()
  const { habits } = useHabits()

  // Count how many habits are done today (live — updates as you toggle habits)
  const doneToday = habits.filter((h) => {
    const today = new Date()
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    return h.completions.includes(key)
  }).length

  return (
    <header className="sticky top-0 z-40 border-b border-paperLine bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-lg font-bold text-ink">Habit Tracker</span>
        </Link>

        {/* Right side: user identity + today's progress, or auth buttons for guests */}
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-emberSoft px-2.5 py-1 font-mono text-xs font-semibold text-ember">
              {doneToday}/{habits.length} today
            </span>
            <div className="flex items-center gap-2">
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="h-7 w-7 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-pineSoft text-xs font-semibold text-pine">
                  {user?.name?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <span className="text-sm font-medium text-ink">{user?.name}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <Link
              to="/login"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-inkSoft transition-colors hover:bg-white/60 hover:text-ink"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-ember px-3 py-1.5 text-sm font-semibold text-white shadow-sm shadow-ember/30 transition-colors hover:bg-ember/90"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
