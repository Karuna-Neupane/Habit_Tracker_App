import { useAuth } from '../context/AuthContext.jsx'
import Navbar from './Navbar.jsx'
import Sidebar from './Sidebar.jsx'
import SimpleFooter from './SimpleFooter.jsx'

// Overall page shell.
// - Signed out: a plain top navbar + full-width content (landing, login, register).
// - Signed in: a full-height sidebar down the left edge (Dashboard / Stats /
//   Log out), with the navbar + routed page + a simple footer filling the
//   rest of the width.
export default function AppShell({ children }) {
  const { isAuthenticated, initializing } = useAuth()

  if (initializing) return null

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-dotgrid">
        <Navbar />
        <main>{children}</main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-dotgrid">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <main className="flex-1">
          <div className="mx-auto max-w-5xl px-4 py-6">{children}</div>
        </main>
        <SimpleFooter />
      </div>
    </div>
  )
}
