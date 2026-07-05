import { Link, useLocation } from 'react-router-dom'
import { useHabits } from '../context/HabitsContext.jsx'

export default function Navbar() {
  const { pathname } = useLocation()
  const { habits }   = useHabits()

  // Count how many habits are done today (for the nav badge)
  const doneToday = habits.filter((h) => {
    const today = new Date()
    const key   = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
    return h.completions.includes(key)
  }).length

  const links = [
    { to: '/',      label: 'Dashboard' },
    { to: '/stats', label: 'Stats'     },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-paperLine bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-lg font-bold text-ink">Habit Tracker</span>
        </Link>

        {/* Nav links — <Link> from react-router-dom (Tutorial PDF) */}
        <nav className="flex items-center gap-1">
          {links.map(({ to, label }) => {
            const active = pathname === to
            return (
              <Link
                key={to}
                to={to}
                className={[
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-pineSoft text-pine'
                    : 'text-inkSoft hover:text-ink hover:bg-white/60',
                ].join(' ')}
              >
                {label}
              </Link>
            )
          })}

          {/* Today progress pill */}
          <span className="ml-2 rounded-full bg-emberSoft px-2.5 py-1 font-mono text-xs font-semibold text-ember">
            {doneToday}/{habits.length} today
          </span>
        </nav>
      </div>
    </header>
  )
}
