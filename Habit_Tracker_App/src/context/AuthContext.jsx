import { createContext, useContext, useEffect, useState } from 'react'
import { sendResetCodeEmail } from '../utils/emailService.js'

// ─── Auth Context ─────────────────────────────────────────────────────────────
// NOTE: This project's backend only has habit endpoints — there's no user/auth
// API yet. So this context keeps a small "users table" and the current
// session in localStorage on the client. It's fine for a demo / learning
// project, but it is NOT secure: passwords are stored in plain text in the
// browser. Before shipping this for real, replace this with a real backend
// (Express + bcrypt + JWT/sessions, or an auth provider like Auth0/Firebase).

const USERS_KEY   = 'habitTracker.users'
const SESSION_KEY = 'habitTracker.session'
const RESET_KEY   = 'habitTracker.passwordReset'

const RESET_CODE_TTL_MS = 10 * 60 * 1000 // 10 minutes

const AuthContext = createContext(null)

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || []
  } catch {
    return []
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY))
  } catch {
    return null
  }
}

function loadResetRequest() {
  try {
    return JSON.parse(localStorage.getItem(RESET_KEY))
  } catch {
    return null
  }
}

function saveResetRequest(req) {
  if (req) {
    localStorage.setItem(RESET_KEY, JSON.stringify(req))
  } else {
    localStorage.removeItem(RESET_KEY)
  }
}

function generateCode() {
  // 6-digit numeric code, zero-padded
  return String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0')
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [initializing, setInitializing] = useState(true)

  // Restore session on first load
  useEffect(() => {
    setUser(loadSession())
    setInitializing(false)
  }, [])

  function persistSession(sessionUser) {
    setUser(sessionUser)
    if (sessionUser) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
    } else {
      localStorage.removeItem(SESSION_KEY)
    }
  }

  // ── Register with email + password ──────────────────────────────────────
  function register({ name, email, password }) {
    const users = loadUsers()
    const exists = users.some(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    )
    if (exists) {
      throw new Error('An account with that email already exists.')
    }

    const newUser = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password, // demo only — never store raw passwords in a real app
    }
    users.push(newUser)
    saveUsers(users)

    const { password: _pw, ...publicUser } = newUser
    persistSession(publicUser)
    return publicUser
  }

  // ── Login with email + password ─────────────────────────────────────────
  function login({ email, password }) {
    const users = loadUsers()
    const match = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    )
    if (!match || match.password !== password) {
      throw new Error('Incorrect email or password.')
    }
    const { password: _pw, ...publicUser } = match
    persistSession(publicUser)
    return publicUser
  }

  function logout() {
    persistSession(null)
  }

  // ── Forgot password: step 1 — request a code ─────────────────────────────
  // Finds the account, generates a 6-digit code, and emails it. If no real
  // email service is configured (see utils/emailService.js), returns the
  // code directly so the UI can show it in a "demo mode" banner instead.
  async function requestPasswordReset(email) {
    const users = loadUsers()
    const match = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    )
    if (!match) {
      throw new Error('No account found with that email.')
    }

    const code = generateCode()
    saveResetRequest({
      email: match.email,
      code,
      expiresAt: Date.now() + RESET_CODE_TTL_MS,
      verified: false,
    })

    const result = await sendResetCodeEmail({
      toEmail: match.email,
      toName: match.name,
      code,
    })

    return result // { demo: true, code } or { demo: false }
  }

  // ── Forgot password: step 2 — verify the code ─────────────────────────────
  function verifyResetCode(email, code) {
    const req = loadResetRequest()
    if (
      !req ||
      req.email !== email.trim().toLowerCase() ||
      req.code !== code.trim()
    ) {
      throw new Error('That code is incorrect.')
    }
    if (Date.now() > req.expiresAt) {
      throw new Error('That code has expired. Request a new one.')
    }
    saveResetRequest({ ...req, verified: true })
    return true
  }

  // ── Forgot password: step 3 — set the new password ───────────────────────
  function resetPassword(email, newPassword) {
    const req = loadResetRequest()
    if (!req || req.email !== email.trim().toLowerCase() || !req.verified) {
      throw new Error('Please verify your code again.')
    }

    const users = loadUsers()
    const match = users.find((u) => u.email === req.email)
    if (!match) {
      throw new Error('No account found with that email.')
    }
    if (newPassword === match.password) {
      throw new Error('New password must be different from your old password.')
    }

    match.password = newPassword
    saveUsers(users)
    saveResetRequest(null) // consume the reset request
    return true
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
