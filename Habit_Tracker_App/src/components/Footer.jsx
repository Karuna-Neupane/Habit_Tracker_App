import { Link } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'

// Shared site footer. Product links point to "/#section" (not bare "#section")
// so they work correctly from any page, not just the homepage — clicking one
// from Login/Register navigates home first, then to that section.
export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-paperLine bg-paper/80 py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-pine text-white">
                <ClipboardList className="h-4 w-4" aria-hidden="true" />
              </div>
              <span className="font-display text-base font-bold text-ink">Habit Tracker</span>
            </div>
            <p className="text-sm text-inkSoft leading-relaxed max-w-xs">
              A full-stack habit tracking application with AI coaching, streak monitoring,
              and progress analytics. Built to help you build long-term discipline.
            </p>
            <div className="flex gap-2 mt-4">
              <Link to="/register" className="rounded-lg bg-ember px-4 py-2 text-xs font-semibold text-white hover:bg-ember/90 transition-colors">
                Register
              </Link>
              <Link to="/login" className="rounded-lg border border-paperLine px-4 py-2 text-xs font-semibold text-inkSoft hover:bg-white transition-colors">
                Login
              </Link>
            </div>
          </div>

          {/* Product */}
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-inkSoft mb-3">Product</p>
            <ul className="space-y-2">
              {[
                { label: 'Features', href: '/#features' },
                { label: 'AI Coach', href: '/#ai-coach' },
                { label: 'How it works', href: '/#how-it-works' },
                { label: 'About', href: '/#about' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link to={href} className="text-sm text-inkSoft hover:text-ink transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-inkSoft mb-3">Account</p>
            <ul className="space-y-2">
              <li><Link to="/register" className="text-sm text-inkSoft hover:text-ink transition-colors">Create account</Link></li>
              <li><Link to="/login" className="text-sm text-inkSoft hover:text-ink transition-colors">Sign in</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-paperLine pt-6">
          <div className="grid grid-cols-1 items-center gap-2 text-xs text-inkSoft md:grid-cols-[1fr_2fr_1fr]">

            {/* Left */}
            <p className="text-center md:text-left whitespace-nowrap">
              © {year} Habitra.
            </p>

            {/* Center */}
            <p className="text-center whitespace-nowrap">
              Built with React, Tailwind CSS, Node.js, Express, MongoDB, JWT and Gemini API.
            </p>

            {/* Right */}
            <p className="text-center font-mono whitespace-nowrap md:text-right">
              Track · Streak · Improve
            </p>

          </div>
        </div>
      </div>
    </footer>
  )
}
