import { useState } from 'react'
import HabitList from '../components/HabitList.jsx'
import AddHabitForm from '../components/AddHabitForm.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { useHabits } from '../context/HabitsContext.jsx'

export default function Dashboard() {
  const { habits, loading, error, toggleToday, addHabit, editHabit, deleteHabit } = useHabits()

  const [formOpen, setFormOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)
  const [deletingHabit, setDeletingHabit] = useState(null)
  const [formError, setFormError] = useState('')

  function openAddForm() { setEditingHabit(null); setFormError(''); setFormOpen(true) }
  function openEditForm(habit) { setEditingHabit(habit); setFormError(''); setFormOpen(true) }
  function closeForm() { setFormOpen(false); setEditingHabit(null); setFormError('') }

  async function handleSubmit({ name, frequency }) {
    try {
      if (editingHabit) {
        await editHabit(editingHabit.id, { name, frequency })
      } else {
        await addHabit({ name, frequency })
      }
      closeForm()
    } catch (err) {
      // Surface server-side errors (e.g. duplicate name) inside the modal
      setFormError(err.message)
    }
  }

  function requestDelete(habit) { setDeletingHabit(habit) }
  function cancelDelete() { setDeletingHabit(null) }
  async function confirmDelete() {
    await deleteHabit(deletingHabit.id)
    setDeletingHabit(null)
  }

  const existingNames = habits
    .filter(h => h.id !== editingHabit?.id)
    .map(h => h.name)

  // Loading state 
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-paperLine border-t-pine" />
          <p className="mt-3 text-sm text-inkSoft">Loading habits…</p>
        </div>
      </div>
    )
  }

  // API error state
  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="rounded-2xl border border-ember/30 bg-emberSoft p-6 text-center">
          <p className="text-2xl mb-2">⚠️</p>
          <p className="font-display font-semibold text-ink">Could not reach the server</p>
          <p className="mt-1 text-sm text-inkSoft">{error}</p>
          <p className="mt-2 text-xs text-inkSoft">
            Make sure the backend is running: <code className="font-mono bg-white/60 px-1 rounded">cd backend && npm run dev</code>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">

      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-pine">Your log</p>
          <h1 className="font-display text-3xl font-bold text-ink">Today's Habits</h1>
          <p className="mt-1 text-sm text-inkSoft">
            {habits.length === 0
              ? 'Add your first habit to start building a streak.'
              : `${habits.length} habit${habits.length !== 1 ? 's' : ''} tracked`}
          </p>
        </div>
        <button
          onClick={openAddForm}
          className="mt-3 inline-flex items-center gap-2 self-start rounded-xl bg-ember px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-ember/30 hover:bg-ember/90 transition-colors sm:mt-0 sm:self-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add habit
        </button>
      </div>

      <HabitList
        habits={habits}
        onToggleToday={toggleToday}
        onEdit={openEditForm}
        onDelete={requestDelete}
      />

      <AddHabitForm
        open={formOpen}
        onClose={closeForm}
        onSubmit={handleSubmit}
        editingHabit={editingHabit}
        existingNames={existingNames}
        serverError={formError}
      />

      <ConfirmDialog
        open={Boolean(deletingHabit)}
        title="Delete this habit?"
        message={
          deletingHabit
            ? `"${deletingHabit.name}" and all its history will be removed permanently.`
            : ''
        }
        confirmLabel="Delete"
        cancelLabel="Keep habit"
        danger
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  )
}
