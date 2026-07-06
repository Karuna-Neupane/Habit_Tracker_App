import { useEffect, useRef, useState } from 'react'
import {
  NAME_MAX_LENGTH,
  sanitizeName,
  validateFrequency,
  validateHabitName,
} from '../utils/validation.js'

export default function AddHabitForm({
  open,
  onClose,
  onSubmit,
  editingHabit = null,
  existingNames = [],
  serverError = '',   // error message returned from the backend (e.g. duplicate name)
}) {
  // Controlled component state 
  const [name, setName] = useState('')
  const [frequency, setFrequency] = useState('daily')
  const [nameError, setNameError] = useState('')
  const [freqError, setFreqError] = useState('')
  const nameInputRef = useRef(null)

  const isEditing = Boolean(editingHabit)

  // Re-populate fields each time the modal opens (for edit mode)
  useEffect(() => {
    if (!open) return
    setName(editingHabit?.name ?? '')
    setFrequency(editingHabit?.frequency ?? 'daily')
    setNameError('')
    setFreqError('')
    // Auto-focus the name field (controlled component + accessibility)
    const t = setTimeout(() => nameInputRef.current?.focus(), 0)
    return () => clearTimeout(t)
  }, [open, editingHabit])

  // Escape closes the modal (same as ConfirmDialog convention)
  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); onClose() }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  // Form submission
  function handleSubmit(e) {
    e.preventDefault()   // stop browser page reload

    const nameErr = validateHabitName(name, existingNames)
    const freqErr = validateFrequency(frequency)

    setNameError(nameErr)
    setFreqError(freqErr)

    if (nameErr || freqErr) return

    onSubmit({ name: sanitizeName(name), frequency })
    onClose()
  }

  const remaining = NAME_MAX_LENGTH - name.length

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="hform-title"
        className="w-full max-w-sm rounded-2xl bg-paper p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="hform-title" className="font-display text-lg font-semibold text-ink">
          {isEditing ? 'Edit habit' : 'New habit'}
        </h2>
        <p className="mt-0.5 text-sm text-inkSoft">
          {isEditing
            ? 'Update the name or frequency.'
            : 'Small, specific habits are easier to keep.'}
        </p>

        {/* Controlled form (Tutorial PDF, "Handling form submission") */}
        <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">

          {/* Name field */}
          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor="hf-name" className="block text-sm font-medium text-ink">
                Habit name
              </label>
              <span
                className={[
                  'font-mono text-[11px]',
                  remaining < 10 ? 'text-ember' : 'text-inkSoft',
                ].join(' ')}
              >
                {remaining} left
              </span>
            </div>
            <input
              ref={nameInputRef}
              id="hf-name"
              type="text"
              value={name}                                      // binds state to input value
              onChange={(e) => {                                // updates state on keystroke
                setName(e.target.value)
                if (nameError) setNameError('')
              }}
              maxLength={NAME_MAX_LENGTH}
              autoComplete="off"
              spellCheck
              placeholder="e.g. Stretch for 10 minutes"
              aria-invalid={Boolean(nameError)}
              aria-describedby={nameError ? 'hf-name-err' : undefined}
              className={[
                'mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors',
                nameError
                  ? 'border-ember focus:border-ember'
                  : 'border-paperLine focus:border-pine',
              ].join(' ')}
            />
            {nameError && (
              <p id="hf-name-err" role="alert" className="mt-1 text-xs text-ember">
                {nameError}
              </p>
            )}
          </div>

          {/* Frequency toggle (radiogroup pattern)*/}
          <div>
            <span className="block text-sm font-medium text-ink">Frequency</span>
            <div
              className="mt-1 flex gap-2"
              role="radiogroup"
              aria-label="Frequency"
            >
              {['daily', 'weekly'].map((freq) => (
                <button
                  key={freq}
                  type="button"
                  role="radio"
                  aria-checked={frequency === freq}
                  onClick={() => { setFrequency(freq); setFreqError('') }}
                  className={[
                    'flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors',
                    frequency === freq
                      ? 'border-pine bg-pineSoft text-pine'
                      : 'border-paperLine bg-white text-inkSoft hover:border-pine/50',
                  ].join(' ')}
                >
                  {freq}
                </button>
              ))}
            </div>
            {freqError && (
              <p role="alert" className="mt-1 text-xs text-ember">{freqError}</p>
            )}
          </div>

          {/* Server-side error (e.g. duplicate name from API) */}
          {serverError && (
            <p role="alert" className="rounded-lg bg-emberSoft px-3 py-2 text-xs text-ember">
              {serverError}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-paperLine py-2.5 text-sm font-semibold text-inkSoft hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-ink py-2.5 text-sm font-semibold text-paper hover:bg-ink/85 transition-colors"
            >
              {isEditing ? 'Save changes' : 'Add habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
