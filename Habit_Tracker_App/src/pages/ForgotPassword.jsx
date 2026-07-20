import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, KeyRound, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

// ─── Forgot Password — Week 5 ──────────────────────────────────────────────
// Real 3-step flow backed by the Express API:
//   1. STEP_EMAIL    -> POST /api/auth/forgot-password    (emails a 6-digit code)
//   2. STEP_CODE     -> POST /api/auth/verify-reset-code   (returns a resetToken)
//   3. STEP_PASSWORD -> POST /api/auth/reset-password      (sets password, logs in)
//
// Step 3 succeeding means the backend already returned a normal login JWT
// (see authController.resetPassword), so AuthContext.resetPassword sets the
// session exactly like a login — we just navigate to "/", which renders the
// Dashboard for an authenticated user.

const STEP_EMAIL    = 'email'
const STEP_CODE     = 'code'
const STEP_PASSWORD = 'password'

const RESEND_COOLDOWN_SECONDS = 30

const STEPS = [
  { key: STEP_EMAIL,    label: 'Email' },
  { key: STEP_CODE,     label: 'Code' },
  { key: STEP_PASSWORD, label: 'New password' },
]

export default function ForgotPassword() {
  const { requestPasswordReset, verifyResetCode, resetPassword } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [step, setStep] = useState(STEP_EMAIL)

  const [email, setEmail]   = useState(location.state?.email || '')
  const [code, setCode]     = useState('')
  const [resetToken, setResetToken] = useState('')

  const [password, setPassword]         = useState('')
  const [confirm, setConfirm]           = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)

  const [error, setError]         = useState('')
  const [info, setInfo]           = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const cooldownTimer = useRef(null)
  useEffect(() => () => clearInterval(cooldownTimer.current), [])

  function startResendCooldown() {
    setResendCooldown(RESEND_COOLDOWN_SECONDS)
    clearInterval(cooldownTimer.current)
    cooldownTimer.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownTimer.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // ── Step 1: request the code ────────────────────────────────────────────
  async function handleRequestCode(e) {
    e.preventDefault()
    setError('')
    if (!email.trim()) {
      setError('Please enter your registered email.')
      return
    }

    setSubmitting(true)
    try {
      const message = await requestPasswordReset(email.trim())
      setInfo(message || 'If that email is registered, a code has been sent.')
      setStep(STEP_CODE)
      startResendCooldown()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Resend the code without leaving step 2 ──────────────────────────────
  async function handleResend() {
    if (resendCooldown > 0 || submitting) return
    setError('')
    setSubmitting(true)
    try {
      const message = await requestPasswordReset(email.trim())
      setInfo(message || 'A new code has been sent.')
      startResendCooldown()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Step 2: verify the code ─────────────────────────────────────────────
  async function handleVerifyCode(e) {
    e.preventDefault()
    setError('')
    if (!/^\d{6}$/.test(code.trim())) {
      setError('Enter the 6-digit code from your email.')
      return
    }

    setSubmitting(true)
    try {
      const token = await verifyResetCode(email.trim(), code.trim())
      setResetToken(token)
      setInfo('')
      setStep(STEP_PASSWORD)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Step 3: set the new password, then land on the dashboard ───────────
  async function handleResetPassword(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      await resetPassword(resetToken, password, confirm)
      navigate('/', { replace: true }) // authenticated -> renders the Dashboard
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const stepIndex = STEPS.findIndex((s) => s.key === step)

  return (
    <div className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-pine">Account recovery</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink">Reset your password</h1>
        </div>

        {/* Step indicator */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                  i < stepIndex
                    ? 'bg-pine text-white'
                    : i === stepIndex
                      ? 'bg-ember text-white'
                      : 'bg-paperLine text-inkSoft'
                }`}
              >
                {i < stepIndex ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className="h-px w-6 bg-paperLine" aria-hidden="true" />}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-paperLine bg-white/70 p-6 shadow-sm">
          {error && (
            <div className="mb-4 rounded-lg border border-ember/30 bg-emberSoft px-3 py-2 text-sm text-ember">
              {error}
            </div>
          )}
          {info && !error && (
            <div className="mb-4 rounded-lg border border-pine/30 bg-pineSoft px-3 py-2 text-sm text-pine">
              {info}
            </div>
          )}

          {/* ── Step 1: email ──────────────────────────────────────────── */}
          {step === STEP_EMAIL && (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div className="mb-1 flex items-center gap-2 text-ink">
                <Mail className="h-4 w-4 text-pine" aria-hidden="true" />
                <p className="text-sm">Enter your registered email and we'll send you a 6-digit code.</p>
              </div>
              <div>
                <label htmlFor="reset-email" className="mb-1 block text-sm font-medium text-ink">
                  Email
                </label>
                <input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  autoFocus
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
                {submitting ? 'Sending code…' : 'Send reset code'}
              </button>
            </form>
          )}

          {/* ── Step 2: code ───────────────────────────────────────────── */}
          {step === STEP_CODE && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="mb-1 flex items-center gap-2 text-ink">
                <KeyRound className="h-4 w-4 text-pine" aria-hidden="true" />
                <p className="text-sm">Enter the 6-digit code sent to <span className="font-semibold">{email}</span>.</p>
              </div>
              <div>
                <label htmlFor="reset-code" className="mb-1 block text-sm font-medium text-ink">
                  Verification code
                </label>
                <input
                  id="reset-code"
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full rounded-xl border border-paperLine bg-paper px-3 py-2.5 text-center text-lg tracking-[0.5em] text-ink outline-none focus:border-pine"
                  placeholder="000000"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-ember px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-ember/30 transition-colors hover:bg-ember/90 disabled:opacity-60"
              >
                {submitting ? 'Verifying…' : 'Verify code'}
              </button>
              <div className="flex items-center justify-between text-xs text-inkSoft">
                <button
                  type="button"
                  onClick={() => { setStep(STEP_EMAIL); setError(''); setInfo('') }}
                  className="flex items-center gap-1 font-semibold text-pine hover:underline"
                >
                  <ArrowLeft className="h-3 w-3" aria-hidden="true" /> Change email
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || submitting}
                  className="font-semibold text-pine hover:underline disabled:cursor-not-allowed disabled:text-inkSoft disabled:no-underline"
                >
                  {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : 'Resend code'}
                </button>
              </div>
            </form>
          )}

          {/* ── Step 3: new password ──────────────────────────────────── */}
          {step === STEP_PASSWORD && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="mb-1 flex items-center gap-2 text-ink">
                <Lock className="h-4 w-4 text-pine" aria-hidden="true" />
                <p className="text-sm">Code verified — choose a new password.</p>
              </div>

              <div>
                <label htmlFor="new-password" className="mb-1 block text-sm font-medium text-ink">
                  New password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-paperLine bg-paper px-3 py-2.5 pr-10 text-sm text-ink outline-none focus:border-pine"
                    placeholder="At least 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-inkSoft hover:text-ink"
                  >
                    {showPassword
                      ? <EyeOff className="h-4 w-4" aria-hidden="true" />
                      : <Eye className="h-4 w-4" aria-hidden="true" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium text-ink">
                  Confirm new password
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full rounded-xl border border-paperLine bg-paper px-3 py-2.5 pr-10 text-sm text-ink outline-none focus:border-pine"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((prev) => !prev)}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    aria-pressed={showConfirm}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-inkSoft hover:text-ink"
                  >
                    {showConfirm
                      ? <EyeOff className="h-4 w-4" aria-hidden="true" />
                      : <Eye className="h-4 w-4" aria-hidden="true" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-ember px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-ember/30 transition-colors hover:bg-ember/90 disabled:opacity-60"
              >
                {submitting ? 'Saving…' : 'Reset password & log in'}
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-inkSoft">
          Remembered your password?{' '}
          <Link to="/login" className="font-semibold text-pine hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
