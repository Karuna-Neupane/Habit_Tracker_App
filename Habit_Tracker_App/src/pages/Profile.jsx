// Profile — Week 6
// Avatar (stored as a small client-resized data URL, no cloud storage
// needed), an editable name, read-only email, a separate change-
// password form, computed account statistics, and a danger-zone account
// deletion flow that requires re-entering the password.

import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Camera, User, Mail, KeyRound, Trash2, Eye, EyeOff,
  CheckCircle2, ListTodo, Flame, Trophy, CalendarClock,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useHabits } from '../context/HabitsContext.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { longestStreakEver, completionRate30 } from '../utils/streak.js'

// Resize/compress an uploaded image client-side before turning it into a
// data URL — keeps the document small since it's stored directly on the
// User document in MongoDB (no file storage service in this project).
function resizeImageToDataUrl(file, maxSize = 256, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read that file.'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Could not read that image.'))
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

function StatPill({ label, value, Icon }) {
  return (
    <div className="rounded-2xl border border-paperLine bg-white/70 p-4">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs uppercase tracking-wide text-inkSoft">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-ember" aria-hidden="true" />}
      </div>
      <p className="mt-1 font-display text-2xl font-bold text-ink">{value}</p>
    </div>
  )
}

export default function Profile() {
  const { user, updateProfile, changePassword, deleteAccount, logout } = useAuth()
  const { habits } = useHabits()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  // ── Profile fields ─────────────────────────────────────────────────────
  const [name, setName] = useState(user?.name || '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')

  // ── Password fields ─────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)

  // ── Delete account ──────────────────────────────────────────────────────
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [deleting, setDeleting] = useState(false)

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setProfileError('Please choose an image file.')
      return
    }
    try {
      const dataUrl = await resizeImageToDataUrl(file)
      setAvatarUrl(dataUrl)
    } catch (err) {
      setProfileError(err.message)
    }
  }

  async function handleProfileSubmit(e) {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')
    setProfileSaving(true)
    try {
      await updateProfile({ name, avatarUrl })
      setProfileSuccess('Profile updated.')
    } catch (err) {
      setProfileError(err.message)
    } finally {
      setProfileSaving(false)
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.')
      return
    }
    if (newPassword === currentPassword) {
      setPasswordError('New password must be different from your current password.')
      return
    }

    setPasswordSaving(true)
    try {
      await changePassword({ currentPassword, newPassword, confirmNewPassword })
      setPasswordSuccess('Password changed successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (err) {
      setPasswordError(err.message)
    } finally {
      setPasswordSaving(false)
    }
  }

  async function handleDeleteAccount() {
    setDeleteError('')
    setDeleting(true)
    try {
      await deleteAccount(deletePassword)
      navigate('/', { replace: true })
    } catch (err) {
      setDeleteError(err.message)
      setDeleting(false)
    }
  }

  // ── Account statistics (derived, never stored separately) ───────────────
  const totalHabits = habits.length
  const totalCompletions = habits.reduce((sum, h) => sum + (h.completions?.length || 0), 0)
  const longestOverall = habits.reduce((max, h) => Math.max(max, longestStreakEver(h.completions, h.frequency)), 0)
  const avgRate30 = totalHabits
    ? Math.round(habits.reduce((sum, h) => sum + completionRate30(h.completions), 0) / totalHabits)
    : 0
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : '—'

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-pine">Account</p>
        <h1 className="font-display text-3xl font-bold text-ink">Profile</h1>
      </div>

      {/* ── Profile details ──────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-paperLine bg-white/70 p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="h-16 w-16 rounded-full object-cover border border-paperLine" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pineSoft text-xl font-semibold text-pine">
                {name?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Change profile picture"
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-ember text-white shadow-sm hover:bg-ember/90 transition-colors"
            >
              <Camera className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-ink">{user?.name}</p>
            <p className="text-sm text-inkSoft">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          {profileError && (
            <div className="rounded-lg border border-ember/30 bg-emberSoft px-3 py-2 text-sm text-ember">{profileError}</div>
          )}
          {profileSuccess && (
            <div className="rounded-lg border border-pine/30 bg-pineSoft px-3 py-2 text-sm text-pine">{profileSuccess}</div>
          )}

          <div>
            <label htmlFor="profile-name" className="mb-1 flex items-center gap-1.5 text-sm font-medium text-ink">
              <User className="h-3.5 w-3.5 text-pine" aria-hidden="true" /> Name
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setProfileSuccess('') }}
              className="w-full rounded-xl border border-paperLine bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-pine"
            />
          </div>

          <div>
            <label htmlFor="profile-email" className="mb-1 flex items-center gap-1.5 text-sm font-medium text-ink">
              <Mail className="h-3.5 w-3.5 text-pine" aria-hidden="true" /> Email
            </label>
            <input
              id="profile-email"
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-paperLine bg-paperLine/30 px-3 py-2.5 text-sm text-inkSoft outline-none"
            />
            <p className="mt-1 text-xs text-inkSoft">Email can't be changed here — it's tied to your login.</p>
          </div>

          <button
            type="submit"
            disabled={profileSaving}
            className="rounded-xl bg-ember px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-ember/30 hover:bg-ember/90 disabled:opacity-60 transition-colors"
          >
            {profileSaving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </section>

      {/* ── Account statistics ───────────────────────────────────────────── */}
      <section className="mb-6">
        <h2 className="mb-3 font-display text-lg font-semibold text-ink">Account statistics</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatPill label="Habits" value={totalHabits} Icon={ListTodo} />
          <StatPill label="Completions" value={totalCompletions} Icon={CheckCircle2} />
          <StatPill label="Best streak" value={longestOverall} Icon={Trophy} />
          <StatPill label="30-day avg" value={`${avgRate30}%`} Icon={Flame} />
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-inkSoft">
          <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" /> Member since {memberSince}
        </p>
      </section>

      {/* ── Change password ─────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-paperLine bg-white/70 p-6 mb-6">
        <h2 className="mb-1 flex items-center gap-1.5 font-display text-base font-semibold text-ink">
          <KeyRound className="h-4 w-4 text-pine" aria-hidden="true" /> Change password
        </h2>
        <p className="mb-4 text-xs text-inkSoft">Enter your current password to set a new one.</p>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {passwordError && (
            <div className="rounded-lg border border-ember/30 bg-emberSoft px-3 py-2 text-sm text-ember">{passwordError}</div>
          )}
          {passwordSuccess && (
            <div className="rounded-lg border border-pine/30 bg-pineSoft px-3 py-2 text-sm text-pine">{passwordSuccess}</div>
          )}

          <div>
            <label htmlFor="current-password" className="mb-1 block text-sm font-medium text-ink">Current password</label>
            <div className="relative">
              <input
                id="current-password"
                type={showCurrentPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-xl border border-paperLine bg-paper px-3 py-2.5 pr-10 text-sm text-ink outline-none focus:border-pine"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showCurrentPassword}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-inkSoft hover:text-ink"
              >
                {showCurrentPassword
                  ? <EyeOff className="h-4 w-4" aria-hidden="true" />
                  : <Eye className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="new-password2" className="mb-1 block text-sm font-medium text-ink">New password</label>
            <div className="relative">
              <input
                id="new-password2"
                type={showNewPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-paperLine bg-paper px-3 py-2.5 pr-10 text-sm text-ink outline-none focus:border-pine"
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showNewPassword}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-inkSoft hover:text-ink"
              >
                {showNewPassword
                  ? <EyeOff className="h-4 w-4" aria-hidden="true" />
                  : <Eye className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="confirm-new-password" className="mb-1 block text-sm font-medium text-ink">Confirm new password</label>
            <div className="relative">
              <input
                id="confirm-new-password"
                type={showConfirmNewPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full rounded-xl border border-paperLine bg-paper px-3 py-2.5 pr-10 text-sm text-ink outline-none focus:border-pine"
              />
              <button
                type="button"
                onClick={() => setShowConfirmNewPassword((prev) => !prev)}
                aria-label={showConfirmNewPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showConfirmNewPassword}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-inkSoft hover:text-ink"
              >
                {showConfirmNewPassword
                  ? <EyeOff className="h-4 w-4" aria-hidden="true" />
                  : <Eye className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={passwordSaving}
            className="rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-paper hover:bg-ink/85 disabled:opacity-60 transition-colors"
          >
            {passwordSaving ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </section>

      {/* ── Danger zone: delete account ─────────────────────────────────── */}
      <section className="rounded-2xl border border-ember/30 bg-emberSoft/30 p-6">
        <h2 className="mb-1 flex items-center gap-1.5 font-display text-base font-semibold text-ember">
          <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete account
        </h2>
        <p className="mb-4 text-xs text-inkSoft">
          Permanently deletes your account and every habit you've tracked. This can't be undone.
        </p>
        <button
          type="button"
          onClick={() => { setDeleteOpen(true); setDeleteError(''); setDeletePassword('') }}
          className="rounded-xl border border-ember px-4 py-2.5 text-sm font-semibold text-ember hover:bg-ember hover:text-white transition-colors"
        >
          Delete my account
        </button>
      </section>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete your account?"
        message={
          <>
            <p className="mb-3">This permanently deletes your account and all {totalHabits} habit{totalHabits !== 1 ? 's' : ''}. This cannot be undone.</p>
            <label htmlFor="delete-password" className="mb-1 block text-xs font-medium text-ink">Enter your password to confirm</label>
            <input
              id="delete-password"
              type="password"
              autoFocus
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="w-full rounded-lg border border-paperLine bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ember"
            />
            {deleteError && <p className="mt-2 text-xs text-ember">{deleteError}</p>}
          </>
        }
        confirmLabel={deleting ? 'Deleting…' : 'Delete forever'}
        cancelLabel="Cancel"
        danger
        onConfirm={handleDeleteAccount}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  )
}
