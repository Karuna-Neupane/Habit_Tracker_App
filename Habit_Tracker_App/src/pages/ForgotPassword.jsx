import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'

// Week 5 note: the old version of this page faked password reset entirely
// in the browser (a plaintext "users" table in localStorage). Now that auth
// is a real Express + MongoDB backend, resetting a password means adding a
// dedicated reset-token endpoint and an email step — real work, and out of
// scope for this week's auth build. Until that endpoint exists this page
// just points people back to login/register instead of pretending to work.
export default function ForgotPassword() {
  return (
    <div className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm text-center">
        <div className="mb-6">
          <p className="font-mono text-xs uppercase tracking-widest text-pine">Account recovery</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink">Reset your password</h1>
        </div>

        <div className="rounded-2xl border border-paperLine bg-white/70 p-6 shadow-sm">
          <Mail className="mx-auto mb-3 h-8 w-8 text-pine" aria-hidden="true" />
          <p className="text-sm text-inkSoft leading-relaxed">
            Self-serve password reset isn't wired up yet on this account
            system. If you've forgotten your password, register a new
            account for now, or ask whoever manages the app to reset it for
            you directly in the database.
          </p>
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
