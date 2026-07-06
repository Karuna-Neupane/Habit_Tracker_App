import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { HabitsProvider } from './context/HabitsContext.jsx'
import Navbar from './components/Navbar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Stats from './pages/Stats.jsx'

export default function App() {
  return (
    // BrowserRouter: parent wrapper that enables routing 
    <BrowserRouter>
      <HabitsProvider>
        <div className="min-h-screen bg-dotgrid">
          <Navbar />

          <main>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </HabitsProvider>
    </BrowserRouter>
  )
}
