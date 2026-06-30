import { useEffect, useState } from 'react'
import HabitList from './components/HabitList.jsx'
import HabitFormModal from './components/AddHabitForm.jsx'
import ConfirmDialog from './components/ConfirmDialog.jsx'
import { loadHabits, saveHabits, makeId } from './utils/storage.js'
import { computeStreak, todayKey } from './utils/streak.js'

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

  // --- Week 2: streak integrity check on load -----------------------------
  // A habit's `streak` is never the source of truth — `completions` is.
  // If the app was closed for a few days, the cached streak number could
  // be stale (e.g. it still says "5" even though the user missed two
  // days). On every app load, recompute every habit's streak fresh from
  // its completion history so broken streaks reset to the correct value
  // immediately, before the user sees anything.
  useEffect(() => {
    setHabits((prev) => {
      let changed = false
      const next = prev.map((habit) => {
        const correctStreak = computeStreak(habit.completions, habit.frequency)
        if (correctStreak !== habit.streak) {
          changed = true
          return { ...habit, streak: correctStreak }
        }
        return habit
      })
      return changed ? next : prev
    })
    // Runs once on mount, deliberately — this is a load-time integrity
    // check, not something that should re-run on every habits change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
          habit.id === editingHabitId
            ? {
                ...habit,
                name,
                frequency,
                // Frequency change can change what counts as a streak
                // (daily vs weekly), so recompute it from history.
                streak: computeStreak(habit.completions, frequency),
              }
            : habit
        )
      )
    } else {
      const newHabit = {
        id: makeId(),
        name,
        frequency,
        completions: [],
        streak: 0,
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

  // --- Week 2: toggle today + live streak recompute ------------------------
  function handleToggleToday(habitId) {
    const today = todayKey()
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== habitId) return habit

        const alreadyDone = habit.completions.includes(today)
        const completions = alreadyDone
          ? habit.completions.filter((date) => date !== today)
          : [...habit.completions, today].sort()

        return {
          ...habit,
          completions,
          streak: computeStreak(completions, habit.frequency),
        }
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
            <p className="font-mono text-xs uppercase tracking-widest text-pine">
              Your log
            </p>
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
