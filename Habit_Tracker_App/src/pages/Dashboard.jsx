// Dashboard — Week 4 update
// Removed the top-level loading spinner and error block.
// HabitList now owns the loading skeleton and error state display,
// so the page header and "Add habit" button are always visible.

import { useState } from 'react'
import { Plus } from 'lucide-react'
import HabitList     from '../components/HabitList.jsx'
import AddHabitForm  from '../components/AddHabitForm.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { useHabits } from '../context/HabitsContext.jsx'

export default function Dashboard() {
  const { habits, loading, error, toggleToday, addHabit, editHabit, deleteHabit } = useHabits()

  const [formOpen,      setFormOpen]      = useState(false)
  const [editingHabit,  setEditingHabit]  = useState(null)
  const [deletingHabit, setDeletingHabit] = useState(null)
  const [formError,     setFormError]     = useState('')

  function openAddForm()        { setEditingHabit(null);   setFormError(''); setFormOpen(true) }
  function openEditForm(habit)  { setEditingHabit(habit);  setFormError(''); setFormOpen(true) }
  function closeForm()          { setFormOpen(false); setEditingHabit(null); setFormError('') }

  async function handleSubmit({ name, frequency }) {
    try {
      if (editingHabit) {
        await editHabit(editingHabit.id, { name, frequency })
      } else {
        await addHabit({ name, frequency })
      }
      closeForm()
    } catch (err) {
      setFormError(err.message)
    }
  }

  function requestDelete(habit)  { setDeletingHabit(habit) }
  function cancelDelete()        { setDeletingHabit(null)  }
  async function confirmDelete() { await deleteHabit(deletingHabit.id); setDeletingHabit(null) }

  const existingNames = habits
    .filter((h) => h.id !== editingHabit?.id)
    .map((h) => h.name)

  return (
    <div>
      {/* Page header — always visible, even while loading */}
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-pine">Your log</p>
          <h1 className="font-display text-3xl font-bold text-ink">Today's Habits</h1>
          <p className="mt-1 text-sm text-inkSoft">
            {loading
              ? 'Fetching your habits from the database…'
              : habits.length === 0
                ? 'Add your first habit to start building a streak.'
                : `${habits.length} habit${habits.length !== 1 ? 's' : ''} tracked`}
          </p>
        </div>
        <button
          onClick={openAddForm}
          disabled={loading}
          className="mt-3 inline-flex items-center gap-2 self-start rounded-xl bg-ember px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-ember/30 hover:bg-ember/90 disabled:opacity-50 transition-colors sm:mt-0 sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add habit
        </button>
      </div>

      {/* HabitList handles skeleton / error / empty / populated states */}
      <HabitList
        habits={habits}
        loading={loading}
        error={error}
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
            ? `"${deletingHabit.name}" and all its history will be removed permanently from the database.`
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
