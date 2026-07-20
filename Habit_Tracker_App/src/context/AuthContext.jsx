import { createContext, useContext, useEffect, useState } from 'react'
import api, { getToken, setToken } from '../utils/api.js'

// ─── Auth Context — Week 5 ────────────────────────────────────────────────────
// Real backend auth: the server hashes passwords with bcrypt and issues a
// JWT on register/login (see backend/src/controllers/authController.js).
// The token is kept in localStorage and attached to every API request by
// the axios interceptor in utils/api.js. On first load we send whatever
// token we have to GET /api/auth/me to confirm it's still valid and fetch
// the current user, so a refresh doesn't log anyone out.

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(true)

  // Restore session on first load by validating the stored token.
  useEffect(() => {
    const token = getToken()
    if (!token) {
      setInitializing(false)
      return
    }
    api.get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => {
        // Token missing/expired/invalid — clear it and fall back to signed-out.
        setToken(null)
        setUser(null)
      })
      .finally(() => setInitializing(false))
  }, [])

  // ── Register with name + email + password ────────────────────────────────
  async function register({ name, email, password, confirmPassword }) {
    try {
      const { data } = await api.post('/auth/register', { name, email, password, confirmPassword })
      setToken(data.token)
      setUser(data.user)
      return data.user
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message)
    }
  }

  // ── Login with email + password ───────────────────────────────────────────
  async function login({ email, password }) {
    try {
      const { data } = await api.post('/auth/login', { email, password })
      setToken(data.token)
      setUser(data.user)
      return data.user
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message)
    }
  }

  // ── Logout: clear the token so every subsequent request is unauthenticated ─
  function logout() {
    setToken(null)
    setUser(null)
  }

  // ── Forgot password, step 1: email a 6-digit code ────────────────────────
  async function requestPasswordReset(email) {
    try {
      const { data } = await api.post('/auth/forgot-password', { email })
      return data.message
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message)
    }
  }

  // ── Forgot password, step 2: verify the code, get a short-lived reset token ─
  async function verifyResetCode(email, code) {
    try {
      const { data } = await api.post('/auth/verify-reset-code', { email, code })
      return data.resetToken
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message)
    }
  }

  // ── Forgot password, step 3: set the new password, auto-login ────────────
  async function resetPassword(resetToken, password, confirmPassword) {
    try {
      const { data } = await api.post('/auth/reset-password', { resetToken, password, confirmPassword })
      setToken(data.token)
      setUser(data.user)
      return data.user
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message)
    }
  }

  const value = {
    user,
    isAuthenticated: Boolean(user),
    initializing,
    register,
    login,
    logout,
    requestPasswordReset,
    verifyResetCode,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
