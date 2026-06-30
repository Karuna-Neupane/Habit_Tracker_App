import { useEffect, useRef, useState } from 'react'
import {
  NAME_MAX_LENGTH,
  sanitizeName,
  validateFrequency,
  validateHabitName,
} from '../utils/validation.js'

export default function HabitFormModal({
  open,
  onClose,
  onSubmit,
  editingHabit,
  existingNames = [],
}) {
  const [name, setName] = useState('')
  const [frequency, setFrequency] = useState('daily')
  const [error, setError] = useState('')
  const nameInputRef = useRef(null)

  const isEditing = Boolean(editingHabit)

  // Reset/prefill the fields every time the modal opens.
  useEffect(() => {
    if (!open) return
    setName(editingHabit?.name ?? '')
    setFrequency(editingHabit?.frequency ?? 'daily')
    setError('')
    // Focus the name field once the modal is in the DOM.
    const focusTimer = setTimeout(() => nameInputRef.current?.focus(), 0)
    return () => clearTimeout(focusTimer)
  }, [open, editingHabit])

  // Escape closes the modal, same as the AddHabitForm/ConfirmDialog convention.
  useEffect(() => {
    if (!open) return
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  function handleSubmit(e) {
    e.preventDefault()

    const nameError = validateHabitName(name, existingNames)
    if (nameError) {
      setError(nameError)
      return
    }
    const frequencyError = validateFrequency(frequency)
    if (frequencyError) {
      setError(frequencyError)
      return
    }

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
        aria-labelledby="habit-form-title"
        className="w-full max-w-sm rounded-xl bg-paper p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="habit-form-title"
          className="font-display text-lg font-semibold text-ink"
        >
          {isEditing ? 'Edit habit' : 'New habit'}
        </h2>
        <p className="mt-1 text-sm text-inkSoft">
          {isEditing
            ? 'Update the name or frequency.'
            : 'Small and specific habits are easier to keep.'}
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
          <div>
            <div className="flex items-baseline justify-between">
              <label
                htmlFor="habit-name"
                className="block text-sm font-medium text-ink"
              >
                Habit name
              </label>
              <span className="font-mono text-[11px] text-inkSoft">
                {remaining} left
              </span>
            </div>
            <input
              ref={nameInputRef}
              id="habit-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (error) setError('')
              }}
              maxLength={NAME_MAX_LENGTH}
              autoComplete="off"
              placeholder="e.g. Stretch for 10 minutes"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'habit-name-error' : undefined}
              className={[
                'mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm text-ink outline-none',
                error ? 'border-ember' : 'border-paperLine focus:border-pine',
              ].join(' ')}
            />
            {error && (
              <p id="habit-name-error" role="alert" className="mt-1 text-xs text-ember">
                {error}
              </p>
            )}
          </div>

          <div>
            <span className="block text-sm font-medium text-ink">
              Frequency
            </span>
            <div className="mt-1 flex gap-2" role="radiogroup" aria-label="Frequency">
              {['daily', 'weekly'].map((freq) => (
                <button
                  key={freq}
                  type="button"
                  role="radio"
                  aria-checked={frequency === freq}
                  onClick={() => setFrequency(freq)}
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
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-paperLine py-2 text-sm font-semibold text-inkSoft hover:bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-ink py-2 text-sm font-semibold text-paper hover:bg-ink/90"
            >
              {isEditing ? 'Save changes' : 'Add habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
