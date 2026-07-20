import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useHabits } from '../context/HabitsContext.jsx'

// All public sections in the order they appear on the Home page.
// `href` matches the `id` on each <section> in Home.jsx.
const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'AI Coach', href: '#ai-coach' },
  { label: 'About', href: '#about' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Testimonials', href: '#testimonials' },
]

export default function Navbar() {
  const { user, isAuthenticated } = useAuth()
  const { habits } = useHabits()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [active, setActive] = useState('#home')

  const isHome = pathname === '/'

  const doneToday = habits.filter((h) => {
    const today = new Date()
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    return h.completions?.includes(key)
  }).length

  // Smooth-scroll to section and mark it active
  function handleNavClick(e, href) {
    e.preventDefault()
    setActive(href)
    setMenuOpen(false)
    const el = document.querySelector(href)
    if (el) {
      // Offset for the sticky navbar height (~57 px)
      const top = el.getBoundingClientRect().top + window.scrollY - 64
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-paperLine bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 gap-4">

        {/* ── Brand ──────────────────────────────────────────────────────── */}
        <Link
          to="/"
          onClick={() => { setActive('#home'); setMenuOpen(false) }}
          className="flex items-center gap-2 shrink-0"
        >
          <span className="font-display text-xl md:text-2xl lg:text-3xl font-bold text-ink">
            Habitra
          </span>
        </Link>

        {/* ── Centre nav — only on public home page when logged out ───────── */}
        {isHome && !isAuthenticated && (
          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map(({ label, href }) => {
              const isActive = active === href
              return (
                <a
                  key={href}
                  href={href}
                  onClick={(e) => handleNavClick(e, href)}
                  className={[
                    'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap',
                    isActive
                      ? 'bg-pineSoft text-pine'
                      : 'text-inkSoft hover:bg-white/70 hover:text-ink',
                  ].join(' ')}
                >
                  {label}
                </a>
              )
            })}
          </nav>
        )}

        {/* ── Right side ─────────────────────────────────────────────────── */}
        {isAuthenticated ? (
          /* Logged-in: today progress pill + avatar */
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
              <span className="hidden sm:block text-sm font-medium text-ink">{user?.name}</span>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop auth buttons */}
            <div className="hidden sm:flex items-center gap-1.5 shrink-0">
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

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="sm:hidden rounded-lg p-1.5 text-inkSoft hover:bg-white/70 transition-colors"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </>
        )}
      </div>

      {/* ── Mobile dropdown menu ───────────────────────────────────────────── */}
      {menuOpen && !isAuthenticated && (
        <div className="sm:hidden border-t border-paperLine bg-paper/95 px-4 pt-3 pb-4">

          {/* Section links — only shown on the home page */}
          {isHome && (
            <nav className="space-y-0.5 mb-3">
              {NAV_LINKS.map(({ label, href }) => (
                <a
                  key={href}
                  href={href}
                  onClick={(e) => handleNavClick(e, href)}
                  className={[
                    'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    active === href
                      ? 'bg-pineSoft text-pine'
                      : 'text-inkSoft hover:bg-white/70 hover:text-ink',
                  ].join(' ')}
                >
                  {label}
                </a>
              ))}
            </nav>
          )}

          {/* Auth buttons */}
          <div className="flex gap-2 pt-2 border-t border-paperLine">
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="flex-1 rounded-xl border border-paperLine py-2 text-center text-sm font-semibold text-inkSoft hover:bg-white transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/register"
              onClick={() => setMenuOpen(false)}
              className="flex-1 rounded-xl bg-ember py-2 text-center text-sm font-semibold text-white hover:bg-ember/90 transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
