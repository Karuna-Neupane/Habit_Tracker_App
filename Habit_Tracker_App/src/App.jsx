import { useEffect, useState } from 'react'
import HabitList from './components/HabitList.jsx'
import HabitFormModal from './components/AddHabitForm.jsx'
import ConfirmDialog from './components/ConfirmDialog.jsx'
import { loadHabits, saveHabits, makeId } from './utils/storage.js'

export default function App() {
  // Starts empty on first-ever visit. After that, whatever is in
  // localStorage is restored (and re-validated — see storage.js), so
  // habits persist across refreshes.
  const [habits, setHabits] = useState(() => loadHabits())
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingHabitId, setEditingHabitId] = useState(null)
  const [habitPendingDeleteId, setHabitPendingDeleteId] = useState(null)

  // Any time the habits list changes (add, edit, delete, tick), save it.
  useEffect(() => {
    saveHabits(habits)
  }, [habits])

  function openAddForm() {
    setEditingHabitId(null)
    setIsFormOpen(true)
  }

  function openEditForm(habitId) {
    setEditingHabitId(habitId)
    setIsFormOpen(true)
  }

  function closeForm() {
    setIsFormOpen(false)
    setEditingHabitId(null)
  }

  // Used for both creating a new habit and saving edits to an existing one.
  // Validation already happened inside the modal before this is called.
  function handleSubmitHabit({ name, frequency }) {
    if (editingHabitId) {
      setHabits((prev) =>
        prev.map((habit) =>
          habit.id === editingHabitId ? { ...habit, name, frequency } : habit
        )
      )
    } else {
      const newHabit = {
        id: makeId(),
        name,
        frequency,
        streak: 0,
        ticks: [false, false, false, false, false, false, false],
      }
      setHabits((prev) => [...prev, newHabit])
    }
  }

  // Delete is a two-step flow: clicking the trash icon just opens the
  // confirmation popup; the actual removal happens in confirmDelete().
  function requestDeleteHabit(habitId) {
    setHabitPendingDeleteId(habitId)
  }

  function cancelDelete() {
    setHabitPendingDeleteId(null)
  }

  function confirmDelete() {
    setHabits((prev) => prev.filter((h) => h.id !== habitPendingDeleteId))
    setHabitPendingDeleteId(null)
  }

  function handleToggleToday(habitId) {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== habitId) return habit
        const ticks = [...habit.ticks]
        const last = ticks.length - 1
        const wasDone = ticks[last]
        ticks[last] = !wasDone
        const streak = wasDone ? Math.max(habit.streak - 1, 0) : habit.streak + 1
        return { ...habit, ticks, streak }
      })
    )
  }

  const editingHabit = habits.find((h) => h.id === editingHabitId) ?? null
  const habitPendingDelete =
    habits.find((h) => h.id === habitPendingDeleteId) ?? null

  // Names of every OTHER habit, for duplicate-name validation in the modal.
  const existingNames = habits
    .filter((h) => h.id !== editingHabitId)
    .map((h) => h.name)

  return (
    <div className="min-h-screen bg-dotgrid-paper">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-ink">
              Habit Tracker
            </h1>
          </div>
          <button
            onClick={openAddForm}
            className="mt-3 inline-flex items-center gap-2 self-start rounded-lg bg-ember px-4 py-2 text-sm font-semibold text-white hover:bg-ember/90 sm:mt-0 sm:self-auto"
          >
            <span aria-hidden="true">+</span> Add habit
          </button>
        </header>

        <main className="mt-8">
          <HabitList
            habits={habits}
            onToggleToday={handleToggleToday}
            onEdit={openEditForm}
            onDelete={requestDeleteHabit}
          />
        </main>
      </div>

      <HabitFormModal
        open={isFormOpen}
        onClose={closeForm}
        onSubmit={handleSubmitHabit}
        editingHabit={editingHabit}
        existingNames={existingNames}
      />

      <ConfirmDialog
        open={Boolean(habitPendingDelete)}
        title="Delete this habit?"
        message={
          habitPendingDelete
            ? `"${habitPendingDelete.name}" and its streak history will be removed. This can't be undone.`
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
