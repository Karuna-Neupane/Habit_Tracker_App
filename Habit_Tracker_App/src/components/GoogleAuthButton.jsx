import { useState } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext.jsx'

// The official Google "G" mark, reproduced in flat SVG so the button can be
// fully custom-styled (no dependency on Google's own button chrome).
function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.85.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.97 10.71a5.4 5.4 0 0 1 0-3.42V4.96H.96a9 9 0 0 0 0 8.08l3.01-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
    </svg>
  )
}

// "Continue with Google" — used on both Login and Register.
// This is a fully custom button (not Google's stock widget). It uses the
// OAuth "implicit" flow to get an access token in the browser, then hands
// that off to AuthContext.loginWithGoogle(), which posts it to
// POST /api/auth/google — the backend verifies it against Google and
// finds-or-creates the account, so this one component covers both "sign up
// with Google" and "log in with Google".
export default function GoogleAuthButton({ onSuccess, onError }) {
  const { loginWithGoogle } = useAuth()
  const [busy, setBusy] = useState(false)

  const startGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      if (!tokenResponse?.access_token) {
        onError?.('Google did not return an access token. Please try again.')
        setBusy(false)
        return
      }
      try {
        const user = await loginWithGoogle(tokenResponse.access_token)
        onSuccess?.(user)
      } catch (err) {
        onError?.(err.message)
      } finally {
        setBusy(false)
      }
    },
    onError: () => {
      onError?.('Google sign-in was cancelled or failed. Please try again.')
      setBusy(false)
    },
  })

  return (
    <div className="w-full">
      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-paperLine" />
        <span className="text-xs font-medium uppercase tracking-widest text-inkSoft">or</span>
        <div className="h-px flex-1 bg-paperLine" />
      </div>

      <button
        type="button"
        disabled={busy}
        onClick={() => {
          setBusy(true)
          startGoogleLogin()
        }}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-paperLine bg-white px-4 py-2.5 text-sm font-semibold text-ink shadow-sm transition-colors hover:bg-paper disabled:opacity-60"
      >
        <GoogleIcon />
        {busy ? 'Connecting…' : 'Continue with Google'}
      </button>
    </div>
  )
}
