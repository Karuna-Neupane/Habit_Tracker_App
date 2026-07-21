// My Habits — Week 6
// Full CRUD (add / edit / delete / complete today), plus search, a
// daily/weekly filter, and sorting. HabitList/HabitCard render the actual
// cards; this page owns the controls and the derived, filtered list.

import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import HabitList     from '../components/HabitList.jsx'
import AddHabitForm  from '../components/AddHabitForm.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { useHabits } from '../context/HabitsContext.jsx'
import { completionRate30, longestStreakEver } from '../utils/streak.js'

const FILTERS = [
  { key: 'all',    label: 'All'    },
  { key: 'daily',  label: 'Daily'  },
  { key: 'weekly', label: 'Weekly' },
]

const SORTS = [
  { key: 'newest',     label: 'Newest first'        },
  { key: 'oldest',     label: 'Oldest first'        },
  { key: 'name',       label: 'Name (A–Z)'          },
  { key: 'streak',     label: 'Current streak'      },
  { key: 'longest',    label: 'Longest streak'      },
  { key: 'completion', label: 'Completion %'        },
]

export default function MyHabits() {
  const { habits, loading, error, toggleToday, addHabit, editHabit, deleteHabit } = useHabits()

  const [formOpen,      setFormOpen]      = useState(false)
  const [editingHabit,  setEditingHabit]  = useState(null)
  const [deletingHabit, setDeletingHabit] = useState(null)
  const [formError,     setFormError]     = useState('')

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort,   setSort]   = useState('newest')

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

  // Search -> filter -> sort, recomputed only when an input actually changes.
  const visibleHabits = useMemo(() => {
    let list = habits

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((h) => h.name.toLowerCase().includes(q))
    }

    if (filter !== 'all') {
      list = list.filter((h) => h.frequency === filter)
    }

    const withDerived = list.map((h) => ({
      ...h,
      _longest: longestStreakEver(h.completions, h.frequency),
      _rate:    completionRate30(h.completions),
    }))

    switch (sort) {
      case 'oldest':     return [...withDerived].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      case 'name':       return [...withDerived].sort((a, b) => a.name.localeCompare(b.name))
      case 'streak':     return [...withDerived].sort((a, b) => b.streak - a.streak)
      case 'longest':    return [...withDerived].sort((a, b) => b._longest - a._longest)
      case 'completion': return [...withDerived].sort((a, b) => b._rate - a._rate)
      case 'newest':
      default:           return [...withDerived].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }
  }, [habits, search, filter, sort])

  return (
    <div>
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-pine">Your log</p>
          <h1 className="font-display text-3xl font-bold text-ink">My Habits</h1>
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

      {/* Controls: search, filter, sort */}
      {!loading && habits.length > 0 && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-inkSoft" aria-hidden="true" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search habits…"
              className="w-full rounded-xl border border-paperLine bg-white/70 py-2 pl-9 pr-3 text-sm text-ink outline-none focus:border-pine"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Daily/Weekly filter */}
            <div className="flex rounded-xl border border-paperLine bg-white/70 p-0.5">
              {FILTERS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={[
                    'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                    filter === key ? 'bg-pineSoft text-pine' : 'text-inkSoft hover:text-ink',
                  ].join(' ')}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-xl border border-paperLine bg-white/70 px-3 py-2 text-xs font-medium text-ink outline-none focus:border-pine"
            >
              {SORTS.map(({ key, label }) => (
                <option key={key} value={key}>Sort: {label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* No search/filter results (habits exist, but none match) */}
      {!loading && !error && habits.length > 0 && visibleHabits.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-paperLine p-12 text-center">
          <p className="text-3xl mb-2">🔍</p>
          <p className="font-display font-semibold text-ink">No habits match your search</p>
          <p className="mt-1 text-sm text-inkSoft">Try a different keyword or filter.</p>
        </div>
      ) : (
        <HabitList
          habits={visibleHabits}
          loading={loading}
          error={error}
          onToggleToday={toggleToday}
          onEdit={openEditForm}
          onDelete={requestDelete}
        />
      )}

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
