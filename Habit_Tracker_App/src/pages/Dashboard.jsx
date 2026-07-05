import { useState } from 'react'
import HabitList    from '../components/HabitList.jsx'
import AddHabitForm from '../components/AddHabitForm.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { useHabits }  from '../context/HabitsContext.jsx'

export default function Dashboard() {
  // Context: habits data + actions (no prop drilling)
  const { habits, toggleToday, addHabit, editHabit, deleteHabit } = useHabits()

  // Local UI state (useState) 
  const [formOpen,      setFormOpen]      = useState(false)
  const [editingHabit,  setEditingHabit]  = useState(null) // habit object | null
  const [deletingHabit, setDeletingHabit] = useState(null) // habit object | null

  // Handlers
  function openAddForm()       { setEditingHabit(null); setFormOpen(true) }
  function openEditForm(habit) { setEditingHabit(habit); setFormOpen(true) }
  function closeForm()         { setFormOpen(false); setEditingHabit(null) }

  function handleSubmit({ name, frequency }) {
    if (editingHabit) {
      editHabit(editingHabit.id, { name, frequency })
    } else {
      addHabit({ name, frequency })
    }
  }

  function requestDelete(habit) { setDeletingHabit(habit) }
  function cancelDelete()       { setDeletingHabit(null)  }
  function confirmDelete()      { deleteHabit(deletingHabit.id); setDeletingHabit(null) }

  // Existing names for duplicate validation (exclude the habit being edited)
  const existingNames = habits
    .filter((h) => h.id !== editingHabit?.id)
    .map((h) => h.name)

  // Render 
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">

      {/* Page header */}
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

        {/* Add habit button — onClick event handler (Tutorial PDF) */}
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

      {/* Habit grid */}
      <HabitList
        habits={habits}
        onToggleToday={toggleToday}
        onEdit={openEditForm}
        onDelete={requestDelete}
      />

      {/* Add / Edit modal */}
      <AddHabitForm
        open={formOpen}
        onClose={closeForm}
        onSubmit={handleSubmit}
        editingHabit={editingHabit}
        existingNames={existingNames}
      />

      {/* Delete confirmation popup (replaces window.confirm) */}
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
