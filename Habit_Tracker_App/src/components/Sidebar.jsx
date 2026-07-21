import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, ListChecks, CalendarDays, BarChart2, Bot, User, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import ConfirmDialog from './ConfirmDialog.jsx'

export default function Sidebar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [confirmingLogout, setConfirmingLogout] = useState(false)

  const links = [
    { to: '/',           label: 'Dashboard', Icon: Home },
    { to: '/habits',     label: 'My Habits', Icon: ListChecks },
    { to: '/calendar',   label: 'Calendar',  Icon: CalendarDays },
    { to: '/analytics',  label: 'Analytics', Icon: BarChart2 },
    { to: '/ai-coach',   label: 'AI Coach',  Icon: Bot },
    { to: '/profile',    label: 'Profile',   Icon: User },
  ]

  function confirmLogout() {
    setConfirmingLogout(false)
    logout()
    navigate('/')
  }

  return (
    <>
      <aside className="w-full shrink-0 border-b border-paperLine bg-paper sm:min-h-[calc(100vh-73px)] sm:w-56 sm:border-b-0 sm:border-r">
        <nav className="flex gap-1 overflow-x-auto p-3 sm:sticky sm:top-[73px] sm:flex sm:h-[calc(100vh-73px)] sm:flex-col sm:gap-1 sm:overflow-visible sm:p-4">
          {links.map(({ to, label, Icon }) => {
            const active = pathname === to
            return (
              <Link
                key={to}
                to={to}
                className={[
                  'flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-pineSoft text-pine'
                    : 'text-inkSoft hover:bg-white/60 hover:text-ink',
                ].join(' ')}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </Link>
            )
          })}

          <div className="my-1 hidden h-px bg-paperLine sm:mt-auto sm:block" />

          <button
            onClick={() => setConfirmingLogout(true)}
            className="flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-inkSoft transition-colors hover:bg-emberSoft hover:text-ember"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Log out
          </button>
        </nav>
      </aside>

      <ConfirmDialog
        open={confirmingLogout}
        title="Log out?"
        message="You'll need to log in again to access your habits."
        confirmLabel="Log out"
        cancelLabel="Stay logged in"
        danger
        onConfirm={confirmLogout}
        onCancel={() => setConfirmingLogout(false)}
      />
    </>
  )
}
