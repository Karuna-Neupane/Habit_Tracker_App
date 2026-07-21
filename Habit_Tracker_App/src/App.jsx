import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { HabitsProvider } from './context/HabitsContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AppShell from './components/AppShell.jsx'
import Home from './pages/Home.jsx'
import MyHabits from './pages/MyHabits.jsx'
import CalendarPage from './pages/CalendarPage.jsx'
import Analytics from './pages/Analytics.jsx'
import AICoach from './pages/AICoach.jsx'
import Profile from './pages/Profile.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'

export default function App() {
  return (
    // BrowserRouter: parent wrapper that enables routing
    <BrowserRouter>
      <AuthProvider>
        <HabitsProvider>
          <AppShell>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route
                path="/habits"
                element={
                  <ProtectedRoute>
                    <MyHabits />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calendar"
                element={
                  <ProtectedRoute>
                    <CalendarPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ai-coach"
                element={
                  <ProtectedRoute>
                    <AICoach />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppShell>
        </HabitsProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
