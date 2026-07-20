import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Mail, KeyRound, Lock, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const STEP_EMAIL = 'email'
const STEP_CODE = 'code'
const STEP_NEW_PASSWORD = 'newPassword'
const STEP_DONE = 'done'

export default function ForgotPassword() {
  const { requestPasswordReset, verifyResetCode, resetPassword } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [step, setStep] = useState(STEP_EMAIL)
  const [email, setEmail] = useState(location.state?.email || '')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [demoCode, setDemoCode] = useState(null) // shown when no email service is configured

  // ── Step 1: request a code ─────────────────────────────────────────────
  async function handleRequestCode(e) {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter your registered email.')
      return
    }

    setSubmitting(true)
    try {
      const result = await requestPasswordReset(email)
      if (result.demo) {
        setDemoCode(result.code)
      } else {
        setDemoCode(null)
      }
      setStep(STEP_CODE)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Step 2: verify the code ────────────────────────────────────────────
  function handleVerifyCode(e) {
    e.preventDefault()
    setError('')

    if (!code.trim()) {
      setError('Please enter the code from your email.')
      return
    }

    try {
      verifyResetCode(email, code)
      setStep(STEP_NEW_PASSWORD)
    } catch (err) {
      setError(err.message)
    }
  }

  // ── Step 3: set the new password ───────────────────────────────────────
  function handleSetNewPassword(e) {
    e.preventDefault()
    setError('')

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      resetPassword(email, newPassword)
      setStep(STEP_DONE)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-pine">Account recovery</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink">Reset your password</h1>
        </div>

        <div className="rounded-2xl border border-paperLine bg-white/70 p-6 shadow-sm">
          {error && (
            <div className="mb-4 rounded-lg border border-ember/30 bg-emberSoft px-3 py-2 text-sm text-ember">
              {error}
            </div>
          )}

          {/* ── Step 1: email ──────────────────────────────────────────── */}
          {step === STEP_EMAIL && (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div className="flex items-start gap-2 text-sm text-inkSoft">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-pine" aria-hidden="true" />
                <p>Enter the email you registered with — we'll send a verification code there.</p>
              </div>

              <div>
                <label htmlFor="reset-email" className="mb-1 block text-sm font-medium text-ink">
                  Registered email
                </label>
                <input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-paperLine bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-pine"
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-ember px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-ember/30 transition-colors hover:bg-ember/90 disabled:opacity-60"
              >
                {submitting ? 'Sending code…' : 'Send verification code'}
              </button>
            </form>
          )}

          {/* ── Step 2: code ───────────────────────────────────────────── */}
          {step === STEP_CODE && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="flex items-start gap-2 text-sm text-inkSoft">
                <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-pine" aria-hidden="true" />
                <p>
                  We sent a 6-digit code to <span className="font-medium text-ink">{email}</span>.
                  Enter it below.
                </p>
              </div>

              {demoCode && (
                <div className="rounded-lg border border-pine/30 bg-pineSoft px-3 py-2 text-xs text-pine">
                  <span className="font-semibold">Demo mode:</span> no email service is configured yet, so
                  nothing was actually sent. Your code is{' '}
                  <span className="font-mono font-bold">{demoCode}</span>.
                </div>
              )}

              <div>
                <label htmlFor="reset-code" className="mb-1 block text-sm font-medium text-ink">
                  Verification code
                </label>
                <input
                  id="reset-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                  className="w-full rounded-xl border border-paperLine bg-paper px-3 py-2.5 text-center text-lg font-mono tracking-[0.3em] text-ink outline-none focus:border-pine"
                  placeholder="••••••"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-ember px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-ember/30 transition-colors hover:bg-ember/90"
              >
                Verify code
              </button>

              <button
                type="button"
                onClick={() => setStep(STEP_EMAIL)}
                className="w-full text-center text-xs font-medium text-inkSoft hover:text-ink"
              >
                Use a different email
              </button>
            </form>
          )}

          {/* ── Step 3: new password ──────────────────────────────────────── */}
          {step === STEP_NEW_PASSWORD && (
            <form onSubmit={handleSetNewPassword} className="space-y-4">
              <div className="flex items-start gap-2 text-sm text-inkSoft">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-pine" aria-hidden="true" />
                <p>Create a new password. It can't be the same as your old one.</p>
              </div>

              <div>
                <label htmlFor="new-password" className="mb-1 block text-sm font-medium text-ink">
                  New password
                </label>
                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-paperLine bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-pine"
                  placeholder="At least 6 characters"
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium text-ink">
                  Confirm new password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-paperLine bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-pine"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-ember px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-ember/30 transition-colors hover:bg-ember/90"
              >
                Update password
              </button>
            </form>
          )}

          {/* ── Step 4: done ───────────────────────────────────────────── */}
          {step === STEP_DONE && (
            <div className="space-y-4 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-pine" aria-hidden="true" />
              <p className="font-display text-lg font-semibold text-ink">Password updated</p>
              <p className="text-sm text-inkSoft">
                You can now log in with your new password.
              </p>
              <button
                onClick={() => navigate('/login', { replace: true })}
                className="w-full rounded-xl bg-ember px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-ember/30 transition-colors hover:bg-ember/90"
              >
                Go to login
              </button>
            </div>
          )}
        </div>

        {step !== STEP_DONE && (
          <p className="mt-6 text-center text-sm text-inkSoft">
            Remembered your password?{' '}
            <Link to="/login" className="font-semibold text-pine hover:underline">
              Log in
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
