import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in every field.')
      return
    }
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
      register({ name, email, password })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-pine">Get started</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink">Create your account</h1>
          <p className="mt-2 text-sm text-inkSoft">
            Start tracking habits and building streaks today.
          </p>
        </div>

        <div className="rounded-2xl border border-paperLine bg-white/70 p-6 shadow-sm">
          {error && (
            <div className="mb-4 rounded-lg border border-ember/30 bg-emberSoft px-3 py-2 text-sm text-ember">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-ink">
                Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-paperLine bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-pine"
                placeholder="Ram Bahadur"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-paperLine bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-pine"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-paperLine bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-pine"
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label htmlFor="confirm" className="mb-1 block text-sm font-medium text-ink">
                Confirm password
              </label>
              <input
                id="confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-xl border border-paperLine bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-pine"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-ember px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-ember/30 transition-colors hover:bg-ember/90 disabled:opacity-60"
            >
              {submitting ? 'Creating account…' : 'Register'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-inkSoft">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-pine hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
