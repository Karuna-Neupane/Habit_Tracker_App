import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { HabitsProvider } from './context/HabitsContext.jsx'
import Navbar    from './components/Navbar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Stats     from './pages/Stats.jsx'

export default function App() {
  return (
    // BrowserRouter: parent wrapper that enables routing (Tutorial PDF)
    <BrowserRouter>
      {/* HabitsProvider wraps everything so Context is available everywhere */}
      <HabitsProvider>
        <div className="min-h-screen bg-dotgrid">
          {/* Navbar uses <Link> — no page refresh on navigation */}
          <Navbar />

          {/* Routes: finds the matching Route for the current URL */}
          <main>
            <Routes>
              <Route path="/"      element={<Dashboard />} />
              <Route path="/stats" element={<Stats />}     />
              {/* Catch-all: redirect unknown paths to Dashboard */}
              <Route path="*"      element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </HabitsProvider>
    </BrowserRouter>
  )
}
